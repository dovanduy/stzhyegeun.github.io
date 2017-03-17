function WordButton(inGame, aParent, obj) {
	
	if(!(this instanceof WordButton)){
		return new WordButton(inGame, aParent, obj);
	}
	
	this._inGame = inGame;
	this._aParent = aParent;
	
	this._wordButton = this._inGame.add.sprite(obj.x, obj.y, 'mainUI', 'btnWord.png');
	this._wordButton.inputEnabled = true;
	this._checkPointFlag = false;

	this._wordButton.anchor.set(0.6, 0.5);
	this._wordButton.x += this._wordButton.width/1.7;
	this._wordButton.y += this._wordButton.height/2;
	this._wordButton.name = obj.word;
	
	this._alphbatText = this._inGame.add.text(0,0,obj.word);
	this._alphbatText.font = 'debush';
	this._alphbatText.fontSize = 30;
	this._alphbatText.fill = '#000000';
	this._alphbatText.anchor.set(0.5, 0.5);
	
	this._wordButton.addChild(this._alphbatText);
	this._aParent.scene.fGroupWord.add(this._wordButton);
	
	var self = {};
	
	self.setOFFImage = function (){
		 this._wordButton.frameName = EWordButtonName.OFF;
		 this._wordButton.inputEnabled = false;
		 this._alphbatText.visible = false;
	}.bind(this);
	
	self.getWordButton = function (){
		 return this._wordButton;
	}.bind(this);
	
	self.getCheckPoint= function(){
		return this._checkPointFlag;
	}.bind(this);
	
	self.setCheckPoint = function(flag){
		this._checkPointFlag = flag;
	}.bind(this);	
	
	return self;
	
}
