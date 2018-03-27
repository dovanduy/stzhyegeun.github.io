var ESceneState = {
	GO_TITLE_SCENE		: "GO_TITLE_SCENE",
	GO_LOBBY_SCENE 		: 'GO_LOBBY_SCENE',
	GO_INGAME_SCENE 	: 'GO_INGAME_SCENE',
	GO_CHARACTER_SCENE	: 'GO_CHARACTER_SCENE'
};
/**
 * InGame.
 */
function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function(inSceneState, inRestratAdCount, inTryCount) {
	if (inSceneState) {
		this.sceneState = inSceneState;
	}
	else{
		this.sceneState = ESceneState.GO_LOBBY_SCENE;
	}
	if(this.commonScene){
		this.commonScene.destroy(true);
	}
	window.sounds.allStop(true);
	window.sounds.toggleSound(PlayerDataManager.saveData.getSound());
	window.sounds.toggleMusic(PlayerDataManager.saveData.getMusic());
	
	this.restartAdCount = (inRestratAdCount)? inRestratAdCount : 0;
	this.tryCount = (inTryCount)? inTryCount : 0;
};

InGame.prototype.preload = function() {
};

InGame.prototype.create = function () {
	//init
	{
	  //Scene
	  this.commonScene = new CommonScene(this.game);
	  this.showBlindFunc = this.commonScene.showBlind.bind(this.commonScene);
	  this.offBlindFunc = this.commonScene.offBlind.bind(this.commonScene);
	  
	  this.titleScene = null;
	  this.lobbyScene = null;
	  this.gameScene = null;
	  this.resultScene = null;
	  this.pauseScene = null;
	  this.rankScene = null;
	  this.characterScene = null;
	  this.tutorialScene = null;
	  this.sLoadingScene = null;
	  //Model
	  this.targetModel = null;
	  
	  //리스타트 카운트
	  this.restartCount = 0;
	}
	
	//sceneState에 따라 화면 전환
	if(this.sceneState === ESceneState.GO_TITLE_SCENE){
		window.sounds.sound('bgm_lobby').play("", 0, PlayerDataManager.saveData.getMusic(), true);
		this.game.input.enabled = true;
		if(window.FBInstant){
			this.setCanvasFocusState(function() { // checkPausable
				if (InGameController.getIsPlay() === true && InGameController.getIsEnd() === false) {
					this.togglePauseScene(true);
					return true;
				}
				return false;
			}.bind(this), function() { // checkResumable
				return true;
			}.bind(this));
		}

		this.titleScene = new TitleScene(this.game, this.commonScene.fTitleScene);
		this.targetModel = new TargetModel(this.game, this.titleScene.fTargetContainer);
		this.titleScene.createLeafEmitter();
		this.commonScene.updateUIByTilte();
		
		Server.setLog(EServerLogMsg.INIT); 
		if(window.FBInstant){
			FBInstant.logEvent(
					EServerLogMsg.INIT
				);
		}
	}
	else if(this.sceneState === ESceneState.GO_INGAME_SCENE){
		this.targetModel = new TargetModel(this.game, this.commonScene.fGameScene);
		this.createInGameScene(PlayerDataManager.saveData.getBestStage(), true);
	}
	else if(this.sceneState === ESceneState.GO_LOBBY_SCENE){
		window.sounds.sound('bgm_lobby').play("", 0, PlayerDataManager.saveData.getMusic(), true);
		this.lobbyScene = new LobbyScene(this.game, this.commonScene.fLobbyScene);
		this.targetModel = new TargetModel(this.game, this.lobbyScene.fTargetContainer);

		this.commonScene.updateUIByTilte();
		this.switchLobby();
	}
	else if(this.sceneState === ESceneState.GO_CHARACTER_SCENE){
		this.lobbyScene = new LobbyScene(this.game, this.commonScene.fLobbyScene);
		this.targetModel = new TargetModel(this.game, this.lobbyScene.fTargetContainer);
		this.commonScene.updateUIByTilte();
		this.switchLobby();
		
		this.toggleCharacterScene();
	}
	this.addObjectPools();
};

InGame.prototype.update = function () {
	InGameController.update();
};

InGame.prototype.addObjectPools = function() {
	PoolManager.addPool(PoolObjectName.CHARACTER, function(){
		var curID = PlayerDataManager.saveData.getCharacterID();
		var characterData = CharacterManager.getCharacterData(curID);
		var character = this.game.add.sprite(0, 0, 'characterAtlas', characterData.id + ".png", this.gameScene.fCharacterContainer);
		
		character.didLoadView = function(){
			var curID = PlayerDataManager.saveData.getCharacterID();
			var characterData = CharacterManager.getCharacterData(curID);
			this.frameName = characterData.id + ".png";
	
			this.visible = true;
			this.pivot.y = 0;
			this.rotation = 0;
			this.x = this.game.world.width/2;
			this.y = this.game.world.height*0.82;
			this.world.x = this.x;
			this.world.y = this.y;
			
			this.anchor.set(0.5, 0.05);
			this.hitArea = new Phaser.Circle(this.x, this.y, 10);
			this.game.world.updateTransform();

		};
		character.didUnloadView = function(){
			this.visible = false;
		};
		return character;
	}, function(inObject){
		inObject.destroy();
	}, this);
	
	PoolManager.addPool(PoolObjectName.OBSTACLE, function(){
		var obstacle = this.game.add.sprite(0, 0, 'mainAtlas', 'boss_pin.png', this.targetModel.fObstacleContainer);
		obstacle.didLoadView = function(){
			this.visible = true;
		};
		obstacle.didUnloadView = function(){
			this.visible = false;
		};
		return obstacle;
	}, function(inObject){
		inObject.destroy();
	}, this);
	
	PoolManager.addPool(PoolObjectName.COIN, function(){
		var coin = this.game.add.sprite(0, 0, 'mainAtlas', 'common_coin.png', this.targetModel.fCoinContainer);
		coin.didLoadView = function(){
			this.visible = true;
		};
		coin.didUnloadView = function(){
			this.visible = false;
		};
		return coin;
	}, function(inObject){
		inObject.destroy();
	}, this);
	
	PoolManager.addPool(PoolObjectName.COLLIDER, function(){
		var collider = this.game.add.graphics(0, 0, this.targetModel.fColliderContainer);
		collider.didLoadView = function(){
			this.visible = true;
		};
		collider.didUnloadView = function(){
			this.visible = false;
			this.clear();
		};
		return collider;
	}, function(inObject){
		inObject.destroy();
	}, this);
};

InGame.prototype.createInGameScene = function (inStageNum, isRestart) {
	//inGameScene 생성
	window.sounds.allStop(true);
	
	this.game.tweens.removeAll();
	this.game.time.events.removeAll();
	this.game.onPause.removeAll();
	this.game.onResume.removeAll();

	//인게임 진입
	if(isRestart === true){
		loadInGame.call(this);
	}
	else{
		this.commonScene.fadeInBlind(500, this.commonScene.fTopContainer, function(){
			loadInGame.call(this);
		}.bind(this));
	}

	function loadInGame(){
		this.game.input.enabled = true;
		this.commonScene.fadeOutBlind(500, this.commonScene.fTopContainer);
		
		this.commonScene.fOutObjectContainer.visible = false;

		this.commonScene.motionBgInGame(StageManager.getStageData(inStageNum).mode);
		var isTutorial = false;
		
		if(this.targetModel.parent){
			this.targetModel.parent.remove(this.targetModel, false);
		}
		
		if(this.lobbyScene){
			this.lobbyScene.destroy();
			this.lobbyScene = null;
			if(inStageNum === 1){
				isTutorial = true;
			}
		}

		if(this.characterScene){
			this.characterScene.destroy();
		}
		
		if(this.titleScene){
			this.titleScene.visible = false;
			this.titleScene.destroy();
		}

		if(!this.gameScene){
			this.gameScene = new InGameScene(this.game, this.commonScene.fGameScene);
		}
		
		this.gameScene.setData(StageManager.getStageData(inStageNum), this.targetModel, isTutorial);
		this.tryCount++;
		
		if(StageManager.getStageData(inStageNum).mode === 'N'){
			this.commonScene.fBackGround.clear();
			this.commonScene.fBackGround.beginFill(0x03b2a9);
			this.commonScene.fBackGround.drawRect(0, 0, this.game.world.width, this.game.world.height);
			this.commonScene.fAlphaBg.tint = 0x1d6aa0;
		}
		else if(StageManager.getStageData(inStageNum).mode === 'H'){
			this.commonScene.fBackGround.clear();
			this.commonScene.fBackGround.beginFill(0xc21b3b);
			this.commonScene.fBackGround.drawRect(0, 0, this.game.world.width, this.game.world.height);
			this.commonScene.fAlphaBg.tint = 0xfdaa69;
		}
		
		
		Server.setLog(EServerLogMsg.START, {'p1' : StageManager.getStageData(inStageNum).mode, 'p2' : inStageNum});
		if(window.FBInstant){
			FBInstant.logEvent(
				EServerLogMsg.START,
				1,
				{
					p1 : StageManager.getStageData(inStageNum).mode,
					p2 : inStageNum
				}
			);
		}
	}
};

InGame.prototype.switchLobby = function(){
	this.commonScene.motionBgDownAnimation(true);
	this.targetModel.targetDownAnimation(function(){
		this.game.input.enabled = true;
	}.bind(this), true);
	this.lobbyScene.fadeInLobby(true);
	this.lobbyScene.fTargetContainer.add(this.targetModel);
	this.commonScene.fadeOutBlind(1000, this.commonScene.fTopContainer);
};

InGame.prototype.switchLobbyAnimation = function(){
	this.game.input.enabled = false;
	this.commonScene.motionBgDownAnimation();
	this.targetModel.targetDownAnimation(function(){
		this.game.input.enabled = true;
	}.bind(this));
	
	this.lobbyScene = new LobbyScene(this.game, this.commonScene.fLobbyScene);
	this.titleScene.switchLobbyAnimation(function(){
		this.lobbyScene.fadeInLobby();
	}.bind(this) 
	,function(){
		 this.titleScene.fTargetContainer.remove(this.targetModel, false);
		 this.lobbyScene.fTargetContainer.add(this.targetModel);
	}.bind(this));
};

InGame.prototype.toggleRankScene = function (){
	if(!this.rankScene){
		this.rankScene = new RankingScene(this.game, this.commonScene.fRankScene);
		this.commonScene.fRankScene.alpha = 0;
	}
	
	var targetAlpha = (this.commonScene.fRankScene.alpha === 1) ? 0 : 1;
	var tweenSpeed;
	
	if(targetAlpha === 1){
		this.commonScene.fRankScene.visible = true;
		this.rankScene.preMoveCallBack();
		tweenSpeed = InGameConfig.SCENE_FADE_IN_SPEED;
		this.commonScene.fLobbyScene.visible = false;
		this.commonScene.updateUIByRank();
	}
	else{
		tweenSpeed = InGameConfig.SCENE_FADE_OUT_SPEED;
		this.commonScene.updateUIByTilte();
		this.commonScene.fLobbyScene.visible = true;
	}
	
	StzUtil.toggleScene(this.game, this.commonScene.fRankScene, tweenSpeed, (targetAlpha === 1) ? true : false, 
		function() {
		if(targetAlpha === 1){
			this.commonScene.fRankScene.alpha = 1;
		}
		else{
			this.rankScene.onClose();
			this.commonScene.fRankScene.visible = false;
			this.commonScene.fRankScene.alpha = 0;
		}
	}.bind(this));
};

InGame.prototype.toggleCharacterScene = function (){
	if(!this.characterScene){
		this.characterScene = new CharacterScene(this.game, this.commonScene.fCharacterScene);
		this.commonScene.fCharacterScene.alpha = 0;
	}
	
	var targetAlpha = (this.commonScene.fCharacterScene.alpha === 1) ? 0 : 1;
	var tweenSpeed;
	
	if(targetAlpha === 1){
		this.commonScene.fCharacterScene.visible = true;
		// this.rankScene.preMoveCallBack();
		tweenSpeed = InGameConfig.SCENE_FADE_IN_SPEED;
		this.commonScene.fLobbyScene.visible = false;
		this.characterScene.setData();
		this.characterScene.setScene(PlayerDataManager.saveData.getCharacterID());//@param : 여기에 마지막으로 플레이한 캐릭터 인덱스 넣어주세요.
		// this.commonScene.updateUIByRank();
	}
	else{
		tweenSpeed = InGameConfig.SCENE_FADE_OUT_SPEED;
		this.commonScene.updateUIByTilte();
		this.commonScene.fLobbyScene.visible = true;
	}
	
	StzUtil.toggleScene(this.game, this.commonScene.fCharacterScene, tweenSpeed, (targetAlpha === 1) ? true : false, 
		function() {
		if(targetAlpha === 1){
			this.commonScene.fCharacterScene.alpha = 1;
		}
		else{
			// this.rankScene.onClose();
			this.commonScene.fCharacterScene.visible = false;
			this.commonScene.fCharacterScene.alpha = 0;
		}
	}.bind(this));
};

InGame.prototype.toggleResultScene = function (isSuccess){
	if(!this.resultScene){
		this.resultScene = new ResultScene(this.game, this.commonScene.fResultScene);
		this.resultScene.visible = false;
	}
	
	InGameController.setIsPlay(false);
	this.commonScene.fadeInBlind(250, this.commonScene.fTopContainer, function(){
		this.gameScene.visible = false;
		this.resultScene.setData(isSuccess);
		this.resultScene.visible = true;
		
		if(isSuccess === true){
			window.sounds.sound('bgm_result').play("", 0, PlayerDataManager.saveData.getMusic(), true);
			window.sounds.sound('sfx_clear').play();
			this.targetModel.targetInWinReult();
			this.gameScene.fTargetContainer.remove(this.targetModel, false);
			this.resultScene.fTargetContainer.add(this.targetModel);
			this.commonScene.updateUIByWinResult();
		}
		else{
			window.sounds.sound('sfx_fail').play();
			this.commonScene.showBlind(this.resultScene.fBlindContainer);
		}
		this.commonScene.fadeOutBlind(500, this.commonScene.fTopContainer);
	}.bind(this));
};

InGame.prototype.togglePauseScene = function (isFocus){
	if(InGameController.getIsEnd() === true){
		return;
	}
	
	if(!this.pauseScene){
		this.pauseScene = new PauseScene(this.game, this.commonScene.fPauseScene);
		this.commonScene.fPauseScene.alpha = 0;
	}
	
	var targetAlpha = (this.commonScene.fPauseScene.alpha === 1) ? 0 : 1;
	var tweenSpeed;
	
	if(targetAlpha === 1){
		this.commonScene.fPauseScene.visible = true;
		tweenSpeed = InGameConfig.SCENE_FADE_IN_SPEED;
		this.commonScene.showBlind(this.pauseScene.fBlindContainer);

		if(isFocus === true){
			this.commonScene.fPauseScene.alpha = 1;
			InGameController.setIsPlay(false);
			return;
		}
	}
	else{
		tweenSpeed = InGameConfig.SCENE_FADE_OUT_SPEED;
		this.commonScene.offBlind();

		if(isFocus === true){
			this.commonScene.fPauseScene.alpha = 0;
			this.commonScene.fPauseScene.visible = false;
			InGameController.setIsPlay(true);
			return;
		}
	}
	
	StzUtil.toggleScene(this.game, this.commonScene.fPauseScene, tweenSpeed, (targetAlpha === 1) ? true : false, 
		function() {
		if(targetAlpha === 1){
			InGameController.setIsPlay(false);
		}
		else{
			this.commonScene.fPauseScene.visible = false;
			InGameController.setIsPlay(true);
		}
	}.bind(this));
};

InGame.prototype.toggleTutorialScene = function(){
	if(!this.tutorialScene){
		this.tutorialScene = new TutorialScene(this.game, this.commonScene.fTutorialScene);
		this.commonScene.fTutorialScene.alpha = 0;
	}
	
	var targetAlpha = (this.commonScene.fTutorialScene.alpha === 1) ? 0 : 1;
	var tweenSpeed;
	
	if(targetAlpha === 1){
		InGameController.setIsPlay(false);
		this.commonScene.fTutorialScene.visible = true;
		tweenSpeed = InGameConfig.SCENE_FADE_IN_SPEED;
		this.commonScene.showBlind(this.tutorialScene.fBlindContainer);
	}
	else{
		tweenSpeed = InGameConfig.SCENE_FADE_OUT_SPEED;
		this.commonScene.offBlind();
	}
	
	StzUtil.toggleScene(this.game, this.commonScene.fTutorialScene, tweenSpeed, (targetAlpha === 1) ? true : false, 
		function() {
		if(targetAlpha === 1){
			this.commonScene.fTutorialScene.alpha = 1;
			this.tutorialScene.playTutorial();
		}
		else{
			this.commonScene.fTutorialScene.visible = false;
			this.commonScene.fTutorialScene.alpha = 0;
			this.tutorialScene.destroy(true);
			InGameController.setIsPlay(true);
		}
	}.bind(this));
};

InGame.prototype.toggleLoading = function(isShow ,time, inFailCallback){
	if(!this.sLoadingScene){
		this.sLoadingScene = new SimpleLoadingScene(this.game, this.commonScene.fLoadingContainer);
	}
	
	if(isShow === true){
		this.sLoadingScene.setTimeout(time, inFailCallback, null, this).start();
	}
	else{
		this.sLoadingScene.stopLoading();
	}
};

InGame.prototype.setEndLog = function(inResultType, inRemainCount){
	var inVar = {};
	var stageNum = PlayerDataManager.saveData.getBestStage();
	var stageData = StageManager.getStageData(stageNum);
	
	inVar.p1 = stageData.mode;
	inVar.p2 = stageNum;
	inVar.p3 = inResultType;
	inVar.p4 = inRemainCount;
	inVar.p5 = this.tryCount;

	Server.setLog(EServerLogMsg.end, inVar);
	if(window.FBInstant){
		FBInstant.logEvent(
			EServerLogMsg.end,
			1,
			{
				p1 : stageData.mode,
				p2 : stageNum,
				p3 : inResultType,
				p4 : inRemainCount,
				p5 : this.tryCount
			}
		);
	}
};

InGame.prototype.setCanvasFocusState = function(checkPausable,checkWillResumable){
	$(window).focus(function(){
		if (checkWillResumable && checkWillResumable() === false) {
			return;
		}
		window.sounds.toggleMusic((PlayerDataManager.saveData.getMusic() === 1)? true: false);
		window.sounds.toggleSound((PlayerDataManager.saveData.getSound() === 1)? true: false);
	}.bind(this));
	
	if (window.FBInstant) {
		FBInstant.onPause(function() {
			if (checkWillResumable && checkWillResumable() === false) {
				return;
			}
			checkPausable(); 

			window.sounds.toggleMusic(false);
				// for Android - set focusable to webview at native code
			this.game.input.onDown.add(onTouchFocusBack, this);
			
    	}.bind(this));
	} else{
		$(window).blur(function() {
			if (checkWillResumable && checkWillResumable() === false) {
				return;
			}
			checkPausable(); 
		
			window.sounds.toggleMusic(false);
				
			// for Android - set focusable to webview at native code
			this.game.input.onDown.add(onTouchFocusBack, this);
			
		}.bind(this));
	}
	
	function onTouchFocusBack(event) {
		this.game.input.onDown.remove(onTouchFocusBack, this);
		if (checkWillResumable && checkWillResumable() === false) {
			return;
		}
		window.sounds.toggleMusic((PlayerDataManager.saveData.getMusic() === 1)? true: false);
		window.sounds.toggleSound((PlayerDataManager.saveData.getSound() === 1)? true: false);
	}
};

InGame.prototype.restartInGame = function(){
	this.restartCount++;
	this.restartAdCount++;

	this.interstitialRestartShowAd(function(){
		if(this.restartCount <= InGameConfig.RESTART_COUNT){
			this.game.time.events.add(100, function(){
				this.createInGameScene(PlayerDataManager.saveData.getBestStage(), false);
			}.bind(this));
		}
		else{
			this.destroyInGameScene(ESceneState.GO_INGAME_SCENE);
		}
	}.bind(this));
};

InGame.prototype.interstitialRestartShowAd = function(inCallBack){
	var limitCount = StaticManager.dino_thornz_base.get('interstitial_limit_count') ? StaticManager.dino_thornz_base.get('interstitial_limit_count').value : 5;
	
	if(this.restartAdCount >= limitCount && this.resultScene && this.resultScene.visible === true
			&& GGManager.getAdModelByPlacementID(EAdType.INTERSTITIAL, EAdName.INTERSTITIAL_INGAME_RESTART)){
		GGManager.setCallbackByPlacementID(EAdName.INTERSTITIAL_INGAME_RESTART, function() {
			//showComplete
			this.restartAdCount = 0;
			if(inCallBack){
				inCallBack();
			}
		}.bind(this), function(){
			//loadSuccse
		}.bind(this), function(){
			//loadFail
			if(inCallBack){
				inCallBack();
			}
		}.bind(this));
		GGManager.show(EAdName.INTERSTITIAL_INGAME_RESTART);
	}
	else{
		if(inCallBack){
			inCallBack();
		}
	}	
};

InGame.prototype.destroyInGameScene = function (inState) {
	this.game.time.events.add(100, function(){
		this.game.onPause.removeAll();
		this.game.onResume.removeAll();
		
		InGameController.setIsPlay(false);
		InGameController.destroyObject();
		PoolManager.init(true);
		
		this.commonScene.destroy(true, false);
		this.game.state.restart(true, false, inState, this.restartAdCount, this.tryCount);
	}.bind(this));
	
};