InGame.prototype = {
		pauseGame:null,
		stageData:null,
		blocksCount:0,
		limitTime:0,
		isPause:false,
		isReady:false,
		blocks:[],
		chekingArray:[]
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
	this.blocks = [];
	this.chekingArray = [];
	
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
		
		this.blocks.push(new Phaser.Plugin.block(this.game, this, i, blockNum));
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

InGame.prototype.checkBlock= function(index){
	if(this.chekingArray.length === 0 ){
		this.chekingArray.push(this.blocks[index]);
	}
	else if(this.chekingArray.length === 1){
		this.chekingArray.push(this.blocks[index]);
		
		this.chekingArray[0].startBlockShow();
		this.chekingArray[1].startBlockShow();
		
		this.findWay(this.chekingArray[0].index, this.chekingArray[1].index);
		
		this.chekingArray = [];
	}
	else{
		StzCommon.StzLog.print("[checkBlock] Error");
	}
};

InGame.prototype.findWay = function(src, des){

	if ( src == des || this.blocks[src] == null || this.blocks[des] == null )
	{
		return 0;
	}
	
	var src_value = this.blocks[src].posBlock;
	var des_value = this.blocks[des].posBlock;
	
	var boardWidth = StzGameConfig.BOARD_WIDTH;
	var boardHeight = StzGameConfig.BLOCK_HEIGHT;
	
	var start = 0;
	var end = 0;
	var xory = 0;
	var v = 0;
	
	if ( src_value != des_value )
	{
		return 0;
	}
	
//	toPointY(src) == toPointY(des). y가 같은 줄에 있는 상황
	if ( Math.floor(src / boardWidth) == Math.floor(des / boardWidth))
	{
		if ( (src_value == des_value) && (src_value > -1) && (des_value > -1) )
		{
			if ( Math.abs((src % boardWidth) - (des % boardWidth)) == 1 )// check x
			{
				return 1;
			}
			else
			{
				start = is_smaller((src % boardWidth), (des % boardWidth));
				end = is_bigger((src % boardWidth), (des % boardWidth));
				xory = Math.floor(src / boardWidth);
				
				for (var i = start+1 ; i < end ; i++)
				{
					v = getBlockData(i + xory * boardWidth);
					if ( v != -1 && v != BLOCK_VALUE_SPECIAL && v != BLOCK_VALUE_TABLE && v != BLOCK_VALUE_DUST)
					{
						break;
					}
				}
				
				if (i == end)
				{
					return 1;
				}
			}
		}
	}
};

//InGame.prototype.getBlockData(index){
//	
//};

InGame.prototype.onPause = function() {
	this.storyMapInfoPopup.onShow();
};

InGame.prototype.onDestory = function() {
	this.storyMapInfoPopup.onDestory();
	
	this.blocks = [];
};