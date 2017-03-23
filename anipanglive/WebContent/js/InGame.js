function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function(inIsBot) {

	if (inIsBot === true) {
		this.aniBot = new AniBot(this, 10);
		this.aniBot.autoDifficulty = true; // 자동 난이도 조절
		this.aniBot.playListener = (function() {
			if (this.rivalText) {
				this.rivalText.text = "Score: " + this.aniBot.score + ", Combo: " + this.aniBot.combo + ", total: " + this.aniBot.totalMatchedBlock;
			}
		}).bind(this);
	}
	//점수 관련
	this.scoreData = new Score();
	this.startComboStamp = 0;
	this.isComboUp = false;
	
	this.scene = new InGameScene(this);
	this.controller = InGameController(this);
	
	this.game.input.onDown.add(function(){
		this.controller.setMouseFlag(true);
	}, this);
	this.game.input.addMoveCallback(this.controller.moveBlock, this.controller);
	this.game.input.onUp.add(function(){
		this.controller.setMouseFlag(false);
	}, this);
};

InGame.prototype.preload = function() {
	if (window.FBInstant) {
		
	} else {
		
	}
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
	
	this.scoreText = this.game.add.text(0,30, "Scroe : " + this.scoreData.getScoreText(), {
		fontSize : '20px',
		fill : '#FFFFFF',
		font : 'debush'
	},this.scene.fTopUIContainer);
	
	this.comboText = this.game.add.text(200,30,  "Combo : " + this.scoreData.getCombo(), {
		fontSize : '20px',
		fill : '#FFFFFF',
		font : 'debush'
	},this.scene.fTopUIContainer);
	
	this.comboTimerText = this.game.add.text(350,30, 0, {
		fontSize : '20px',
		fill : '#FFFFFF',
		font : 'debush'
	},this.scene.fTopUIContainer);
	
    this.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
    this.bombCountText = this.game.add.text(0,60, "BombRemainCount : " + this.bombRemainCount, {
        fontSize : '20px',
        fill : '#FFFFFF',
        font : 'debush'
    },this.scene.fTopUIContainer);
   
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
	this.scene.fTopUIContainer.bringToTop(this.comboText);
	
	this.gameTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.timerCheck, this);
};

InGame.prototype.update = function() {
	
	if (this.aniBot) {
		this.aniBot.update();	
	}
	
	this.scoreCheck();
    this.bombCountText.text = "BombRemainCount : " + this.bombRemainCount;

	this.updateScoreView(this.scoreData.getScore(), this.aniBot.score);
	
	this.controller.updateView();
	
};

InGame.prototype.createScoreView = function() {
	
};

InGame.prototype.updateScoreView = function (playerScore, rivalScore) {	
	
	var playerBgWidth = this.game.width * (playerScore / (playerScore + rivalScore));
	if (playerBgWidth < 100) {
		playerBgWidth = 100;
	} else if (playerBgWidth > 380) {
		playerBgWidth = 380;
	}
	
	
	this.game.add.tween(this.scene.fBgPlayer).to({'targetWidth': playerBgWidth}, 500, "Quart.easeOut", true);
};

InGame.prototype.scoreCheck = function() {
	if(this.startComboStamp != 0){
		
		var currentComboStamp = (new Date()).getTime();
		this.comboDeltaTime = currentComboStamp - this.startComboStamp;
		
		if(this.scoreData.setCombo(this.comboDeltaTime, this.isComboUp) === 0){
			this.startComboStamp = 0;
		}
		var comboTimer = EScoreConfig.COMBO_TIME -  this.comboDeltaTime;
		if(comboTimer < 0 ) comboTimer = 0;
		
		this.comboTimerText.text = comboTimer;
		this.comboText.text = "Combo : " + this.scoreData.getCombo();
	}
	this.isComboUp = false;
	this.scoreText.text = "Scroe : " + this.scoreData.getScoreText();
};

InGame.prototype.stopControllGame = function() {
	
	// Stop bot play
	if (this.aniBot && this.aniBot.isStop() === false) {
		this.aniBot.stop();
	}
	
	// stop user play
	this.controller.controlFlag(false);
	
	// TODO @hyegeun state.star("result") - go to result scene.
	
};

InGame.prototype.timerCheck = function(){
	
	if(this.timeCount <= 0){
		// 게임 정지 -> 라스트팡 시작.
		StzLog.print("[InGame (timerCheck)] 타임 업!");
		this.stopControllGame();
		this.game.time.events.remove(this.gameTimer);
		return;
	}
	
	this.timeCount = this.timeCount - 1;
	if (this.timeCount <= 0) {
		this.timeCount = 0;
	} 
	this.remainTimeText.text = this.timeCount;
};

var EControllerState = {
		USER_TURN 		: "USER_TURN",
		SLIDING_TURN 	: "SLIDING_TURN",
		MATCH_TURN 		: "MATCH_TURN",
		DROP_TURN		: "DROP_TURN",
		ANIM_TURN		: "ANIM_TURN",
		REFILL_TURN		: "REFILL_TURN",
		LASTPANG_TURN   : "LASTPANG_TURN"
};

var InGameController = function(inViewContext) {
	
	var blocks = StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	var state = EControllerState.USER_TURN;
	var _moveBlocks = [];
	var _mouseFlag = false;
	var _controlFlag = false;
	var _returnFlag = false;
	var _scoreData = inViewContext.scoreData;

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
			blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext);
			blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
		}
	};

	self.updateView = function() {
		if( self.viewContext.bombRemainCount === 0){
			 self.viewContext.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
		}
		
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
					self.viewContext.startComboStamp = (new Date()).getTime();
					self.viewContext.isComboUp = true;
					
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
		
		var length = blocks.length;
		var mactedCount = 0;
		
		for(var i =0; i < length; i++)
		{
			var block = blocks[i];
			
			if( block != null && block.view != null && block.state === EBlockState.NORMAL)
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
					mactedCount += countHoriz;
				}
			}
		}
		
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
		
        StzLog.print(mactedCount);
        _scoreData.setScore(mactedCount);
        self.viewContext.bombRemainCount-= 1*mactedCount;
       
        if( self.viewContext.bombRemainCount < 0){
        	 self.viewContext.bombRemainCount = 0;
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
	            _scoreData.setScore(1);

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
		            	
		            	blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext);
						blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));	 
		            }
		        }
		    }
	};
	
	self.moveBlock = function(pointer, x, y) {
		if(_controlFlag === false|| _mouseFlag === false || pointer.isDown === false){
			return;
		}

		var hitPoint = new Phaser.Rectangle(x, y, 10, 10);
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
