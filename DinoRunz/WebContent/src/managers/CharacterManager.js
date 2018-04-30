var ECharacter = {
	UnlockCondition : {
		NONE 		:	1,
		LEVEL		: 	2,
		VIDEO		:	3,
		SHARE		:	4,
		GOLD_CROWN	:	5,
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
};

function CharacterManager_proto () {
	if (!(this instanceof CharacterManager_proto)) {
		return new CharacterManager_proto();
	}
	
	//StzLog.assert(window.StaticManager, "[noticeManager] Dependency Error!! - Need StaticManager!");
	
	var _objs = null;
	var _characterArray = [];
	
	this.init = function(inGame, inStaticCharacterData){
		_characterArray = [];
		_objs = inStaticCharacterData;
		this.game = inGame;
		
		for(var key in _objs.data){
			if(_objs.data[key].enable === 1){
				_characterArray.push(new CharacterModel(_objs.data[key], parseInt(key)));
			}
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
		
		this.checkUnlockByStage();
	};
	
	this.checkUnlockByStage = function(isIndicator){
		var characterArray = this.getCharacterDataArray();
		for(var i =0; i < characterArray.length; i++){
			if(characterArray[i].unlockCondition === ECharacter.UnlockCondition.STAGE){
				if(characterArray[i].unlockValue <= PlayerDataManager.saveData.getBestStage()){
					if(characterArray[i].isUnlock === false){
						characterArray[i].isUnlock = true;
						if(isIndicator === true && characterArray[i].unlockValue === PlayerDataManager.saveData.getBestStage()){
							this.game.state.getCurrentState().showIndicatorFunc(EIndicatorType.CHARACTER, characterArray[i].name);
						}
					}
				}
			}
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

		character.isUnlock = true;
		if(isFree !== true){
			PlayerDataManager.saveData.updateCoin(character.unlockValue, {'p1' : 'use', 'p2' : 'coin', 'p3' : EResourcePlace.BUY_CHARACTER, 'p4' : inID} ,true);
		}
		PlayerDataManager.saveData.setCharacterID(Number(inID));
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
		for(i = 0; i < _characterArray.length; i++){
			if(this.getCharacterData(i+1).unlockCondition === ECharacter.UnlockCondition.VIDEO){
				var curNum = (this.getCharacterData(i+1).curValue)? this.getCharacterData(i+1).curValue : 0;
				if(curNum !== null){
					unLcokCharactersValue = unLcokCharactersValue.concat(i+1 + ":" + curNum + ',');
				}
			}
		}
		unLcokCharactersValue = unLcokCharactersValue.slice(0, -1);
		PlayerDataManager.saveData.save();
		FBInstant.player.setDataAsync({
			unLockCharacterID : unLockCharacterID,
			unLcokCharactersValue	: unLcokCharactersValue
		});
	};
	
	this.getCharacterData = function(inID){
		return _characterArray[inID-1].getObject();
	};
	
	this.getCharacterDataArray = function(){
		var characterTempArray = [];
		
		for(var i = 0; i < _characterArray.length; i++){
			characterTempArray.push(_characterArray[i].getObject());
		}
		
		return characterTempArray;
	};

	this.updateDataCurValues = function () {
		var inCharacterData = null;
		var curData = null;
		var length = DinoRunz.Storage.UserData.lockDinoData.length;

		for(var i = 0; i < _characterArray.length; i++){
			inCharacterData = _characterArray[i].getObject();

			switch(inCharacterData.unlockCondition){
				case ECharacter.UnlockCondition.LEVEL:
					inCharacterData.curValue = DinoRunz.Storage.UserData.lastClearedStage;
					break;
				case ECharacter.UnlockCondition.VIDEO:
					for(var j=0 ; j < length; ++j){
						curData = DinoRunz.Storage.UserData.lockDinoData[j];
						if(inCharacterData.id===curData.charId){
							inCharacterData.curValue = curData.curValue;
							break;
						}
					}
					break;
				case ECharacter.UnlockCondition.SHARE:
					inCharacterData.curValue = PlayerDataManager.saveData.UserData.shareCount;
					break;
				case ECharacter.UnlockCondition.GOLD_CROWN:
					/**
					 * 추후 추가 예정.
					 */
					break;
			}
		}
	};
}

function CharacterModel(inData, id){
	var _obj = {
		id					: 	0,
		name				: 	"",
		// dino				:	"",
		isUnlock			: false,
		unlockCondition		:	0,
		unlockValue			: 	0,
		curValue			:	0,
		sort				:   0
	};
	
	_obj.id = id;
	_obj.name = (inData.hasOwnProperty('name') === true)? inData.name : CharacterBasicData.CHARACTER_BASIC_NAME;
	// _obj.dino = (inData.hasOwnProperty('character') === true)? inData.character : CharacterBasicData.CHARACTER_BASIC_DINO;
	_obj.unlockCondition = (inData.hasOwnProperty('unlock_condition') === true)? inData.unlock_condition : CharacterBasicData.CHARACTER_BASIC_ULOCK_CONDITION;
	_obj.unlockValue = (inData.hasOwnProperty('unlock_value') === true)? inData.unlock_value : CharacterBasicData.CHARACTER_BASIC_ULOCK_VALUE;
	_obj.sort = (inData.hasOwnProperty('sort') === true)? inData.sort : 0;
	
	this.getObject = function(){
		return _obj;
	};
}