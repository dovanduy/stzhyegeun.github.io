function WordButton(inGame, aParent, obj) {
	
	if(!(this instanceof WordButton)){
		return new WordButton(inGame, aParent, obj);
	}
	
	this._inGame = inGame;
	this._aParent = aParent;
	
	this._wordButton = this._inGame.add.sprite(obj.x, obj.y, 'mainUI', 'btnWord.png');
	this._wordButton.inputEnabled = true;

	this._aParent.scene.fGroupWord.add(this._wordButton);
	
	var self = {
			
	};
	
	self.setOFFImage = function (){
		 this._wordButton.frameName = EWordButtonName.OFF;
		 this._wordButton.inputEnabled = false;
	}.bind(this);
	
	self.getWordButton = function (){
		 return this._wordButton;
	}.bind(this);
	
	return self;
}
