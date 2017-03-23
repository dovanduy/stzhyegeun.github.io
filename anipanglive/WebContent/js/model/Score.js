var EScoreConfig = {
		UNIT_SCORE : 50,
		COMBO_TIME : 2000
};

function Score() {
	if(!(this instanceof Score)){
		return new Score();
	}
	
	this._score = 0;
	this._combo = 0;
	
	var self = {};
	
	self.initData = function(){
		this._score = 0;
		this._combo = 0;
	};
	
	self.getScoreText = function(){
		return StzUtil.createNumComma(this._score);
	}.bind(this),
	
	
	self.getScore = function(){
		return this._score;
	}.bind(this),
	
	self.setScore = function(count){
		this._score  = this._score + ((this._combo + 1)*EScoreConfig.UNIT_SCORE)*count;
	}.bind(this),
	
	self.getCombo = function(){
		return this._combo;
	}.bind(this),
	
	self.setCombo = function(comboDeltaTime, isComboUp){
		if(comboDeltaTime < EScoreConfig.COMBO_TIME){
			if(isComboUp == true){
				this._combo++;
			}
		}
		else
		{
			this._combo = 0;
		}
		
		return this._combo;
	}.bind(this);
	
	return self;
}

