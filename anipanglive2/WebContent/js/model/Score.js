var EScoreConfig = {
		UNIT_SCORE 				: 100,
		ANIBOT_COMBO_TIME 		: 2500,
		INIT_COMBO_TIME 		: 3000,
		COMBO_DELTA_DURATION      : 500,
		MIN_COMBO_DURATION		: 1500,
		//피버 제거 테스트
		PIVOT_START_COMBO		: 5,
		PIVOT_TIME				: 5000,
		COMBO_RATE				: 0.05
};

var EScoreType ={
		GEN_MATCHED 			:	"GEN_MATCHED_TYPE",
		LINE_BLOCK  			: 	"LINE_BLOCK",
		CIRCLE_BLOCK			:	"CIRCLE_BLOCK",
		LINE_LINE_BLOCK  		: 	"LINE_LINE_BLOCK",
		LINE_CIRCLE_BLOCK  		: 	"LINE_CIRCLE_BLOCK",
		CIRCLE_CIRCLE_BLOCK  	: 	"LINE_CIRCLE_BLOCK"
};

function Score(inParentContext) {
	if(!(this instanceof Score)){
		return new Score();
	}
	var _viewContext = inParentContext;
	var startComboStamp = -1;
		
	var self = {
		onScoreUpdated	: null,
		onComboUpdated	: null,
		onPivotStart  	: null,
		onPivotEnd		: null
	};
	
	self.initData = function(){
		
		securityStorage.setInt('score', 0);
		securityStorage.setInt('combo', 0);
		securityStorage.setInt('comboDuration', EScoreConfig.INIT_COMBO_TIME);
		securityStorage.setInt('feverStartFlag', 0);
		
		self.onScoreUpdated = null;
		self.onComboUpdated = null;
		self.onPivotStart 	= null;
		self.onPivotEnd 	= null;
	};
	
	self.getScoreText = function(){
		return StzUtil.createNumComma(securityStorage.getInt('score'));
	};
	
	
	self.getScore = function(){
		return securityStorage.getInt('score');
	};
	
	self.setScore = function(count, inByUser, scoreType){
		securityStorage.setInt('score', securityStorage.getInt('score') + Score.calculateScore(count, securityStorage.getInt('combo') + 1, scoreType));
		
		if (inByUser) {
			var currentComboStamp = (new Date()).getTime();
			var comboDeltaTime = currentComboStamp - startComboStamp;
			//콤보 제거 테스트
			if (comboDeltaTime < securityStorage.getInt('comboDuration')) {
				self.setCombo(securityStorage.getInt('combo') + 1);
			} 
			else if(startComboStamp === 0){
				self.setCombo(securityStorage.getInt('combo') + 1);
			}
			else if(startComboStamp === -1){
				self.setCombo(0);	
			}
			else {
				self.setCombo(0);
				startComboStamp = 0;
				return;
			}
		}
		startComboStamp = (new Date()).getTime();

		if (self.onScoreUpdated) {
			self.onScoreUpdated(securityStorage.getInt('score'));
		}
		
	};
	
	self.initStartComboStamp = function(){
		startComboStamp = (new Date()).getTime();
	};
	
	self.getCombo = function(){
		return securityStorage.getInt('combo');
	};
	
	self.setCombo = function(inComboValue) {
		securityStorage.setInt('combo', inComboValue);
		
		if(securityStorage.getInt('combo') === 3){
			StzSoundList[ESoundName.SE_COMBO3].play();
		}
		else if( securityStorage.getInt('combo') === 5){
			StzSoundList[ESoundName.SE_COMBO5].play();
		}
		else if(securityStorage.getInt('combo') === 7){
			StzSoundList[ESoundName.SE_COMBO7].play();
		}
		
		if (inComboValue === 0) {
			securityStorage.setInt('feverCombo', 0);
			startComboStamp = 0;
			securityStorage.setInt('comboDuration', EScoreConfig.INIT_COMBO_TIME);
		}
		if (self.onComboUpdated) {
			securityStorage.setInt('comboDuration', EScoreConfig.INIT_COMBO_TIME - ((securityStorage.getInt('combo') - 1) * EScoreConfig.COMBO_DELTA_DURATION));
			if(securityStorage.getInt('comboDuration') < EScoreConfig.MIN_COMBO_DURATION){
				securityStorage.setInt('comboDuration', EScoreConfig.MIN_COMBO_DURATION);
			}
			
			if(securityStorage.getInt('feverStartFlag') === 0){
				securityStorage.setInt('feverCombo', securityStorage.getInt('feverCombo') + 1);
			}
			
			self.onComboUpdated(securityStorage.getInt('combo'), securityStorage.getInt('comboDuration'));
		}
		
		if (securityStorage.getInt('feverCombo') === EScoreConfig.PIVOT_START_COMBO) {
			if (self.onPivotStart) {
				var pivotTimer = _viewContext.time.events.add(EScoreConfig.PIVOT_TIME, function(){
					securityStorage.setInt('feverStartFlag', 0);
					if (self.onPivotEnd) {
						self.onPivotEnd();
					}
				}.bind(this));
				securityStorage.setInt('feverCombo', 0);
				securityStorage.setInt('feverStartFlag', 1);
				self.onPivotStart(pivotTimer);
			}
		}
	};
	
	return self;
}

Score.calculateScore = function(count, combo, scoreType){
	var score = 0;
	var genScore = 0;
	switch(scoreType){
		case EScoreType.GEN_MATCHED:
			if(count === 3){
				genScore = count*EScoreConfig.UNIT_SCORE;
			}
			else if(count === 4){
				genScore =  count*EScoreConfig.UNIT_SCORE + EScoreConfig.UNIT_SCORE;
			}
			else{
				genScore =  count*EScoreConfig.UNIT_SCORE + EScoreConfig.UNIT_SCORE*2;	
			}
			score = genScore + Math.floor(genScore*combo*EScoreConfig.COMBO_RATE);
			break;
		case EScoreType.LINE_BLOCK:
		case EScoreType.CIRCLE_BLOCK:
			genScore = count*EScoreConfig.UNIT_SCORE*3;
			score = genScore + Math.floor(genScore*combo*EScoreConfig.COMBO_RATE);
			break;
		case EScoreType.LINE_LINE_BLOCK:
		case EScoreType.LINE_CIRCLE_BLOCK:
			genScore = count*EScoreConfig.UNIT_SCORE*5;
			score = genScore + Math.floor(genScore*combo*EScoreConfig.COMBO_RATE);
			break;
		case EScoreType.CIRCLE_CIRCLE_BLOCK:
			genScore = count*EScoreConfig.UNIT_SCORE*10;
			score = genScore + Math.floor(genScore*combo*EScoreConfig.COMBO_RATE);
			break;	
	}
	
	return score;
};
