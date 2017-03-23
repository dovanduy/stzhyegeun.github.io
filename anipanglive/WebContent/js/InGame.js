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
	
	this.game.input.onDown.add(function(){
		this.controller.setMouseFlag(true);
		//this.controller.initMouseBlocks();
	}, this);
	this.game.input.addMoveCallback(this.controller.moveBlock, this.controller);
	this.game.input.onUp.add(function(){
		this.controller.setMouseFlag(false);
	}, this);
};

InGame.prototype.preload = function() {
	
};

InGame.prototype.create = function() {
	this.controller.initBoard();
	
	//시간 관련
	this.timeCount = StzGameConfig.GAME_LIMIT_TIME;
	this.remainTimeText = this.game.add.text(this.scene.fTimeGageBody.x + this.scene.fTimeGageBody.width/2, 
			this.scene.fTimeGageBody.y + this.scene.fTimeGageBody.height/2 +2, this.timeCount, {
		fontSize : '23px',
		fill : '#000000000',
		font : 'debush'
	},this.scene.fTopUIContainer);

	this.remainTimeText.anchor.set(0.5);	
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
	
	this.remainTimeText.anchor.set(0.5);
	this.startTimestamp = (new Date()).getTime();
	
	//점수 관련
	this.ScoreData = new Score();
	
	this.scoreText = this.game.add.text(0,0, this.ScoreData.getScore(), {
		fontSize : '23px',
		fill : '#000000000',
		font : 'debush'
	},this.scene.fTopUIContainer);
	
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
};

InGame.prototype.update = function() {
	this.controller.updateView();
	this.timerCheck();
};

InGame.prototype.timerCheck = function(){
	var currentTimestamp = (new Date()).getTime();
	
	this.remainSecond = 1 - ((currentTimestamp - this.startTimestamp) / 1000);
	
	if(this.remainSecond <= 0){
		
		this.timeCount--;
		this.remainTimeText.text = this.timeCount;
		
		this.startTimestamp = (new Date()).getTime();
		
	}
	
	if(this.timeCount <= 0){
		//this.endGame();
	}
};

var EControllerState = {
		USER_TURN 		: "USER_TURN",
		SLIDING_TURN 	: "SLIDING_TURN",
		MATCH_TURN 		: "MATCH_TURN",
		DROP_TURN		: "DROP_TURN",
		ANIM_TURN		: "ANIM_TURN",
		REFILL_TURN		: "REFILL_TURN",
			
};

var InGameController = function(inViewContext) {
	
	var blocks = StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	var state = EControllerState.USER_TURN;
	var _moveBlocks = [];
	var _mouseFlag = false;
	var _controlFlag = false;
	
	var self = {
		viewContext: inViewContext
	};
	
	self.setMouseFlag = function(flag){
		_mouseFlag = flag;
	};
	
	self.initMouseBlocks = function(){
		_moveBlocks = [];
	};
	
	self.controlFlag = function(flag){
		console.log(flag);
		_controlFlag = flag;
	};
	/**
	 * 블럭 객체 반환
	 */
	self.getBlock = function(inRowIndex, inColIndex) {
		StzLog.assert(inRowIndex >= 0 && inRowIndex < InGameBoardConfig.ROW_COUNT, '[InGameController] Invalide inRowIndex: ' + inRowIndex);
		StzLog.assert(inColIndex >= 0 && inColIndex < InGameBoardConfig.COL_COUNT, '[InGameController] Invalide inColIndex: ' + inColIndex);
		return blocks[inColIndex*InGameBoardConfig.ROW_COUNT + inRowIndex];
	};
	
	/**
	 * 초기 인게임 블럭 생성
	 */
	self.initBoard = function() {
		
		for (var index = 0; index < blocks.length; index++) {
			
			var randomType = StzUtil.createRandomInteger(5) - 1;
			blocks[index] = new BlockModel(EBlockType.list[randomType], EBlockSpType.NORMAL, index, self.viewContext);
			var blockView = blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
		}
	};

	self.updateView = function() {
		for (var index = 0; index < blocks.length; index++) {
			if (blocks[index] === null) {
				continue;
			}
			blocks[index].updateView();
		}
		
		if(state === EControllerState.USER_TURN){
			if(this.checkNormal() === false){
				console.log("슬라이드 유무 체크");
				state = EControllerState.SLIDING_TURN;
			}
		}
		else if(state === EControllerState.SLIDING_TURN){
			if(this.checkSlidingEnd() === true){
				console.log("슬라이드 끝남 체크");
				this.controlFlag(true);
				
				if(this.dropBlocks() === true){
					state = EControllerState.REFILL_TURN;
					this.controlFlag(true);
				}	
				else{
					state = EControllerState.MATCH_TURN;
				}
			}
		}
		else if(state === EControllerState.MATCH_TURN){
			console.log("매치시작");
			if(_moveBlocks.length === 2){
				if(this.checkMatched(function(){
					this.dropBlocksTempCheck();
					state = EControllerState.ANIM_TURN;
				}.bind(this)) !== 0){
					_moveBlocks = [];
				}

				else{
					//제자리로
					this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
		            
		            state = EControllerState.SLIDING_TURN;
					_moveBlocks = [];
				}
			}
			else{
				this.checkMatched(function(){
					this.controlFlag(true);
					this.dropBlocksTempCheck();
					state = EControllerState.ANIM_TURN;
					_moveBlocks = [];
				}.bind(this));
			}
		}
		else if(state === EControllerState.ANIM_TURN){
			this.controlFlag(true);
			if(this.checkAnim() === true){
				console.log("애니매이션 체크");
				state = EControllerState.DROP_TURN;
			}
		}
		
		else if(state === EControllerState.DROP_TURN){
			console.log("드롭시작");
			this.dropBlocks();
			state = EControllerState.REFILL_TURN;
		}
		
		else if(state === EControllerState.REFILL_TURN){
			console.log("리필");
			this.refillBoard();
			
			state = EControllerState.USER_TURN;
		}
	};
	
	self.blockViewSwap = function(toBlock, fromBlock){
		var index = toBlock.index;
		var preIndex = fromBlock.index;
			
		blocks[index].state = EBlockState.NORMAL;
		blocks[preIndex].state = EBlockState.NORMAL;
		
		var temp = blocks[index].view;
        blocks[index].view = blocks[preIndex].view;
        blocks[preIndex].view = temp; 
        	
        var temp = blocks[index].type;
        blocks[index].type = blocks[preIndex].type;
        blocks[preIndex].type = temp; 
	};
	
	// 컨트롤러에서 ...
	self.checkSlidingEnd = function(){
		for (var index = 0; index < blocks.length; index ++) {
			if (blocks[index].state !== EBlockState.NORMAL
				&&blocks[index].state !== EBlockState.REMOVE) {
				return false;
			}
		}	
		return true;
	};
	
	self.checkNormal = function(){
		for (var index = 0; index < blocks.length; index ++) {
			if (blocks[index].state !== EBlockState.NORMAL) {
				return false;
			}
		}	
		return true;
	};
	
	self.checkAnim = function(){
		for (var index = 0; index < blocks.length; index ++) {
			if (blocks[index].state === EBlockState.ANIMATION) {
				return false;
			}
		}	
		return true;
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
		
		var length = blocks.length;
		var mactedCount = 0;
		
		for(var i =0; i < length; i++)
		{
			var block = blocks[i];
			
			if( block != null && block.view != null)
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
					mactedCount += countVert;
				}

				if (countHoriz >= StzGameConfig.MATCH_MIN)
				{
					this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY);
					mactedCount += countVert;
				}
			}
		}
		
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
		
		return mactedCount;
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
	
	self.killBlockRange = function(from_X, from_Y, to_X, to_Y) {
		
		var fromX = Phaser.Math.clamp(from_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var fromY = Phaser.Math.clamp(from_Y , 0, InGameBoardConfig.ROW_COUNT - 1);
	    var toX = Phaser.Math.clamp(to_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var toY = Phaser.Math.clamp(to_Y, 0, InGameBoardConfig.ROW_COUNT - 1);

	    for (var i = fromX; i <= toX; i++)
	    {
	        for (var j = fromY; j <= toY; j++)
	        {
	        	//Start.prototype.playAnimations('animBlockMatch', i, j, function() {});
	            var block =  this.getBlock(i, j);
	            if(block === null) {
	            	return;
	            }  
	            block.state = EBlockState.REMOVE_ANIM;  
	        }
	    }
	};
	
	self.dropBlocks = function() {
		var dropflag = false;
	    for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
	    {
	        var dropRowCount = 0;

	        for (var j = InGameBoardConfig.ROW_COUNT- 1; j >= 0; j--)
	        {
	            var block = this.getBlock(i, j);
	            
	            if (block.view === null)
	            {
	                dropRowCount++;
	            }

	            else if (dropRowCount > 0)
	            {
	            	var preIndex = j*InGameBoardConfig.ROW_COUNT + i;
	            	var index = (j+dropRowCount)*InGameBoardConfig.ROW_COUNT + i;
	            	
	            	//일단 이렇게 나중에 수정함
	            	this.blockViewSwap(blocks[index], blocks[preIndex]);
	            	
	            	dropflag = true;
	            }

	        }
	    }
	    return dropflag;
	};
	
	self.dropBlocksTempCheck = function() {
		var dropflag = false;
	    for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
	    {
	        var dropRowCount = 0;

	        for (var j = InGameBoardConfig.ROW_COUNT- 1; j >= 0; j--)
	        {
	            var block = this.getBlock(i, j);
	            
	            if (block.state === EBlockState.REMOVE_ANIM)
	            {
	                dropRowCount++;
	            }

	            else if (dropRowCount > 0)
	            {
	            	var preIndex = j*InGameBoardConfig.ROW_COUNT + i;
	            	var index = (j+dropRowCount)*InGameBoardConfig.ROW_COUNT + i;
	            	
	            	//blocks[index].isMoveAndMatch = true;
	            	blocks[preIndex].isMoveAndMatch = true;
	            	//일단 이렇게 나중에 수정함
	            }

	        }
	    }
	    return dropflag;
	};
	
	self.refillBoard = function() {
		
		 for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
		    {
		        var blocksMissingFromCol = 0;

		        for (var j = InGameBoardConfig.ROW_COUNT - 1; j >= 0; j--)
		        {
		            var block = this.getBlock(i, j);
		            
		            if (block === null ||  block.view === null)
		            {
		            	blocksMissingFromCol++;
		            	var index = j*InGameBoardConfig.ROW_COUNT + i;
		            	var randomType = StzUtil.createRandomInteger(5) - 1;
		            	
		            	blocks[index] = new BlockModel(EBlockType.list[randomType], EBlockSpType.NORMAL, index, self.viewContext);
						blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));	 
		            }
		        }
		    }
	};
	
	self.moveBlock = function(pointer, x, y) {
		if(_controlFlag === false|| _mouseFlag === false || pointer.isDown === false){
			return;
		}
		console.log("불럭  들어옴");
		var hitPoint = new Phaser.Rectangle(x, y, 10, 10);
		var length = blocks.length;
		var hitFlag = false;
		
		for(var i=0;i<length;i++){
			var block = blocks[i];
			if(block !== null && block.view !== null){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.isMoveAndMatch === true) {
						console.log("이즈앤매치드 트루");
						return;
					}
					if(_moveBlocks.length === 0){
						console.log("불럭 0개 들어옴");
						_moveBlocks.push(block);
						return;
					}
					else if(_moveBlocks.length === 1){
						if(_moveBlocks[0].view.getBounds() === block.view.getBounds()) {
							//_mouseFlag = false;
							return;
						}
						
						console.log("불럭 1개 들어옴");
						_moveBlocks.push(block);

						if(Math.abs(_moveBlocks[0].posX - _moveBlocks[1].posX) === 1){
							if(Math.abs(_moveBlocks[0].posY - _moveBlocks[1].posY) === 0){
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
					            state = EControllerState.USER_TURN;
					            _mouseFlag = false;
					            this.controlFlag(false);
					            return;
							}
		
						}
						else if(Math.abs(_moveBlocks[0].posY - _moveBlocks[1].posY) === 1){
							if(Math.abs(_moveBlocks[0].posX - _moveBlocks[1].posX) === 0){
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
					            state = EControllerState.USER_TURN;
					            _mouseFlag = false;
					            this.controlFlag(false);
					            return;
							}
						}
						else{
							_mouseFlag = false;
							_moveBlocks = [];
						}
					}
					else{
						console.log("불럭 2개 들어옴");
						_mouseFlag = false;
						_moveBlocks = [];
					}
					hitFlag = true;
				}
			}			
		}
		if(hitFlag === false){
			_mouseFlag = false;
			_moveBlocks = [];
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


