var StageBasicData = {
		GAME_BASIC_MODE				: 'N'
		,GAME_BASIC_TARGET_SCALE 	: 1	
		,GAME_BASIC_COUNT 			: 10
		,GAME_BASIC_COIN_COUNT		: 1
		,GAME_BASIC_OBSTALCE 		: 3
		,GAME_BASIC_OBSTALCE_SIZE	: 1
		,GAME_BASIC_PATTERN_NUM		: 1
		,GAME_BASIC_PATTERN 		: 'C:360:1'
		,GAME_BASIC_DEST			: 360	
};

var BASE_SPEED = Math.PI/2;

var StageManager_proto = function() {
	if (!(this instanceof StageManager_proto)) {
		return new StageManager_proto();
	}
	
	StzLog.assert(window.StaticManager, "[noticeManager] Dependency Error!! - Need StaticManager!");
	
	
	var _objs = null;
	var _stageArray = [];
	
	this.init = function(){
		_objs = StaticManager.dino_thornz_level_design;
		for(var key in _objs.data){
			_stageArray.push(new StageModel(_objs.data[key]));
		}
	};
	
	this.getStageCount = function(){
		return _stageArray.length;
	};
	
	this.getStageData = function(inStageNum){
		return _stageArray[inStageNum-1].getObject();
	};
};

var StageManager = new StageManager_proto();

function StageModel(inData){
	var _obj = {
		mode		:	0,		
		trageSize 	:	0,
		objectNum	:	0,
		objectSize	:	0,
		targetCount	:	0,
		coinNum		:	0,
		patternNum	:	0,
		pattern		:	[]
	};
	
	_obj.mode = (inData.hasOwnProperty('mode') === true)? inData.mode : StageBasicData.GAME_BASIC_MODE;
	_obj.trageSize = (inData.hasOwnProperty('target_size') === true)? inData.target_size : StageBasicData.GAME_BASIC_TARGET_SCALE;
	_obj.objectNum = (inData.hasOwnProperty('object_num') === true)? inData.object_num : StageBasicData.GAME_BASIC_OBSTALCE;
	_obj.objectSize = (inData.hasOwnProperty('object_size') === true)? inData.object_size : StageBasicData.GAME_BASIC_OBSTALCE_SIZE;
	_obj.targetCount = (inData.hasOwnProperty('target_count') === true)? inData.target_count : StageBasicData.GAME_BASIC_COUNT;
	_obj.coinNum = (inData.hasOwnProperty('coin_num') === true)? inData.coin_num : StageBasicData.GAME_BASIC_COIN_COUNT;
	_obj.patternNum = (inData.hasOwnProperty('pattern_num') === true)? inData.pattern_num : StageBasicData.GAME_BASIC_PATTERN_NUM;
	
	for(var i = 0; i < _obj.patternNum; i++){
		_createPatternData((inData.hasOwnProperty('pattern_' + (i+1).toString()) === true)? 
				inData['pattern_' + (i+1).toString()] : StageBasicData.GAME_BASIC_PATTERN);
		
	}

	function _createPatternData(inPatternData){
		var tempPattern = StaticManager.parseToArray(inPatternData);
		var direction = ((tempPattern[0] === 'C')? 1 : -1);
		var speed = 0
		if(tempPattern[2] && tempPattern[2] == -1){
			speed = -1;
			direction = 1;
		}
		else{
			speed = direction*BASE_SPEED*((tempPattern[2])? tempPattern[2] : 1);
		}
		var dest = direction*((tempPattern[1])? tempPattern[1] : StageBasicData.GAME_BASIC_DEST)*Math.PI/180;
		_obj.pattern.push({'speed' : speed , 'dest' : dest});
	}
	
	this.getObject = function(){
		return _obj;
	};
};

