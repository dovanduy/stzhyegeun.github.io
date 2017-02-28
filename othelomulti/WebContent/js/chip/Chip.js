Chip.prototype = {
		inGame:null,
		aParent:null,
		posX:0,
		posY:0,
		rowIndex:0,
		colIndex:0,
		type:0,
		chip:null
};

function Chip(ingame, aParent, rowIndex, colIndex) {
	this.inGame = ingame;
	this.aParent = aParent;
	
	this.chip = this.inGame.add.sprite(0, 0, 'inGameUI', 'blackChipMini.png');
	this.chip.visible = false;
	
	this.rowIndex = rowIndex;
	this.colIndex = colIndex;
	this.posX = rowIndex*StzGameConfig.CHIP_WIDTH + StzGameConfig.CHIP_WIDTH/2;
	this.posY = colIndex*StzGameConfig.CHIP_HEIGHT + StzGameConfig.CHIP_HEIGHT/2 + StzGameConfig.BOARD_TOP_OFFSET;
	
	this.chip.x = this.posX;
	this.chip.y = this.posY;
	
	this.chip.anchor.set(0.5, 0.5);
	
	this.chip.inputEnabled = true;
	this.chip.events.onInputUp.add(this.onClickBlock, this);
	
	this.aParent.scene.fGroupChip.add(this.chip);
}

Chip.prototype.changeType = function(type){
	StzCommon.StzLog.print("[Chip changeState]");
	
	this.type = type;
	var frameName = StzGameConfig.getChipFrameName(type);
	
	if(type === EChipType.NONE){
		this.chip.visible = false;
	}
	else{
		this.chip.visible = true;
		this.chip.frameName = frameName;
	}
};

Chip.prototype.getType = function(){
	return this.type;
};

Chip.prototype.onClickBlock = function(){
	StzCommon.StzLog.print("[Chip onClickBlock]");

	if(this.type === EChipType.MINIBLACK){
		this.changeType(EChipType.BLACK);
		this.aParent.currentTurn = ETurn.WHITE;
	}
	else if(this.type === EChipType.MINIWHITE){
		this.changeType(EChipType.WHITE);
		this.aParent.currentTurn = ETurn.BLACK;
	}
	else {
		return;
	}
	
	this.aParent.checkAvailTurn(this.rowIndex, this.colIndex, this.type);
	this.aParent.removeAvailArea();
	this.aParent.findAvailArea();
};