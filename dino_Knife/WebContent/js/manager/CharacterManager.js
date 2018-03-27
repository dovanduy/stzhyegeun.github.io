var ECharacter = {
	UnlockCondition : {
		NONE 		:	1,
		BUY			: 	2,
		VIDEO		:	3,
		SHARE		:	4,
		GIFT		:   99
	},
	
	DINO	: {
		AUHA	:	'auha',
		AHURA	:	'ahura'
	}
};

var CharacterBasicData = {
	CHARACTER_BASIC_DINO			:		'ahua',
	CHARACTER_BASIC_NAME			: 		'PIN',
	CHARACTER_BASIC_ULOCK_CONDITION	:		ECharacter.UnlockCondition.NONE,
	CHARACTER_BASIC_ULOCK_VALUE		:		0
}

function CharacterManager_proto () {
	if (!(this instanceof CharacterManager_proto)) {
		return new CharacterManager_proto();
	}
	
	StzLog.assert(window.StaticManager, "[noticeManager] Dependency Error!! - Need StaticManager!");
	
	var _objs = null;
	var _characterArray = [];
	
	this.init = function(){
		_characterArray = [];
		_objs = StaticManager.dino_thornz_character;
		for(var key in _objs.data){
			_characterArray.push(new CharacterModel(_objs.data[key], key));
		}
	};
	
	this.setIsOwenCharacters = function(inUnlockID){
		if(typeof inUnlockID !== "string"){
			return;
		}
		
		var unlockNumArray = inUnlockID.split(':');
		
		for(var i =0; i < unlockNumArray.length; i++){
			this.getCharacterData(parseInt(unlockNumArray[i])).isUnlock = true;
		}
	};
	
	this.setUnlockValue = function(inUnlockValue){
		if(typeof inUnlockValue !== "string"){
			return;
		}
		
		var unlockValueArray = inUnlockValue.split(',');
		
		for(var i = 0; i < unlockValueArray.length; i++){
			var temp = unlockValueArray[i].split(':');
			if(temp.length < 2){
				continue;
			}
			this.getCharacterData(parseInt([temp[0]])).curValue = parseInt(temp[1]);
		}
		
	};
	
	this.allOpenCharacter = function(){
		for(var i = 0; i < _characterArray.length; i++){
			this.getCharacterData(i+1).isUnlock = true;
		}
	};
	
	this.allCloseCharacter = function(){
		for(var i = 0; i < _characterArray.length; i++){
			if(i == 0) continue;
			
			this.getCharacterData(i+1).isUnlock.isUnlock = false;
		}
	};
	
	this.buyCharacterByID = function(inID, isFree){
		var character = this.getCharacterData(inID);
		var curCoin = PlayerDataManager.saveData.getCoin();
		
		character.isUnlock = true;
		if(isFree !== true){
			PlayerDataManager.saveData.setCoin(curCoin - character.unlockValue);
		}
	};
	
	this.updateCureValueById = function(inID, inValue){
		var character = this.getCharacterData(inID);
		
		character.curValue += inValue;
	};
	
	this.saveCharacterData = function(){
		if(!window.FBInstant){
			return;
		}
		
		var unLockCharacterID = '';
		for(var i = 0; i < _characterArray.length; i++){
			var unLockNum = (this.getCharacterData(i+1).isUnlock === true)? i+1 : null;
			if(unLockNum !== null){
				unLockCharacterID = unLockCharacterID.concat(unLockNum.toString() + ":");
			}
		}
		unLockCharacterID = unLockCharacterID.slice(0, -1);
		
		var unLcokCharactersValue = '';
		for(var i = 0; i < _characterArray.length; i++){
			if(this.getCharacterData(i+1).unlockCondition === ECharacter.UnlockCondition.VIDEO){
				var curNum = (this.getCharacterData(i+1).curValue)? this.getCharacterData(i+1).curValue : 0;
				if(curNum !== null){
					unLcokCharactersValue = unLcokCharactersValue.concat(i+1 + ":" + curNum + ',');
				}
			}
		}
		unLcokCharactersValue = unLcokCharactersValue.slice(0, -1);
		
		FBInstant.player.setDataAsync({
			stageNum : PlayerDataManager.saveData.getBestStage(),
			coin : PlayerDataManager.saveData.getCoin(),
			characterID : PlayerDataManager.saveData.getCharacterID(),
			unLockCharacterID : unLockCharacterID,
			unLcokCharactersValue	: unLcokCharactersValue
		});
	};
	
	this.getCharacterData = function(inID){
		return _characterArray[inID-1].getObject();
	};
	
}

var CharacterManager = new CharacterManager_proto();

function CharacterModel(inData, id){
	var _obj = {
		id					: 	0,
		name				: 	"",
		dino				:	"",
		isUnlock			: false,
		unlockCondition		:	0,
		unlockValue			: 	0,
		curValue			:	0
	};
	
	_obj.id = id;
	_obj.name = (inData.hasOwnProperty('name') === true)? inData.name : CharacterBasicData.CHARACTER_BASIC_NAME;
	_obj.dino = (inData.hasOwnProperty('character') === true)? inData.character : CharacterBasicData.CHARACTER_BASIC_DINO;
	_obj.unlockCondition = (inData.hasOwnProperty('unlock_condition') === true)? inData.unlock_condition : CharacterBasicData.CHARACTER_BASIC_ULOCK_CONDITION;
	_obj.unlockValue = (inData.hasOwnProperty('unlock_value') === true)? inData.unlock_value : CharacterBasicData.CHARACTER_BASIC_ULOCK_VALUE;
	
	this.getObject = function(){
		return _obj;
	};
};