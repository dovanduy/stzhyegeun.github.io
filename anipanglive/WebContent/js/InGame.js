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
	this.filters = InGameMatchFilter();
};

InGame.prototype.preload = function() {
	
};

InGame.prototype.create = function() {
	this.controller.initBoard();
};

InGame.prototype.update = function() {
	this.controller.updateView();
};


var InGameController = function(inViewContext) {
	
	var blocks = StzCommon.StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	var slidingArray = [];
	var canKill = false;
	var dropCount = 0;
	var dropFlag = false;
	var self = {
		viewContext: inViewContext
	};
	
	/**
	 * 블럭 객체 반환
	 */
	self.getBlock = function(inRowIndex, inColIndex) {
		StzCommon.StzLog.assert(inRowIndex >= 0 && inRowIndex < InGameBoardConfig.ROW_COUNT, '[InGameController] Invalide inRowIndex: ' + inRowIndex);
		StzCommon.StzLog.assert(inColIndex >= 0 && inColIndex < InGameBoardConfig.COL_COUNT, '[InGameController] Invalide inColIndex: ' + inColIndex);
		return blocks[inColIndex*InGameBoardConfig.ROW_COUNT + inRowIndex];
	};
	
	/**
	 * 초기 인게임 블럭 생성
	 */
	self.initBoard = function() {
		
		
		for (var index = 0; index < blocks.length; index++) {
			
			var randomType = StzCommon.StzUtil.createRandomInteger(5) - 1;
			blocks[index] = new BlockModel(EBlockType.list[randomType], EBlockSpType.NORMAL, index, self.viewContext);
			blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
		}
	};
	
	/**
	 * 전체 인게임 보드에서 매칭된 블럭 체크
	 */
	self.checkMatched = function(inCallback, inCallbackContext) {
		for (var filter in this.filters) {
			// check property
			if (this.filters.hasOwnProperty(filter) === false) {
				continue;
			}	
		}
	};
	
	self.updateView = function() {
//		if(slidingArray.length !== 0){
//			this.checkBlockMatches();
//		}
//		
//		if(dropFlag === true){
//			if(dropCount === 0){
//				this.checkBlockMatches();
//				dropFlag = false;
//			}
//		}
//		
//		this.dropBlocks();
//		
		
		for (var index = 0; index < blocks.length; index++) {
			if (blocks[index] === null) {
				continue;
			}
			
			if (blocks[index].view === null) {
				blocks[index] = null;
				continue;
			}
			
			if(blocks[index].state === EBlockState.SLIDING_END){
				blocks[index].state = EBlockState.NORMAL;
				this.checkBlockMatches(blocks[index]);		
			}
			
			blocks[index].updateView();
		}
	};
	
	self.checkBlockMatches = function(testBlock) {
//		if(slidingArray.length === 0) return;
//		
//		var length = slidingArray.length;
//		
//		for(var i =0; i < length; i++)
//		{
//			if(slidingArray[i].state !== EBlockState.SLIDING_END){
//				return;
//			}
//		}
//		
//		for(var i =0; i < length; i++)
//		{
			var block = testBlock;
			
			if( block != null)
			{
				var countUp = this.countSameTypeBlock(block, 0, -1);
				var countDown = this.countSameTypeBlock(block, 0, 1);
				var countLeft = this.countSameTypeBlock(block, -1, 0);
				var countRight = this.countSameTypeBlock(block, 1, 0);
				
				var countHoriz = countLeft + countRight + 1;
				var countVert = countUp + countDown + 1;
				
				if (countVert >= StzGameConfig.MATCH_MIN)
				{
					this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown);
				}

				if (countHoriz >= StzGameConfig.MATCH_MIN)
				{
					this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY);
				}
			}
			
			this.dropBlocks();
		//}
		//slidingArray = [];
	};
	
	self.countSameTypeBlock = function(startBlock, moveX, moveY) {
		var curX = startBlock.posX + moveX;
		var curY = startBlock.posY + moveY;
		var count = 0;

		while (curX >= 0 && curY >= 0 && curX < InGameBoardConfig.COL_COUNT 
				&& curY < InGameBoardConfig.ROW_COUNT &&this.getBlock(curX, curY) != null && this.getBlock(curX, curY).type === startBlock.type)
		{
			count++;
		    curX += moveX;
		    curY += moveY;
		}

		return count;
	};
	
	self.killBlockRange = function(fromX, fromY, toX, toY) {
		fromX = Phaser.Math.clamp(fromX, 0, InGameBoardConfig.COL_COUNT - 1);
	    fromY = Phaser.Math.clamp(fromY , 0, InGameBoardConfig.ROW_COUNT - 1);
	    toX = Phaser.Math.clamp(toX, 0, InGameBoardConfig.COL_COUNT - 1);
	    toY = Phaser.Math.clamp(toY, 0, InGameBoardConfig.ROW_COUNT - 1);

	    for (var i = fromX; i <= toX; i++)
	    {
	        for (var j = fromY; j <= toY; j++)
	        {
	        	//Start.prototype.playAnimations('animBlockMatch', i, j, function() {});
	            var block =  this.getBlock(i, j);
	            if(block === null) return;
	            
	            block.state = EBlockSpType.REMOVE;
	            
	        }
	    }
	};
	
	self.dropBlocks = function() {
	    for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
	    {
	        var dropRowCount = 0;

	        for (var j = InGameBoardConfig.ROW_COUNT- 1; j >= 0; j--)
	        {
	            var block = this.getBlock(i, j);

	            if (block === null)
	            {
	                dropRowCount++;
	            }
	            else if (dropRowCount > 0)
	            {
	            	dropCount++;
	            	dropFlag = true;
	            	var preIndex = j*InGameBoardConfig.ROW_COUNT + i;
	            	var index = (j+dropRowCount)*InGameBoardConfig.ROW_COUNT + i;
	            	
	            	var temp = blocks[index];
	            	blocks[index] = blocks[preIndex];
	            	blocks[preIndex] = temp;
	            	
	            	block.setBlockPos(index);            	
	            }
	        }
	    }
	    //this.refillBoard();
	};
	
	self.refillBoard = function() {
		
		 for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
		    {
		        var blocksMissingFromCol = 0;

		        for (var j = InGameBoardConfig.ROW_COUNT - 1; j >= 0; j--)
		        {
		            var block = this.getBlock(i, j);
		            
		            if (block === null)
		            {
		            	blocksMissingFromCol++;
		            	var index = j*InGameBoardConfig.ROW_COUNT + i;
		            	var randomType = StzCommon.StzUtil.createRandomInteger(5) - 1;
		            	
		            	blocks[index] = new BlockModel(EBlockType.list[randomType], EBlockSpType.NORMAL, index, self.viewContext);
						blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));	 
		            }
		        }
		    }
	};
	
	return self;
};

var InGameMatchFilter = function() {
	var self = {
		// make randompang
		FIVE_HORIZONTAL: [0, 1, 2, 3, 4], 
		FIVE_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 3, InGameBoardConfig.ROW_COUNT * 4],

		// make circlepang
		FIVE_KOR_N: [0, 1, 2, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT * 2 + 1], 
		FIVE_KOR_H: [1, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2],
		FIVE_KOR_K: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2], 
		FIVE_KOR_J: [2, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_S: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_INVERS_S: [2, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 2 + 1, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_R: [0, 1, 2, InGameBoardConfig.ROW_COUNT + 2, InGameBoardConfig.ROW_COUNT * 2 + 2], 
		FIVE_KOR_INVERS_R: [0, 1, 2, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2],
			
		// make line pang
		FOUR_HORIZONTAL: [0, 1, 2, 3], 
		FOUR_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 3],
		FOUR_RECT: [0, 1, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT + 1],
		
		// just matched
		THREE_HORIZONTAL: [0, 1, 2], 
		THREE_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2],
	};
	
	return self;
};