function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;
var ListView = window.PhaserListView.ListView;

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.initWordButton();
	this.initWordBoard();
	
	this.graphics = this.game.add.graphics(0, 0);
};

InGame.prototype.initWordBoard = function() {
	this.listView = new ListView(this.game, this.world, new Phaser.Rectangle(55, 85, 375, 300), {
	      direction: 'y',
	      padding: 10,
	    });
	
	 var length = this.wordData.wordArray.length;
	 
	 for (var i = 0; i < length; i++) {
		 var group = this.game.make.group(this.scene);
		 var groupBg = this.game.make.group(this.scene);
		 var groupText = this.game.make.group(this.scene);
		 
		 var bgList = this.game.add.sprite(0,0,"mainUI", "list.png", group);
		 bgList.height = 50;
		
		 
		 var wordLength = this.wordData.wordArray[i].word.length;
		 
		 for(var index = 0; index<wordLength; index++){
			 var bgWord = this.game.add.sprite(54*index,0,"mainUI", "bgWord.png", groupBg);
			 bgWord.width = 50;
			 bgWord.height = bgList.height;
			
			 var text = this.game.add.text(0, 5, this.wordData.wordArray[i].word[index],null, groupText);
			 text.setTextBounds(bgWord.x, bgWord.y, bgWord.width, bgWord.height);
			 text.font = 'debush';
			 text.fontSize = 33;
			 text.fill = '#FFFFFF';
			 
			 text.boundsAlignH = "center";
			 text.boundsAlignV = "middle"; 
		 }
		 groupText.visible = false;
		 group.add(groupBg);
		 group.add(groupText);
		 
		 //text.visible = false;
		 
		 this.listView.add(group);
	 }
};

InGame.prototype.initWordButton = function() {
	this.scene.fBgWord.visible = false;
	
	this.alphabetText = this.game.add.text(this.scene.fBgWord.x,this.scene.fBgWord.y - 5,"");
	this.alphabetText.font = 'debush';
	this.alphabetText.fontSize = 60;
	this.alphabetText.fill = '#FFFFFF';
	
	this.wordData = new WordData();
	
	this.wordButtons = [];
	var length = this.wordData.alphabetArray.length;
//	this.disableNumber = [];
//	
//	if(length === 4){
//		this.disableNumber.push(3);
//	}
//	else if(length === 5){
//		this.disableNumber.push(4);
//	}
//	else if(length === 6){
//		this.disableNumber.push(4);
//		this.disableNumber.push(5);
//	}
	
	for(var i =0;i<length;i++){
		var obj = {
				x:this.scene["fBtnPos0"+i].x,
				y:this.scene["fBtnPos0"+i].y,
				word:this.wordData.alphabetArray[i]
		};
		
		this.wordButtons.push(new WordButton(this.game, this, obj));
		
//		for(var j =0; j<this.disableNumber.length; j++){
//			if(i === this.disableNumber[j]){
//				this.wordButtons[i].setOFFImage();
//				break;
//			}
//		}
	}
	
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

	this.alphabetText.text = "";
	this.scene.fBgWord.visible = true;
	
	var length = this.drawButtons.length;
	
	for (var index = 0; index < length; index++) {
		
		this.alphabetText.text += this.drawButtons[index].name;
	}
	this.scene.fBgWord.width = this.alphabetText.width + 3;
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
	
	this.alphabetText.fill = "#FFFFFF";
	this.scene.fBgWord.visible = false;
	this.alphabetText.text = "";
	this.preLength = 0;
	 
    this.mouseCollisionCheck(hitPoint);
    
    delete hitPoint;
};

InGame.prototype.mouseDragMove = function(){
 
	if(this.lineDrawFlag === true){
		this.graphics.clear();
		var hitPoint = new Phaser.Rectangle(this.game.input.x, this.game.input.y, 10, 10);
		
		this.mouseCollisionCheck(hitPoint);
		
		delete hitPoint;
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
	 
	 this.wordMatchingCheck();
	 
	 this.game.time.events.add(500, function(){
		 this.scene.fBgWord.visible = false;
		 this.alphabetText.text = "";
		 this.preLength = 0;
	}.bind(this));
 
};

InGame.prototype.wordMatchingCheck = function(){
	var text = this.alphabetText.text;
	
	var length = this.wordData.wordArray.length;
	var matchedFlag = false;
	var matcehdNum = 0;
	
	for(var i =0; i< length; i++){
		if(text === this.wordData.wordArray[i].word){
			matchedFlag = true;
			matcehdNum = i;
			break;
		}
	
	}
	//this.listView.scroller.handleMove(100 ,300, 0);
	
	if(matchedFlag === true){
		if(this.wordData.wordArray[matcehdNum].state === EWrodState.NONE){
			this.alphabetText.fill = "#00FF00";
			this.wordData.wordArray[matcehdNum].state = EWrodState.ME_CLEAR;
			
			this.listView.items[matcehdNum].children[2].visible = true;
		}
		else{
			this.alphabetText.fill = "#FF8040";
		}
	}
	else{
		this.alphabetText.fill = "#FF0000";
	}
	
};