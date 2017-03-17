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
	
};

InGame.prototype.initWordButton = function() {
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
	
	
	
	//this.scene.fGroupWord.add(this.graphics);
	
	this.game.input.onDown.add(this.mouseDragStart, this);
	this.game.input.addMoveCallback(this.mouseDragMove, this);
	this.game.input.onUp.add(this.mouseDragEnd, this);
};

InGame.prototype.update = function(){
//	if(this.drawLineFlag === true && this.game.input.mousePointer.isDown){
//		StzLog.print(this.game.input.x + "," + this.game.input.y);
//	}
//	
//	if(this.game.input.mousePointer.isDown){
//		StzLog.print(this.game.input.x + "," + this.game.input.y);
//	}
//	
//	if(this.lineDrawFlag === true){ 
//	this.graphics.clear();
//	this.graphics.beginFill(0xFF700B, 1);
//	
//	for (var index = 0; index < drawButtons.length; index++) {
//		if (index === 0) {
//			this.graphics.moveTo(drawButtons[index].x, drawButtons[index].y);
//		} else {
//			this.graphics.lineTo(drawButtons[index].x, drawButtons[index].y);	
//		}
//		//this.graphics.lineTo(drawButtons[index].x, drawButtons[index].y);
//	}
//	
//	this.graphics.lineTo(this.game.input.x, this.game.input.y);
//	StzLog.print(this.game.input.x + "," + this.game.input.y);
//	
//	this.graphics.endFill();
//	}
};

var drawButtons = [];

InGame.prototype.mouseDragStart = function(){
	var length = this.wordButtons.length;
	var hitPoint = new Phaser.Rectangle(this.game.input.x, this.game.input.y, 10, 10);
	
    for(var i=0;i<length;i++){
    	
    	var currentButton = this.wordButtons[i].getWordButton();

    	if(Phaser.Rectangle.intersects(hitPoint, currentButton.getBounds())) {
    		currentButton.scale.set(1.1,1.1);
    		
    		this.lineDrawFlag = true;
    		this.graphics = this.game.add.graphics(0, 0);
    		this.graphics.lineStyle(8, 0xffd900, 5);
    		this.curX = currentButton.x + currentButton.width/2;
    		this.curY = currentButton.y + currentButton.height/2;
    		break;
    	}
    } 
};


InGame.prototype.mouseDragMove = function(){
 
	if(this.lineDrawFlag === true){
	
		
		this.graphics.beginFill(0xFF700B, 1);
		
		this.graphics.moveTo(this.curX, this.curY);
		
		this.graphics.lineTo(this.game.input.x, this.game.input.y);

		this.curX = this.game.input.x;
		this.curY = this.game.input.y;
		
		this.graphics.endFill();
		
	}
};

InGame.prototype.mouseDragEnd = function(){
	var length = this.wordButtons.length;
	this.lineDrawFlag = false;
	
	 for(var i=0;i<length;i++){
	    var currentButton = this.wordButtons[i].getWordButton();
	    currentButton.scale.set(1,1);
	 }
	this.graphics.clear();
};