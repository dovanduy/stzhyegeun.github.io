/**
 * Level state.
 */
function AniBot(inContext, inDifficulty) {
	
	var _context = inContext;
	var _difficulty = inDifficulty || 10;
	
	var MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
	var MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
	var PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
	var PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
	var MAX_AUTO_MATCH_COUNT = 30;
	var AUTO_DIFFICULTY_SCORE_OFFSET = 100000;
	
	var _currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
	var _remainMatchTime = _currentMatchTime;
	var _aniState = 1;
	
	var self = {
		score: 0, 
		combo: 0,
		totalMatchedBlock: 0,
		autoDifficulty: false,
		playListener: null
	};
	
	self.EState = {
		THINKING: 0, 
		READY: 1,
		PLAYED: 2
	};

	self.getAniState = function() {
		return _aniState;
	};
	
	self.setNextMatch = function() {
		if (_aniState === self.EState.PLAYED) {
			
			if (self.autoDifficulty) {
				if (self.score - Score.score > AUTO_DIFFICULTY_SCORE_OFFSET) {
					self.updateDifficulty(_difficulty + 1);
				} else if (Score.score - self.score > AUTO_DIFFICULTY_SCORE_OFFSET) {
					self.updateDifficulty((_difficulty <= 1) ? _difficulty : _difficulty - 1);
				}
			}
			
			_aniState = self.EState.THINKING;
			_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS);
			_remainMatchTime = _currentMatchTime;
			_aniState = self.EState.READY;
		} 
	};
	
	self.updateDifficulty = function(newDifficulty) {
		if (_difficulty === newDifficulty) {
			return;
		} 
		
		_difficulty = newDifficulty || 10;
		MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
		MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
		PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
		PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
		
		_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
		_remainMatchTime = _currentMatchTime;
		
	};
	
	self.playBot = function() {
		
		self.combo = (_currentMatchTime <= EScoreConfig.COMBO_TIME) ? self.combo + 1 : 0;
		console.log('[AniBot] currentMatchTime: ' + _currentMatchTime);
		
		var matchCount = (function() {
			var autoMatchCount = StzUtil.createRandomInteger(0, MAX_AUTO_MATCH_COUNT);
			var randValue = Math.random();
			if (randValue <= PROB_FIVE_MATCH) {
				return 5 + autoMatchCount;
			} else if (randValue <= PROB_FOUR_MATCH) {
				return 4 + autoMatchCount;
			} else {
				return 3 + autoMatchCount;
			}
		})();
		
		self.totalMatchedBlock = self.totalMatchedBlock + matchCount; 
		self.score = self.score + ((self.combo + 1) * EScoreConfig.UNIT_SCORE * matchCount);
		
		_aniState = self.EState.PLAYED;
		if (self.playListener && typeof self.playListener === 'function') {
			self.playListener();
		} 
	};
	
	self.update = function() {
		_remainMatchTime = _remainMatchTime - _context.game.time.elapsedMS;
		if (_remainMatchTime <= 0 && _aniState === self.EState.READY) {
			self.playBot();
			self.setNextMatch();
		}
	};
	
	return self;
}

function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;



InGame.prototype.init = function(inIsBot) {

	if (inIsBot === true) {
		this.aniBot = new AniBot(this, 5);
		this.aniBot.autoDifficulty = false; // 자동 난이도 조절
		this.aniBot.playListener = (function() {
			if (this.rivalText) {
				this.rivalText.text = "Score: " + this.aniBot.score + ", Combo: " + this.aniBot.combo + ", total: " + this.aniBot.totalMatchedBlock;
			}
		}).bind(this);
	}
	//점수 관련
	this.scoreData = new Score();
	
	this.scene = new InGameScene(this);
	this.controller = InGameController(this);
	this.filters = InGameMatchFilter();
	
	this.game.input.onDown.add(function(){
		this.controller.setMouseFlag(true);
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
	
	// 라이벌 관련
	var rivalStyle = { font: 'bold 15px Arial', fill: '#fff' };
	this.rivalText = this.game.add.text(0, 0, "", rivalStyle);
	
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
	
	this.scoreText = this.game.add.text(0,30, this.scoreData.getScore(), {
		fontSize : '30px',
		fill : '#FFFFFF',
		font : 'debush'
	},this.scene.fTopUIContainer);
	
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
};

InGame.prototype.update = function() {
	if (this.aniBot) {
		this.aniBot.update();	
	}
	this.controller.updateView();
	this.timerCheck();
	
	this.scoreText.text = this.scoreData.getScore();
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
	var _returnFlag = false;
	var scoreData = inViewContext.scoreData;
	
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
		//console.log(flag);
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
			
			var randomType = StzUtil.createRandomInteger(0, 4);
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
		
		if(_returnFlag === true){
			if(this.checkSlidingEnd() === true){
				this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
	            
	            state = EControllerState.SLIDING_TURN;
	            
				_moveBlocks = [];
				_returnFlag = false;
			}
		}
		
		this.dropBlocksTempCheck();
		
		if(state === EControllerState.USER_TURN){
			
			if(this.checkNormal() === false){
				StzLog.print("슬라이드 유무 체크");
				state = EControllerState.SLIDING_TURN;
			}
		}
		else if(state === EControllerState.SLIDING_TURN){
			if(this.checkSlidingEnd() === true){
				StzLog.print("슬라이드 끝남 체크");
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
			StzLog.print("매치시작");
			
			if(_moveBlocks.length === 2){
				this.checkMatched(function(){
					this.dropBlocksTempCheck();
					state = EControllerState.ANIM_TURN;
				}.bind(this));
				_moveBlocks = [];
			}
			else{
				this.checkMatched(function(){
					this.dropBlocksTempCheck();
					state = EControllerState.ANIM_TURN;
					_moveBlocks = [];
				}.bind(this));
			}
		}
		else if(state === EControllerState.ANIM_TURN){
			this.controlFlag(true);
			if(this.checkAnim() === true){
				StzLog.print("애니매이션 체크");
				state = EControllerState.DROP_TURN;
			}
		}
		
		else if(state === EControllerState.DROP_TURN){
			StzLog.print("드롭시작");
			this.dropBlocks();
			state = EControllerState.REFILL_TURN;
		}
		
		else if(state === EControllerState.REFILL_TURN){
			StzLog.print("리필");
			this.refillBoard();
			
			state = EControllerState.USER_TURN;
		}
	};
	
	self.blockViewSwap = function(toBlock, fromBlock){
		var index = toBlock.index;
		var preIndex = fromBlock.index;
			
		if(blocks[index] === null || blocks[index].state === undefined|| 
		(blocks[index].state !== EBlockState.NORMAL && blocks[index].state !== EBlockState.SLIDING_END && blocks[index].state !== EBlockState.REMOVE)){
			return;
		}
		
		if(blocks[preIndex] === null || blocks[preIndex].state === undefined || 
		(blocks[preIndex].state !== EBlockState.NORMAL && blocks[preIndex].state !== EBlockState.SLIDING_END && blocks[preIndex].state !== EBlockState.REMOVE)){
			return;
		}
		
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
	
	/**
	 * 전체 인게임 보드에서 매칭된 블럭 체크
	 */
	self.tempCheckMatched = function(fromBlock, toBlock) {
		
		for (var filter in this.filters) {
			// check property
			if (this.filters.hasOwnProperty(filter) === false) {
				continue;
			}	
		}

		if (fromBlock === null) { return; }

	    if (toBlock === null ) { return; }

	    // process the selected gem

	    var countUp = this.countSameTypeBlock(fromBlock, 0, -1);
	    var countDown = this.countSameTypeBlock(fromBlock, 0, 1);
	    var countLeft = this.countSameTypeBlock(fromBlock, -1, 0);
	    var countRight = this.countSameTypeBlock(fromBlock, 1, 0);

	    var countHoriz = countLeft + countRight + 1;
	    var countVert = countUp + countDown + 1;
	
	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	return false;
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	return false;
	    }

	    // now process the shifted (swapped) gem

	    countUp = this.countSameTypeBlock(toBlock, 0, -1);
	    countDown = this.countSameTypeBlock(toBlock, 0, 1);
	    countLeft = this.countSameTypeBlock(toBlock, -1, 0);
	    countRight = this.countSameTypeBlock(toBlock, 1, 0);

	    countHoriz = countLeft + countRight + 1;
	    countVert = countUp + countDown + 1;

	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	return false;
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	return false;
	    }

	    return true;
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
	            var block =  this.getBlock(i, j);
	            if(block === null) {
	            	return;
	            }  
	            scoreData.setScore(1);
	            
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

	            	this.blockViewSwap(blocks[index], blocks[preIndex]);
	            	
	            	dropflag = true;
	            }

	        }
	    }
	    return dropflag;
	};
	
	self.dropBlocksTempCheck = function() {
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
	            	
	            	blocks[preIndex].isMoveAndMatch = true;
	            }

	        }
	    }
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
		            	var randomType = StzUtil.createRandomInteger(0, 4);
		            	
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

		var hitPoint = new Phaser.Rectangle(x, y, 25, 25);
		var length = blocks.length;
		var hitFlag = false;
		
		for(var i=0;i<length;i++){
			var block = blocks[i];
			if(block !== null && block.view !== null){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.isMoveAndMatch === true) {
						return;
					}
					if(_moveBlocks.length === 0){
						_moveBlocks.push(block);
						return;
					}
					else if(_moveBlocks.length === 1){
						if(_moveBlocks[0].view === null || _moveBlocks[0].view.getBounds() === block.view.getBounds()) {
							return;
						}
						
						_moveBlocks.push(block);

						if(Math.abs(_moveBlocks[0].posX - _moveBlocks[1].posX) === 1){
							if(Math.abs(_moveBlocks[0].posY - _moveBlocks[1].posY) === 0){
								 _mouseFlag = false;
						         this.controlFlag(false);
						         
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
								
					            this.dropBlocksTempCheck();
					            _returnFlag = this.tempCheckMatched(_moveBlocks[0], _moveBlocks[1]);
					            state = EControllerState.USER_TURN;
					            return;
							}
		
						}
						else if(Math.abs(_moveBlocks[0].posY - _moveBlocks[1].posY) === 1){
							if(Math.abs(_moveBlocks[0].posX - _moveBlocks[1].posX) === 0){
								_mouseFlag = false;
						        this.controlFlag(false);
						            
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1]);
								
					            this.dropBlocksTempCheck();
					            _returnFlag = this.tempCheckMatched(_moveBlocks[0], _moveBlocks[1]);
					            state = EControllerState.USER_TURN;
					            return;
							}
						}
						else{
							_mouseFlag = false;
							_moveBlocks = [];
						}
					}
					else{
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


