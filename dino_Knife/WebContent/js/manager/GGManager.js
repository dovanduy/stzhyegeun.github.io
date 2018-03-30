var EAdType = {
	BANNER		: 1,	
	INTERSTITIAL: 2, 
	NATIVE		: 3,
	REWARDED	: 4
};

var EAdUserAction = {
		//광고 팝업창이 떳을 때
		ACTION_SHOW 	: "show",
		//광고 시작을 클릭 했을 때
		ACTION_CLICK	: "click",
		//광고를 다봤을 때
		ACTION_CONFIRM	: "confirm",
};

/**
 * 애드매니저 주요기능
 * 
 * 1. 유저를 N개의 광고 그룹으로 나눔
 * 2. 광고 노출 확률에 따라 광고 여부 결정
 * 3. 하루 노출 제한 횟수에 따라 광고 여부 결정
 * 4. 광고를 다시 보여주는데 필요한 쿨타임 관리
 * 
 * <UseCase>
 * 1. 유저 접속
 * 2. ServerId를 토대로 Grouping
 * 3. Interstitial / Rewarded 광고 정보 객체 초기화
 * 4. 보상형 광고는 항상 preload
 * 5. 
 * 
 * 
 */
function GGManager_proto () {
	StzLog.assert(window.FBInstant, "[GGManager] FBInstnat SDK required!!");
	
	this._interstitial = {};
	this._interstitial_ad_info = {};
	this._interstitial_video = {};
	
	this._rewarded = {};
	this._reward_ad_info = {};
	this._reward_video = {};
	
	/**
	 * 초기 광고 로드
	 */
	this.init = function(inGame) {
		if(FBInstant === undefined || FBInstant === null){
			return;
		}
		
		this.game = inGame;
		if(this.game.device.desktop === true){
			return;
		}
		
		if(StzBuildConfig.SERVER_MODE === EServerMode.DEV){
			return;
		}
		
		this.isEnableByNameDic = {};
		
		this.isEnableByNameDic[EAdName.REWARD_GET_CHARACTER] = (StaticManager.dino_thornz_base.get('reward_get_character_enable') ? StaticManager.dino_thornz_base.get('reward_get_character_enable').value : 0);
		this.isEnableByNameDic[EAdName.REWARD_SKIP] = (StaticManager.dino_thornz_base.get('reward_skip_enable') ? StaticManager.dino_thornz_base.get('reward_skip_enable').value : 0);
		this.isEnableByNameDic[EAdName.REWARD_CONTINUE] = (StaticManager.dino_thornz_base.get('reward_continue_enable') ? StaticManager.dino_thornz_base.get('reward_continue_enable').value : 0);
		this.isEnableByNameDic[EAdName.INTERSTITIAL_INGAME_RESTART] = (StaticManager.dino_thornz_base.get('interstitial_restart_enable') ? StaticManager.dino_thornz_base.get('interstitial_restart_enable').value : 0);

		//보상형 광고
		if(this._reward_ad_info === undefined || this._reward_ad_info === null){
			this._reward_ad_info = {
					reward_get_character : {'name' : 'reward_get_character'},
					reward_skip			 : {'name' : 'reward_skip'},
					reward_continue		 : {'name' : 'reward_continue'}
			}
		}
		
		for (var index = 0; index < AdConfig.REWARDED_NAME_LIST.length; index++) {
			var rewAdName = AdConfig.REWARDED_NAME_LIST[index];
			
			if(this.isEnableByNameDic[rewAdName] === 0 ){
				this._rewarded[rewAdName] = null;
			}
			else{
				if(!this._reward_ad_info[rewAdName]){
					this._reward_ad_info[rewAdName] = {"name" : AdConfig.REWARDED_NAME_LIST[index]};
				}
				
				this._rewarded[rewAdName] =  new AdModel(EAdType.REWARDED, AdConfig.REWARDED_NAME_LIST[index], this.game); 
			}
		}
		
		for (var index = 0; index < AdConfig.REWARDED_ID_LIST.length; index++) {
			this._reward_video[AdConfig.REWARDED_ID_LIST[index]] = new adVideoModel(EAdType.REWARDED, AdConfig.REWARDED_ID_LIST[index]);
			this._reward_video[AdConfig.REWARDED_ID_LIST[index]].load(EAdType.REWARDED, AdConfig.REWARDED_ID_LIST[index]);
		}
		
		
		//전면 광고
		if(this._interstitial_ad_info === undefined || this._interstitial_ad_info === null){
			this._interstitial_ad_info = {
					"interstitial_ingame_restart": {"name" : "interstitial_ingame_restart"}
			}
		}
		for (var index = 0; index < AdConfig.INTERSTITIAL_NAME_LIST.length; index++) {
			var interAdName = AdConfig.INTERSTITIAL_NAME_LIST[index];
			
			if(this.isEnableByNameDic[interAdName] === 0 ){
				this._interstitial[interAdName] = null;
			}
			else{
				if(!this._interstitial_ad_info[interAdName]){
					this._interstitial_ad_info[interAdName] = {"name" : AdConfig.INTERSTITIAL_NAME_LIST[index]};
				}
				
				this._interstitial[interAdName] =  new AdModel(EAdType.INTERSTITIAL, AdConfig.INTERSTITIAL_NAME_LIST[index], this.game); 
			}
		}
		
		for (var index = 0; index < AdConfig.INTERSTITIAL_ID_LIST.length; index++) {
			this._interstitial_video[AdConfig.INTERSTITIAL_ID_LIST[index]] = new adVideoModel(EAdType.INTERSTITIAL ,AdConfig.INTERSTITIAL_ID_LIST[index]);
			this._interstitial_video[AdConfig.INTERSTITIAL_ID_LIST[index]].load(EAdType.INTERSTITIAL, AdConfig.INTERSTITIAL_ID_LIST[index]);
		}
	};
	
	/**
	 * 콜백 들록
	 */
	this.setCallbackByPlacementID = function(inName, inCompleteCallback, inLoadComleteCallBack, inLoadFailCallBack){
		var adModel = (this._isRewardAd(inName) === true)? this._rewarded : this._interstitial;
		
		if(adModel[inName]){
			//광고 완료 콜백
			adModel[inName].setCompleteCallback(inCompleteCallback);
			//광고 로드 완료 콜백
			adModel[inName].setLoadComleteCallBack(inLoadComleteCallBack);
			//광고 로드 실패 콜백
			adModel[inName].setLoadFailCallBack(inLoadFailCallBack);
		}
	};
	
	/**
	 * 로그 전송 
	 */
	this.adLogSend = function(inAdType, inAdName, inAction){
		Server.setAdLog(inAdType, inAdName, inAction, function(){
			StzLog.print("[GGManager] Name : "+inAdName+", Action : " + inAction + " : Success");
		}.bind(this), function(){
			StzLog.print("[GGManager] Name : "+inAdName+", Action : " + inAction + " : Fail");
		}.bind(this));
	};
	
	/**
	 * PlacementId를 통해 광고 객체 반환
	 */
	this.getAdModelByPlacementID = function(inAdType, inName){
		if(inAdType === EAdType.INTERSTITIAL){
			if(this._interstitial[inName] === undefined || this._interstitial[inName] === null){
				return null;
			}
			return this._interstitial[inName];
		}
		else{
			if(this._rewarded[inName] === undefined || this._rewarded[inName] === null){
				return null;
			}
			return this._rewarded[inName];
		}
		
		//로컬테스트
//		this._rewarded[EAdName.REWARDED_UPGRADE_NAME] =  new AdModel(EAdType.REWARDED, this._reward_ad_info[EAdName.REWARDED_UPGRADE_NAME].time, 
//				this._reward_ad_info[EAdName.REWARDED_UPGRADE_NAME].count, this.game);
//		return this._rewarded[EAdName.REWARDED_UPGRADE_NAME];
	};
	
	this.show = function(inAdName) {
		var currentAd = null;

		var adModel = (this._isRewardAd(inAdName) === true)?  this._rewarded : this._interstitial;
		var adVideo = (this._isRewardAd(inAdName) === true)?  this._reward_video : this._interstitial_video;
		var adIdList = (this._isRewardAd(inAdName) === true)?  AdConfig.REWARDED_ID_LIST : AdConfig.INTERSTITIAL_ID_LIST;
		
		currentAd = adModel[inAdName];
		
		if (!currentAd) {
			StzLog.print("[GGManager] ad : not undefined");
			return;
		}
		
		var isLoadSuccess = false;
		var loadCompleteAdVideoModel = null;
		
		//REWARDED_ID_LIST 있는 광고 중에 로딩이 완료 되어있는 부분 탐색
		for (var index = 0; index < adIdList.length; index++) {
			if(adVideo[adIdList[index]].getLoadState() === ELoadState.AD_LOAD_SUCCESS){
				//로딩 완료 광고가 있을 경우 isLoadSuccess = true
				loadCompleteAdVideoModel = adVideo[adIdList[index]];
				isLoadSuccess = true;
				break;
			}
		}
		
		if(isLoadSuccess === true){
			if(currentAd.getLoadComleteCallBack()){
				currentAd.getLoadComleteCallBack()();
				this.game.paused = true;
				window.sounds.toggleMusic(true);
				//로딩이 완료된 광고 Show
				currentAd.show(loadCompleteAdVideoModel);
			}
		}
		else{
			//로딩이 완료된 광고가 없을 경우 재 로딩 시도
			var isLoading = false;
			
			for (var index = 0; index < adIdList.length; index++) {
				if(adVideo[adIdList[index]].getLoadState() === ELoadState.AD_LOADING){
					isLoading = true;
					continue;
				}
				adVideo[adIdList[index]].load();
			}
			
			if(isLoading === true){
				return;
			}
			
			if(adModel[inAdName].getLoadFailCallBack()){
				adModel[inAdName].getLoadFailCallBack()();
			}
		}
	};

	this._isRewardAd = function(inAdName){
		if(AdConfig.REWARDED_NAME_LIST.indexOf(inAdName) !== -1){
			return true;
		}
		return false;
	};
}
	
var GGManager = new GGManager_proto();

ELoadState = {
		AD_LOADING 			: "AD_LOADING",
		AD_LOAD_SUCCESS 	: "AD_LOAD_SUCCESS",
		AD_LOAD_FAIL		: "AD_LOAD_FAIL",
		AD_COMPLETE			: "AD_COMPLETE"
};

function adVideoModel(inAdType, inPlacementId) {
	var _obj = {
			type  : inAdType,
			state : null,
			adInstance:null,
			placementID : inPlacementId
	}
	
	this.setAdInstancee = function(inAdInstance) {
		_obj.adInstance = inAdInstance;
	};
	
	this.getAdInstance = function() {
		return _obj.adInstance;
	};
	
	this.getLoadState = function() {
		return _obj.state;
	};
	
	this.setLoadedState = function(inValue) {
		_obj.state = inValue;
	};

	this.load = function() {
		if(_obj.type === EAdType.REWARDED){
			return this._loadRewarded();
		}
		else if(_obj.type === EAdType.INTERSTITIAL){
			return this._loadInterstitial();
		}
	};

	this._loadInterstitial = function() {
		if (AdConfig.INTERSTITIAL_ID_LIST.indexOf(_obj.placementID) < 0) {
			return ;
		}

		if(_obj.state === ELoadState.AD_LOAD_SUCCESS || _obj.state === ELoadState.AD_LOADING){
			StzLog.print("[GGManager] load Success or loading");
			return;
		}
		
		StzLog.print("[GGManager] _obj.placementID : " +  _obj.placementID);
		FBInstant.getInterstitialAdAsync(_obj.placementID).then(function(rewardedVideo) {
			_obj.adInstance = rewardedVideo;
			_obj.state = ELoadState.AD_LOADING;
			this._loadAsync();
		}.bind(this))
		.catch(function(e) {
			if(e.code === FBErrorCode.ADS_TOO_MANY_INSTANCES){
				this._loadAsync();
				return;
			}
			_obj.state = ELoadState.AD_LOAD_FAIL;
			StzLog.print(JSON.stringify(e));
		}.bind(this));
	};
	
	this._loadRewarded = function() {
		if (AdConfig.REWARDED_ID_LIST.indexOf(_obj.placementID) < 0 && AdConfig.INTERSTITIAL_ID_LIST.indexOf(_obj.placementID) < 0) {
			return ;
		}

		if(_obj.state === ELoadState.AD_LOAD_SUCCESS || _obj.state === ELoadState.AD_LOADING){
			StzLog.print("[GGManager] load Success or loading");
			return;
		}
		
		StzLog.print("[GGManager] _obj.placementID : " +  _obj.placementID);
		FBInstant.getRewardedVideoAsync(_obj.placementID).then(function(rewardedVideo) {
			_obj.adInstance = rewardedVideo;
			_obj.state = ELoadState.AD_LOADING;
			this._loadAsync();
		}.bind(this))
		.catch(function(e) {
			if(e.code === FBErrorCode.ADS_TOO_MANY_INSTANCES){
				this._loadAsync();
				return;
			}
			_obj.state = ELoadState.AD_LOAD_FAIL;
			StzLog.print(JSON.stringify(e));
		}.bind(this));
	};
	
	this._loadAsync = function(){
		if(_obj.adInstance){
			_obj.adInstance.loadAsync()	
			.then(function(){
				StzLog.print("[GGManager] loadAsync.then : success");
				_obj.state = ELoadState.AD_LOAD_SUCCESS;				
			}.bind(this))
			.catch(function(e) {
				if(e){
					StzLog.print(JSON.stringify(e));
				} 
				_obj.state = ELoadState.AD_LOAD_FAIL;
			}.bind(this));
		}
	};
};

function AdModel(inAdType, inName, inGame) {
	var _obj = {
		type				: inAdType, 
		//광고 로드 관련 상태
		loadState 			: null,
		
		//로그에 찍히는 이름 부분
		name  				: inName,
		//동영상 시청 완료 콜백
		completeCallback	: null,
		//동영상 로드 완료 콜백
		loadComleteCallBack	: null,
		//동영상 로드 실패 콜백	
		loadFailCallBack	: null
	};
	
	this.game = inGame;
	this.getType = function() {
		return _obj.type;
	};
	
	this.getName = function() {
		return _obj.name;
	};
	
	this.setCompleteCallback = function(inFunction) {
		_obj.completeCallback = inFunction;
	};
	
	this.getCompleteCallback = function() {
		return _obj.completeCallback;
	};
	
	this.setLoadComleteCallBack = function(inFunction) {
		_obj.loadComleteCallBack = inFunction;
	};
	
	this.getLoadComleteCallBack = function() {
		return _obj.loadComleteCallBack;
	};
	
	this.setLoadFailCallBack = function(inFunction) {
		_obj.loadFailCallBack = inFunction;
	};
	
	this.getLoadFailCallBack = function() {
		return _obj.loadFailCallBack;
	};

	this.show = function(inAdVedioModel) {
		(function() {
			StzLog.print("[GGManager] show Start");
			if(inAdVedioModel.getAdInstance()){
				return inAdVedioModel.getAdInstance().showAsync();
			}
			else{
				StzLog.print("[GGManager] show Stop");
			}
			
		}.bind(this))().then(function() {
			_obj.lastPlayTime = (new Date()).getTime();
			_obj.count++;
			inAdVedioModel.setLoadedState(ELoadState.AD_COMPLETE);
			this.game.paused = false;
			window.sounds.toggleMusic(false);
			if (_obj.completeCallback) {
				_obj.completeCallback(true);
			}

			StzLog.print("[GGManager] show : success");
			//광고 완료했을때 로그 전송 부분
			//광고 다 봤을때 로그 전송
			GGManager.adLogSend(_obj.type, _obj.name, EAdUserAction.ACTION_CONFIRM);

			//광고 완료 후 저장 하는 부분
//			if(this.game.state.getCurrentState()){
//				var isInGame = ((AdConfig.OUTGAME_NAME_LIST.indexOf(_obj.name) !== -1))? false:true;
//				window.inGameContext.saveData(isInGame);
//			}
			
			inAdVedioModel.load();
		}.bind(this))
		.catch(function(e) {
			inAdVedioModel.setLoadedState(ELoadState.AD_COMPLETE);
			this.game.paused = false;
			window.sounds.toggleMusic(false);
			StzLog.print(JSON.stringify(e));
		}.bind(this));
	};
}