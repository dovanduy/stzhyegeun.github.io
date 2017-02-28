function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function() {
	
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.currentTurn = ETurn.BLACK;
};

InGame.prototype.preload = function() {
	
};

InGame.prototype.create = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.initBoard = function() {
	
	var result = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
};




function ChipData(inType, inRow, inCol) {
	this.chipType = inType;
	this.chipIndex
}