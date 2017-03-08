Block.prototype = {
		inGame:null,
		aParent:null,
		posX:0,
		posY:0,
		rowIndex:0,
		colIndex:0,
		type:0,
		block:null
};

function Block(ingame, aParent, rowIndex, colIndex) {
	this.inGame = ingame;
	this.aParent = aParent;
	
	this.block = this.inGame.add.sprite(0, 0, 'inGameUI', 'blackBlock.png');
	this.block.alpha = 0;

	this.rowIndex = rowIndex;
	this.colIndex = colIndex;
	this.posX = rowIndex*StzGameConfig.BLOCK_WIDTH + StzGameConfig.BLOCK_WIDTH/2;
	this.posY = colIndex*StzGameConfig.BLOCK_HEIGHT + StzGameConfig.BLOCK_HEIGHT/2 + StzGameConfig.BOARD_TOP_OFFSET;
	
	this.block.x = this.posX;
	this.block.y = this.posY;
	
	this.block.width = StzGameConfig.BLOCK_WIDTH;
	this.block.height = StzGameConfig.BLOCK_HEIGHT;
	
	this.block.anchor.set(0.5, 0.5);
	
	this.block.inputEnabled = true;
	this.block.events.onInputUp.add(this.onClickBlock, this);
	
	this.aParent.scene.fGroupBlock.add(this.block);
}

Block.prototype.changeType = function(type){
	StzCommon.StzLog.print("[Block changeState]");
	
	this.type = type;
	var frameName = StzGameConfig.getChipFrameName(type);
	
	if(type === EBlockType.NONE){
		this.block.alpha = 0;
	}
	else{
		this.block.alpha = 1;
		this.block.frameName = frameName;
	}
	
	this.block.width = StzGameConfig.BLOCK_WIDTH;
	this.block.height = StzGameConfig.BLOCK_HEIGHT;
};

Block.prototype.onClickBlock = function(){
	StzCommon.StzLog.print("[Block onClickBlock]");
	if(this.aParent.myColor !== this.aParent.currentTurn){
		return;
	}
	
	var curType = (this.aParent.currentTurn === ETurn.BLACK)?EBlockType.BLACK:EBlockType.WHITE;
	var changeType = (this.aParent.currentTurn === ETurn.BLACK)?EBlockType.WHITE:EBlockType.BLACK;
	
	if(this.type === EBlockType.NONE){
		this.block.alpha = 1;
		this.changeType(curType);
		
	}

	else {
		return;
	}
	
	if(this.aParent.checkAvailTurn(this.rowIndex, this.colIndex, curType) === true){
		this.aParent.requestChangeTurn(this.rowIndex, this.colIndex, curType);
	}
};

Block.prototype.getType = function(){
	if(this.type === EBlockType.FORBIDERN){
		return EBlockType.NONE;
	}

	return this.type;
};