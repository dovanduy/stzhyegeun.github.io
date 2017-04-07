var EScoreConfig = {
		UNIT_SCORE 				: 50,
		ANIBOT_COMBO_TIME 		: 2500,
		INIT_COMBO_TIME 		: 5000,
		COMBO_DELTA_DURATION      : 500,
		MIN_COMBO_DURATION		: 2500,
		PIVOT_START_COMBO		: 5,
		PIVOT_TIME				: 5000,
};

function Score(inParentContext) {
	if(!(this instanceof Score)){
		return new Score();
	}
	var _viewContext = inParentContext;
	var _score = 0;
	var _combo = 0;
	var _comboDuration = EScoreConfig.INIT_COMBO_TIME;
	var _pivotCombo	= 0;
	var _pivotStartFlag = false;
	var startComboStamp = 0;
		
	var self = {
		onScoreUpdated	: null,
		onComboUpdated	: null,
		onPivotStart  	: null,
		onPivotEnd		: null
	};
	
	self.initData = function(){
		_score = 0;
		_combo = 0;
		self.onScoreUpdated = null;
		self.onComboUpdated = null;
		self.onPivotStart 	= null;
		self.onPivotEnd 	= null;
	};
	
	self.getScoreText = function(){
		return StzUtil.createNumComma(_score);
	};
	
	
	self.getScore = function(){
		return _score;
	};
	
	self.setScore = function(count, inByUser){
		_score  = _score + ((_combo + 1)*EScoreConfig.UNIT_SCORE)*count;
		
		if (inByUser) {
			var currentComboStamp = (new Date()).getTime();
			var comboDeltaTime = currentComboStamp - startComboStamp;
			
			if (comboDeltaTime < _comboDuration) {
				self.setCombo(_combo + 1);	
			} 
			else if(startComboStamp === 0){
				self.setCombo(_combo + 1);	
			}
			else {
				self.setCombo(0);
				startComboStamp = 0;
				return;
			}
		}
		startComboStamp = (new Date()).getTime();
		
		if (self.onScoreUpdated) {
			self.onScoreUpdated(_score);
		}
	};

	self.getCombo = function(){
		return _combo;
	};
	
	self.setCombo = function(inComboValue) {
		_combo = inComboValue;
		
		if(_combo === 3){
			StzSoundList[ESoundName.SE_COMBO3].play();
		}
		else if( _combo === 5){
			StzSoundList[ESoundName.SE_COMBO5].play();
		}
		else if(_combo === 7){
			StzSoundList[ESoundName.SE_COMBO7].play();
		}
		
		if (inComboValue === 0) {
			_pivotCombo = 0;
			startComboStamp = 0;
			_comboDuration = EScoreConfig.INIT_COMBO_TIME;
		}
		if (self.onComboUpdated) {
			_comboDuration = EScoreConfig.INIT_COMBO_TIME - ((_combo-1)*EScoreConfig.COMBO_DELTA_DURATION);
			if(_comboDuration < EScoreConfig.MIN_COMBO_DURATION){
				_comboDuration = EScoreConfig.MIN_COMBO_DURATION;
			}
			
			if(_pivotStartFlag === false && inComboValue !== 0){
				_pivotCombo++;
			}
			
			self.onComboUpdated(_combo, _comboDuration);
		}
		
		if(_pivotCombo === EScoreConfig.PIVOT_START_COMBO){
			if (self.onPivotStart) {
				var pivotTimer = _viewContext.time.events.add(EScoreConfig.PIVOT_TIME, function(){
					_pivotStartFlag = false;
					if (self.onPivotEnd) {
						self.onPivotEnd();
					}
				}.bind(this));
				_pivotCombo = 0;
				_pivotStartFlag = true;
				self.onPivotStart(pivotTimer);
			}
		}
	};
	
	return self;
}

