var EScoreConfig = {
		UNIT_SCORE : 50,
		COMBO_TIME : 2000
};

function Score() {
	if(!(this instanceof Score)){
		return new Score();
	}
	
	var _score = 0;
	var _combo = 0;
	var startComboStamp = 0;
		
	var self = {
		onScoreUpdated: null,
		onComboUpdated: null
	};
	
	self.initData = function(){
		_score = 0;
		_combo = 0;
		self.onScoreUpdated = null;
		self.onComboUpdated = null;
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
			
			if (comboDeltaTime < EScoreConfig.COMBO_TIME) {
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
		if (inComboValue === 0) {
			startComboStamp = 0;
		}
		if (self.onComboUpdated) {
			self.onComboUpdated(_combo, EScoreConfig.COMBO_TIME);
		}
	};
	
	return self;
}

