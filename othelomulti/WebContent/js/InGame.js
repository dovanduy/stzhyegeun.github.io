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
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.initBoard();
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Chip(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeState(EChipType.MINIWHITE);	
		}
	}
	
	
};

function ChipData(inType, inRow, inCol) {
	this.chipType = inType;
	
}