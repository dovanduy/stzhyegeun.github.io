InGame.prototype = {
		pauseGame:null,
		stageData:null,
		blocksCount:0,
		limitTime:0,
		isPause:false,
		isReady:false,
		blocks:[]
};

function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.init = function(stageData){
	this.stageData = stageData;
};

InGame.prototype.create = function() {
	this.isPause = true;
	this.isReady = false;
	
	this.scene.fRedBlind_png.visible = false;

	this.scene.fBtnPause.inputEnabled = true;
	this.scene.fBtnPause.events.onInputDown.add(this.onPause, this);
	
	this.storyMapInfoPopup = new PopupPauseGame(this.game, this);
	this.createBlock();
};

InGame.prototype.update = function() {
	if (this.isReady === false){
		this.showReadyMessage();
		return;
	}
	
	if (this.isPause === true) {
		return;
	}
};

InGame.prototype.showReadyMessage = function() {
	this.scene.fGameGo.visible = true;
	this.isReady = true;
	
	this.scene.fGameGo.alpha = 0;
	
	var tween = this.game.add.tween(this.scene.fGameGo);
	tween.to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
	
	tween.onComplete.addOnce(function() {
		this.scene.fGameGo.frameName = "gameGo.png";
		this.scene.fGameGo.alpha = 0;
		
		var tween = this.game.add.tween(this.scene.fGameGo);
		tween.to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
		
		tween.onComplete.addOnce(function() {
			this.scene.fGameGo.visible = false;
			this.isPause = false;
			
			this.shuffleBlock();
		},this);
	},this);
};

InGame.prototype.createBlock = function() {
	var blockNum = 0;
	//한 종류의 블럭의 최대 수 
	var blockSetCount = this.stageData.stageInGameData.blockSetCount;
	var blockTypeCount = 0;
	
	var blockType = 1;
	
	this.blocks = [];
	for(var i=0;i<this.stageData.stageInGameData.patterns.length;i++){
		if(this.stageData.stageInGameData.patterns[i] === "0") continue;
		
		this.blocks.push(new Phaser.Plugin.block(this.game, this, i));
		this.blocks[blockNum].readyBlockShow();
		this.blocks[blockNum].setBlockType(blockType);
		
		blockNum++;
		blockTypeCount++;
		
		if(blockTypeCount === blockSetCount){
			blockTypeCount = 0;
			blockType++;
		}
	}
	this.blocksCount = blockNum;
};

InGame.prototype.shuffleBlock = function() {
	var tempArray = [];
	for(var i=0;i<this.blocksCount;i++){
		tempArray.push(this.blocks[i].getBlockPos());
	}
	
	tempArray = this.shuffleArray(tempArray);
	
	for(var i=0;i<this.blocksCount;i++){
		this.blocks[i].setBlockPos(tempArray[i]);
		this.blocks[i].startBlockShow();
	}
};

InGame.prototype.shuffleArray = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
};

InGame.prototype.onPause = function() {
	this.storyMapInfoPopup.onShow();
};

InGame.prototype.onDestory = function() {
	this.storyMapInfoPopup.onDestory();
	
	this.blocks = [];
};