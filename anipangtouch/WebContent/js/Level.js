/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Level.prototype = proto;


Level.prototype.init = function(inStageNumber) {
	StzCommon.StzLog.print("[Level (init)] inStageNumber: " + inStageNumber);
	
	this.blockBoardModel = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.blockBoardView = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
};


Level.prototype.create = function() {
	this.scene = new InGame(this.game);
	
	StzCommon.StzUtil.loadJavascript('js/ingame/BlockModel.js', function() {
		for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
			for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
				
				var blockKind = StzEBlockKind.NORMAL;
				var blockKindType = Math.floor(Math.random() * Number(StzEBlockKindType.NORMAL_COLOR_MAX) + 1);
				this.blockBoardModel[rowIndex][colIndex] = new BlockModel(blockKind, blockKindType, rowIndex, colIndex);
				
				var targetGroup = this.scene['fBlockBoardRow_' + rowIndex];
				this.blockBoardView[rowIndex][colIndex] = this.blockBoardModel[rowIndex][colIndex].createView(this.game, targetGroup);
			}
		}
		StzCommon.StzLog.print("[Level] create - blockBoardView");
	}, this);
};
