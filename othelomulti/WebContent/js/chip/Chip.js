Chip.prototype = {
		inGame:null,
		aParent:null,
		posX:0,
		posY:0,
		rowIndex:0,
		colIndex:0,
		type:0,
		animationFlag:false,
		chip:null
};

function Chip(ingame, aParent, rowIndex, colIndex) {
	this.inGame = ingame;
	this.aParent = aParent;
	
	this.chip = this.inGame.add.sprite(0, 0, 'inGameUI', 'blackChipMini.png');
	this.chip.visible = false;
	this.animationFlag = false;
	
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

Chip.prototype.animationChangeType = function(type){
	StzCommon.StzLog.print("[Chip changeState]");
	
	this.animationFlag = false;
	this.type = type;
	var frameName = StzGameConfig.getChipFrameName(type);
	
	this.chip.frameName = frameName;
	this.chip.visible = true;
	this.chip.alpha = 0;
	var tween = this.inGame.add.tween(this.chip);
	tween.to( { alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, true);
	
	tween.onComplete.addOnce(function() {
		this.chip.alpha = 1;
		this.animationFlag = true;
		this.aParent.onChangeComplete();
		
	}.bind(this));

};

Chip.prototype.getType = function(){
	return this.type;
};

Chip.prototype.onClickBlock = function(){
	StzCommon.StzLog.print("[Chip onClickBlock]");

	if(this.type === EChipType.MINIBLACK){
		this.changeType(EChipType.BLACK);
	}
	else if(this.type === EChipType.MINIWHITE){
		this.changeType(EChipType.WHITE);
	}
	else {
		return;
	}
	
	this.aParent.removeAvailArea();
	this.aParent.checkAvailTurn(this.rowIndex, this.colIndex, this.type);
	this.aParent.onSendData(this.rowIndex, this.colIndex, this.type, this.aParent.currentTurn);
};