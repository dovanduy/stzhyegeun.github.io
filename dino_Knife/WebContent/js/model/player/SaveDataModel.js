function SaveDataModel () {
	if (!(this instanceof SaveDataModel)) {
		return new SaveDataModel();
	}
	
	var _obj = {
			bestStage			: 1, 
			coin				: 0, 
			characterID 		: 1,
			freeCoinTimeStamp	: new Date().getTime(),
			shareCount			: 0,
			isMusic				: 1,
			isSound				: 1
		};
	
	this.getObject = function(){
		return _obj;
	};
	
	this.setData = function(inData){
		if(inData.hasOwnProperty('stageNum') === false){
			_obj.bestStage = 1;
		}
		else{
			_obj.bestStage = inData['stageNum'];
		}

		if(inData.hasOwnProperty('coin') === false){
			_obj.coin = 0;
		}
		else{
			_obj.coin = inData['coin'];
		}
		
		if(inData.hasOwnProperty('characterID') === false){
			_obj.characterID = 1;
		}
		else{
			_obj.characterID = inData['characterID'];
		}
		
		if(inData.hasOwnProperty('freeCoinTimeStamp') === false){
			_obj.freeCoinTimeStamp = new Date().getTime();
		}
		else{
			_obj.freeCoinTimeStamp = inData['freeCoinTimeStamp'];
		}
		
		if(inData.hasOwnProperty('shareCount') === false){
			_obj.shareCount = 0;
		}
		else{
			_obj.shareCount = inData['shareCount'];
		}
		
		if(inData.hasOwnProperty('settingData') === false){
			_obj.isMusic = 1;
			_obj.isSound = 1;
		}
		else{
			var temp = inData['settingData'].split(':');
			
			_obj.isMusic = (temp[0] === '0' || temp[0] === '1')? parseInt(temp[0]) : 1;
			_obj.isSound = (temp[1] === '0' || temp[1] === '1')? parseInt(temp[1]) : 1;
		}
	};
	
	this.save = function(){
		if(!window.FBInstant){
			return;
		}
		
		FBInstant.player.setDataAsync({
			stageNum 			: _obj.bestStage,
			coin 				: _obj.coin,
			freeCoinTimeStamp	: _obj.freeCoinTimeStamp,
			shareCount			: _obj.shareCount,
			characterID 		: _obj.characterID,
			settingData			: _obj.isMusic + ':' + _obj.isSound
		});
	};
	
	this.setBestStage = function(inValue){
		StzLog.assert(typeof inValue === "number", "[bestStage] inValue is not number!");
		
		_obj.bestStage = inValue;
	};
	
	this.updateBestStage = function(){
		++_obj.bestStage;
		if(StageManager.getStageCount() <= _obj.bestStage){
			_obj.bestStage = StageManager.getStageCount();
		}
	};
	
	this.getBestStage = function(){
		return _obj.bestStage;
	};
	
	this.onUpdateCoin = new Phaser.Signal();
	this.addUpdateCoinDelegate = function(inDelegate, inContext) {
		this.onUpdateCoin.add(inDelegate, inContext);
	};
	
	this.removeUpdateCoinDelegate = function(inDelegate, inContext) {
		this.onUpdateCoin.remove(inDelegate, inContext);
	};
	
	this.setCoin = function(inValue){
		StzLog.assert(typeof inValue === "number", "[coin] inValue is not number!");
		
		_obj.coin = inValue;
		this.onUpdateCoin.dispatch(_obj.coin);
	};
	
	this.updateCoin = function(inValue){
		StzLog.assert(typeof inValue === "number", "[coin] inValue is not number!");
		
		_obj.coin+=inValue;
		
		this.onUpdateCoin.dispatch(_obj.coin);
	};
	
	this.getCoin = function(){
		return _obj.coin;
	};
	
	this.getCharacterID = function(){
		return _obj.characterID;
	};
	
	this.setCharacterID = function(inValue){
		StzLog.assert(typeof inValue === "number", "[characterID] inValue is not number!");
		
		_obj.characterID = inValue;
	};
	
	this.setMusic = function(inValue){
		_obj.isMusic = inValue;
	};
	
	this.setSound = function(inValue){
		_obj.isSound = inValue;
	};
	
	this.getMusic = function(){
		return _obj.isMusic;
	};
	
	this.getSound = function(){
		return _obj.isSound;
	};
	
	this.getFreeCoinTimeStamp = function(){
		return _obj.freeCoinTimeStamp;
	};
	
	this.setFreeCoinTimeStamp = function(inValue){
		StzLog.assert(typeof inValue === "number", "[FreeCoinTimeStamp] inValue is not number!");
		
		_obj.freeCoinTimeStamp = inValue;
	};
	
	this.updateShareCount = function(inValue){
		StzLog.assert(typeof inValue === "number", "[coin] inValue is not number!");
		
		_obj.shareCount+=inValue;
	};
	
	this.getShareCount = function(){
		return _obj.shareCount;
	};
	
	this.setShareCount = function(inValue){
		StzLog.assert(typeof inValue === "number", "[FreeCoinTimeStamp] inValue is not number!");
		
		_obj.shareCount = inValue;
	};
}