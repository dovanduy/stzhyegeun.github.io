/**
 * Level state.
 */
function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function() {
	this.scene = new InGameScene(this);
	this.controller = InGameController(this);
};

InGame.prototype.preload = function() {
	
};

InGame.prototype.create = function() {
	this.controller.initBoard();
};


var InGameController = function(inViewContext) {
	
	//var blocks = StzCommon.StzUtil.createArray(InGameBoardConfig.ROW_COUNT, InGameBoardConfig.COL_COUNT);
	var blocks = StzCommon.StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	
	var self = {
		viewContext: inViewContext
	};
	
	self.getBlock = function(inRowIndex, inColIndex) {
		StzCommon.StzLog.assert(inRowIndex >= 0 && inRowIndex < InGameBoardConfig.ROW_COUNT, '[InGameController] Invalide inRowIndex: ' + inRowIndex);
		StzCommon.StzLog.assert(inColIndex >= 0 && inColIndex < InGameBoardConfig.COL_COUNT, '[InGameController] Invalide inColIndex: ' + inColIndex);
		return blocks[inRowIndex, inColIndex];
	};
	
	self.initBoard = function() {
		for (var index = 0; index < blocks.length; index++) {
			
			var randomType = StzCommon.StzUtil.createRandomInteger(5) - 1;
			blocks[index] = new BlockModel(EBlockType.list[randomType], EBlockSpType.NORMAL, index, self.viewContext);
			blocks[index].createView();
		}
	};
	
	
	return self;
};

var InGameMatchFilter = function() {
	var self = {
		THREE_HORIZONTAL: [0, 1, 2], 
		THREE_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2],
		
		FOUR_HORIZONTAL: [0, 1, 2, 3], 
		FOUR_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 3],
		FOUR_RECT: [0, 1, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1],
		
		FIVE_HORIZONTAL: [0, 1, 2, 3, 4], 
		FIVE_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 3, InGameBoardConfig.ROW_COUNT * 4],
		
		FIVE_KOR_N: [0, 1, 2, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT * 2 + 1], 
		FIVE_KOR_H: [1, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2],
		FIVE_KOR_K: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2], 
		FIVE_KOR_J: [2, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_S: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_INVERS_S: [2, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_R: [0, 1, 2, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_INVERS_R: [0, 1, 2, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2]
	};
	
	return self;
};