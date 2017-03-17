function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.initWordButton();
	this.graphics = this.game.add.graphics(0, 0);
};

InGame.prototype.initWordButton = function() {
	this.scene.fBgWord.visible = false;
	
	this.alphbetText = this.game.add.text(this.scene.fBgWord.x,this.scene.fBgWord.y - 5,"");
	this.alphbetText.font = 'debush';
	this.alphbetText.fontSize = 60;
	this.alphbetText.fill = '#FFFFFF';
	
	this.wordButtons = [];
	this.wordArray = ["L", "O", "V", "E", "S", "T"];
	
	for(var i =0;i<StzGameConfig.MAX_WORD_BUTTON_COUNT;i++){
		var obj = {
				x:this.scene["fBtnPos0"+i].x,
				y:this.scene["fBtnPos0"+i].y,
				word:this.wordArray [i]
		};
		
		this.wordButtons.push(new WordButton(this.game, this, obj));
	}
	
	this.wordButtons[4].setOFFImage();
	this.wordButtons[5].setOFFImage();
	
	this.game.input.onDown.add(this.mouseDragStart, this);
	this.game.input.addMoveCallback(this.mouseDragMove, this);
	this.game.input.onUp.add(this.mouseDragEnd, this);
};

InGame.prototype.update = function(){
	if(this.drawButtons === undefined || this.drawButtons === null || this.drawButtons.length === 0){
		return;
	}
	
	var length = this.drawButtons.length;
	  
	if(this.lineDrawFlag === true && length > 0){

		this.drawText(length);
		
		this.graphics.lineStyle(8, 0xffd900, 5);
	    this.graphics.beginFill(0xFF700B, 1);
	        
	    for (var index = 0; index < length - 1; index++) {
	        	this.graphics.moveTo(this.drawButtons[index].x, this.drawButtons[index].y);
	        	this.graphics.lineTo(this.drawButtons[index + 1].x, this.drawButtons[index + 1].y);    
	    }
	    
	    this.graphics.moveTo(this.drawButtons[this.drawButtons.length - 1].x, this.drawButtons[this.drawButtons.length - 1].y);
	    this.graphics.lineTo(this.game.input.x, this.game.input.y);
	    this.graphics.endFill();
	}
};

InGame.prototype.drawText = function(length){
	if(length <= this.preLength){
		return;
	}

	this.alphbetText.text = "";
	this.scene.fBgWord.visible = true;
	
	var length = this.drawButtons.length;
	
	for (var index = 0; index < length; index++) {
		
		this.alphbetText.text += this.drawButtons[index].name;
	}
	this.scene.fBgWord.width = this.alphbetText.width + 3;
	this.preLength = length;
};

InGame.prototype.mouseCollisionCheck = function(mouseArea){
	var length = this.wordButtons.length;
	
	for(var i=0;i<length;i++){
    	
    	var currentButton = this.wordButtons[i].getWordButton();

    	if(Phaser.Rectangle.intersects(mouseArea, currentButton.getBounds())
    		&& currentButton.frameName !== EWordButtonName.OFF
    		&& this.wordButtons[i].getCheckPoint() === false) {
    		currentButton.scale.set(1.1,1.1);
    		
    		 if (this.drawButtons.indexOf(currentButton) < 0) {
                 this.drawButtons.push(currentButton);
             }
    		 
    		this.lineDrawFlag = true;
    	}
    }
};

InGame.prototype.mouseDragStart = function(){
	var hitPoint = new Phaser.Rectangle(this.game.input.x, this.game.input.y, 10, 10);
	this.drawButtons = [];
	
    this.mouseCollisionCheck(hitPoint);
};

InGame.prototype.mouseDragMove = function(){
 
	if(this.lineDrawFlag === true){
		this.graphics.clear();
		var hitPoint = new Phaser.Rectangle(this.game.input.x, this.game.input.y, 10, 10);
		
		this.mouseCollisionCheck(hitPoint);
	}
};

InGame.prototype.mouseDragEnd = function(){
	var length = this.wordButtons.length;
	this.lineDrawFlag = false;
	
	 for(var i=0;i<length;i++){
	    var currentButton = this.wordButtons[i].getWordButton();
	    currentButton.scale.set(1,1);
	    this.wordButtons[i].setCheckPoint(false);
	 }
	 
	 if(this.graphics !== undefined && this.graphics !== null){
		 this.graphics.clear();
	 }
	 
	 this.scene.fBgWord.visible = false;
	 this.alphbetText.text = "";
	 this.preLength = 0;
};