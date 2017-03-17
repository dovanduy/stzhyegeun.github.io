function WordData() {
	
	if(!(this instanceof WordData)){
		return new WordButton();
	}
	
	this.self = {

	};
	
	this._init();
	
	return this.self;
}

WordData.prototype._init = function() {
	var keyArray = [];
	
	for (key in EWordDatas) {
			keyArray.push(key);
		}
	
	var randomNumber = Math.floor(Math.random()*keyArray.length);
	
	this.self.alphabetArray = keyArray[randomNumber].split('');
	
	var wordDataArray = EWordDatas[keyArray[randomNumber]];
	var length = wordDataArray.length;
	
	this.self.wordArray = [];
	
	for(var i = 0;i<length;i++){
		this.self.wordArray.push({word:wordDataArray[i],state:EWrodState.NONE}); 
	}
	
	this.self.wordArray.sort(CompareForSort);
	
	function CompareForSort(first,second){
		if(first.word.length === second.word.length){
			return 0;
		}
		else if(first.word.length < second.word.length){
			return -1;
		}
		else{
			return 1;
		}
	}
};