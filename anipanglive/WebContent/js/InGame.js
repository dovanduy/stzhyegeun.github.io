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
			this.rivalScore = this.aniBot.score;
			if (this.rivalText) {
				this.rivalText.text = "AniBot(" + this.aniBot.getDifficulty() + ")\nScore: " + this.aniBot.score + "\nCombo: " + this.aniBot.combo;
			}
		}).bind(this);
	} else if (window.realjs) {
		realjs.event.messageListener.add(function(data) {
			
			if (data.sid === realjs.getMySessionId()) {
				return;
			}

			var rivalData = JSON.parse(data.m);
			if (rivalData.hasOwnProperty('score')) {
				this.rivalScore = rivalData.score;	
			}
			
			if (this.rivalText) {
				
				this.rivalText.text = "Rival\nScore: " + this.rivalScore + "\nCombo: " + rivalData.combo;
				StzLog.print("[InGame] onMessage: " + this.rivalText.text);
			}
		}, this);
	}
	
	this.rivalScore = 0;
	
	this.isGameStarted = false;
	
	//점수 및 콤보
	this.scoreData = new Score(this.game);
	this.scoreData.onScoreUpdated = (this.OnScoreUpdated).bind(this);
	this.scoreData.onComboUpdated = (this.OnComboUpdated).bind(this);
	this.scoreData.onPivotStart = (this.onPivotStart).bind(this);
	this.scoreData.onPivotEnd = (this.onPivotEnd).bind(this);
	this.comboDuration = 0;
	this.pivotTimer = null;
	
	// init Scene
	this.scene = new InGameScene(this);
	
	// init Controller
	this.controller = InGameController(this);
	
	// init UserInteraction
	this.game.input.onDown.add(this.controller.clickBlock, this.controller);
	this.game.input.addMoveCallback(this.controller.moveBlock, this.controller);
	this.game.input.onUp.add(this.controller.unClickBlock, this.controller);
};

InGame.prototype.OnScoreUpdated = function(inScore) {
	this.myText.text = "Score: " + inScore + "\nCombo: " + this.scoreData.getCombo();
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'combo': this.scoreData.getCombo(), 'score':inScore}), false);
	}
	this.updateScoreView(this.scoreData.getScore(), inScore);
};

InGame.prototype.OnComboUpdated = function(inCombo, inTimerDuration) {
	this.myText.text = "Score: " + this.scoreData.getScore() + "\nCombo: " + this.scoreData.getCombo();
	this.comboDuration = inTimerDuration;
};

InGame.prototype.onPivotStart = function(pivotTimer) {
	this.pivotTimer = pivotTimer;
	
	this.controller.setPivotFlag(true);
	this.gameStateText.text ="FEVER_MOVEMENT : " + this.pivotTimer.delay;
};

InGame.prototype.onPivotEnd = function() {
	this.controller.setPivotFlag(false);
	
	if(this.timeCount > 0){
		this.gameStateText.text ="FEVER_NOT_MOVEMENT";
	}
	
	this.pivotTimer = null;
};

InGame.prototype.preload = function() {
	if (window.FBInstant) {
		
	} else {
		
	}
};

InGame.prototype.create = function() {
	
	// 라이벌 관련
	var rivalInfoStyle = { font: 'bold 15px Arial', fill: '#fff', boundsAlignH: 'right', boundsAlignV: 'middle' };
	var myInfoStyle = { font: 'bold 15px Arial', fill: '#fff', boundsAlignH: 'left', boundsAlignV: 'middle' };
	
	this.rivalText = this.game.add.text(0, 0, "Score: 0\nCombo: 0", rivalInfoStyle);
	this.rivalText.setTextBounds(this.game.width - 100, 0, 50, 100);
	
	this.myText = this.game.add.text(0, 0, "Score: 0\nCombo: 0", myInfoStyle);
	this.myText.setTextBounds(50, 0, 50, 100);
	
	this.gameStateText = this.game.add.text(0, 0, "FEVER_NOT_MOVEMENT", myInfoStyle);
	this.gameStateText.setTextBounds(50, 150, 50, 100);
	
	this.txtComboTimer = this.game.add.text(0, 0, "CTimer: 0", myInfoStyle);
	this.txtComboTimer.setTextBounds(50, 100, 50, 30);
	
	this.scene.fBgPlayer.targetWidth = (this.game.width / 2);
	
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
	
    this.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
    this.bombCountText = this.game.add.text(0,60, "BombRemainCount : " + this.bombRemainCount, {
        fontSize : '20px',
        fill : '#FFFFFF',
        font : 'debush'
    },this.scene.fTopUIContainer);
   
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
	
	this.playGameStartCounter();
};

InGame.prototype.playGameStartCounter = function() {
	var countToGameStart = 3;
	var txtGameStartCount = this.game.add.text(this.game.width / 2, this.game.height / 2, countToGameStart + "", { fill: '#ffffff', font: 'bold 64px debush'});

	this.game.time.events.loop(Phaser.Timer.SECOND, function() {
		countToGameStart = countToGameStart - 1;
		
		if (countToGameStart < 0) {
			this.game.time.events.removeAll();
			txtGameStartCount.destroy(true);
			
			this.startGame();
		} else {
			txtGameStartCount.text = countToGameStart + "";	
		}
	}, this);
};

InGame.prototype.startGame = function() {
	this.isGameStarted = true;
	this.controller.initBoard();
	this.gameTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.timerCheck, this);
};

InGame.prototype.OnCountGameStartTimer = function() {

	
};

InGame.prototype.update = function() {
	
	if (this.isGameStarted === false) {
		return;
	}
	
	if (this.aniBot) {
		this.aniBot.update();	
	}
	
	if (this.comboDuration > 0) {
		if(this.controller.getState() !== EControllerState.BOMB_WATING){
			this.comboDuration = this.comboDuration - this.game.time.elapsedMS;
		}
		
		if(this.comboDuration <= 0 ) {
			this.scoreData.setCombo(0);
			this.comboDuration = 0;
		}
		this.txtComboTimer.text = "CTimer: " + this.comboDuration;
	}
	
	if(this.pivotTimer !== undefined && this.pivotTimer !== null){
		var pivotRemainTime = this.pivotTimer.tick - (new Date()).getTime();
		this.gameStateText.text ="FEVER_MOVEMENT : " + pivotRemainTime;
	}
	
    this.bombCountText.text = "BombRemainCount : " + this.bombRemainCount;
	this.controller.updateView();
};

InGame.prototype.createScoreView = function() {
	
};

InGame.prototype.updateScoreView = function (playerScore, rivalScore) {	
	
	if (playerScore <= 0 || rivalScore <= 0) {
		return;
	}
	
	var playerBgWidth = this.game.width * (playerScore / (playerScore + rivalScore));
	if (playerBgWidth < 100) {
		playerBgWidth = 100;
	} else if (playerBgWidth > (this.game.width - 100)) {
		playerBgWidth = (this.game.width - 100);
	}
	
	this.game.add.tween(this.scene.fBgPlayer).to({'targetWidth': playerBgWidth}, 500, "Quart.easeOut", true);
};

InGame.prototype.stopControllGame = function() {
	
	// Stop bot play
	if (this.aniBot && this.aniBot.isStop() === false) {
		this.aniBot.stop();
	}
	
	// stop user play
	this.controller.controlFlag(false);
	
	this.game.state.start("Result", true, false, [this.scoreData.getScore(), this.rivalScore]);
	
	
};

InGame.prototype.timerCheck = function(){
	
	if(this.timeCount <= 0){
		this.controller.controlFlag(false);
		StzLog.print("[InGame (timerCheck)] 타임 업!");
		this.gameStateText.text ="LAST_PANG";
		
		if(this.controller.checkNormal() === true){
			this.game.time.events.remove(this.gameTimer);
			
			// 게임 정지 -> 라스트팡 시작.
			this.controller.setState(EControllerState.LASTPANG_TURN);
			this.pivotTimer = null;
			this.comboDuration = 0;
		}
		
		return;
	}
	
	if(this.controller.getState() !== EControllerState.BOMB_WATING){
		this.timeCount = this.timeCount - 1;
	}
	
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
		
		BOMB_TURN		: "BOMB_TURN",
		BOMB_WATING		: "BOMB_WATING",
		
		LASTPANG_TURN   : "LASTPANG_TURN",
		GAME_END		: "GAME_END"
};

var InGameController = function(inViewContext) {
	
	var _blocks = StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	var _state = EControllerState.USER_TURN;
	var _moveBlocks = [];
	var _mouseFlag = false;
	var _controlFlag = true;
	var _tempMoveBlocks = [];
	var _scoreData = inViewContext.scoreData;
	//폭탄으로 제거되는 블럭들 (위아래, 오른쪽, 왼쪽)
	var _bombToRemeveBlocksUD = [];
	var _bombToRemeveBlocksL = [];
	var _bombToRemeveBlocksR = [];
	//폭탄으로 의해 터지는 애니매이션이 실행된 블럭들
	var _bombAnimStartBlocks = [];
	
	//피벗
	var _pivotFlag = false;
	
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
		if(inViewContext.timeCount <= 0){
			_controlFlag = false;
		}
		else{
			_controlFlag = flag;
		}
		
	};
	
	self.setState= function(state){
		_state = state;
	};
	
	self.getState= function(){
		return _state;
	};
	
	self.setPivotFlag= function(flag){
		_pivotFlag = flag;
	};
	
	/**
	 * 블럭 객체 반환
	 */
	self.getBlock = function(inRowIndex, inColIndex) {
		StzLog.assert(inRowIndex >= 0 && inRowIndex < InGameBoardConfig.ROW_COUNT, '[InGameController] Invalide inRowIndex: ' + inRowIndex);
		StzLog.assert(inColIndex >= 0 && inColIndex < InGameBoardConfig.COL_COUNT, '[InGameController] Invalide inColIndex: ' + inColIndex);
		return _blocks[inColIndex*InGameBoardConfig.ROW_COUNT + inRowIndex];
	};
	
	/**
	 * 초기 인게임 블럭 생성
	 */
	self.initBoard = function() {
		
		for (var index = 0; index < _blocks.length; index++) {
			
			var randomType = StzUtil.createRandomInteger(0, 4);
			_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext);
			_blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
		}
		
		if(this.checkMatched(true, function(){}) !== 0){
			for (var index = 0; index < _blocks.length; index++) {
				_blocks[index].distory();
			}
			_blocks =  StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
			self.initBoard();
		}
		else{
			
			return;
		}
	};

	self.updateView = function() {
		 this.checkBomb();
		
		for (var index = 0; index < _blocks.length; index++) {
			if (_blocks[index] === null) {
				continue;
			}
			_blocks[index].updateView();
		}
		
		//블럭 손으로 이동 후 매치 하는 부분
		if(_tempMoveBlocks.length === 2 && _state !== EControllerState.LASTPANG_TURN && _state !== EControllerState.GAME_END){
			if(this.twoCheckSlidingEnd(_tempMoveBlocks[0], _tempMoveBlocks[1]) === true){
				//_pivotFlag = true;
				currentMatchedCount = this.twoBlockCheckMatched(_tempMoveBlocks[0], _tempMoveBlocks[1], function(){
					this.dropBlocksTempCheck();
				}.bind(this));
					
				if(currentMatchedCount > 0){
					 self.viewContext.bombRemainCount-= 1*currentMatchedCount;
						_scoreData.setScore(currentMatchedCount, true);	
				}
				else{
					this.blockViewSwap(_tempMoveBlocks[0], _tempMoveBlocks[1], ESlideVelocity.BLOCK_RETRUN);
					
				}
				this.controlFlag(true);
				this.initBlockFrame();
				_tempMoveBlocks = [];
			}
		}
		//떨어질 예정인 블럭들 못움직이게 설정
		this.dropBlocksTempCheck();
		
		if(_state === EControllerState.USER_TURN){
			
			if(this.checkNormal() === false){
				//StzLog.print("슬라이드 유무 체크");
				_state = EControllerState.SLIDING_TURN;
			}
		}
		else if(_state === EControllerState.SLIDING_TURN){
			if(this.checkSlidingEnd() === true){
				//StzLog.print("슬라이드 끝남 체크");
				this.initAllBlockFrame();
				_state = EControllerState.MATCH_TURN;
				
			}
		}
		else if(_state === EControllerState.MATCH_TURN){
			//StzLog.print("매치시작");
			var currentDropMatchedCount = 0;

			currentDropMatchedCount = this.checkMatched(false, function(){
				//떨어질 예정인 블럭들 못움직이게 설정
				this.dropBlocksTempCheck();
				_state = EControllerState.ANIM_TURN;
			}.bind(this));

			if (currentDropMatchedCount > 0) {
				 self.viewContext.bombRemainCount-= 1*currentDropMatchedCount;
				_scoreData.setScore(currentDropMatchedCount, false);	
			}
		}
		else if(_state === EControllerState.ANIM_TURN){
			if(this.checkAnim() === true){
				//StzLog.print("애니매이션 체크");
				_state = EControllerState.USER_TURN;
			}
		}

		else if(_state === EControllerState.BOMB_TURN){
			this.controlFlag(false);
			this.bombOperate();
			_state = EControllerState.BOMB_WATING;
		}
		
		else if(_state === EControllerState.BOMB_WATING){
			
			if(this.isBombCompleted() === true){
				this.controlFlag(true);
				_state = EControllerState.USER_TURN;
			}
			
		}
		else if(_state === EControllerState.LASTPANG_TURN){
			var bombIndex = -1;
			var lastPangMachedCount = 0;
			if(this.checkNormal() === true){
				if(lastPangMachedCount = this.checkMatched(false, function() {}.bind(this)) === 0){
					bombIndex = this.getBlocksBombTypeIndex();
					
					if(bombIndex !== -1){
						this.bombToRemoveBlockCheck(_blocks[bombIndex]);
						this.bombOperate();
					}
				}
				if (lastPangMachedCount > 0) {
					_scoreData.setScore(lastPangMachedCount, false);	
				}
			
			}
			else{
				if(this.isBombCompleted() === false){
					return;
				}
			}

			if(this.isBombCompleted() === true && this.checkNormal() === true){
				bombIndex = this.getBlocksBombTypeIndex();
				if(bombIndex === -1){
					_state = EControllerState.GAME_END;
				}
			}
			else if(this.isBombCompleted() === true){
				this.dropBlocks();
				this.refillBoard();
			}
		}
		
		else if(_state === EControllerState.GAME_END){
			self.viewContext.time.events.add(2000, function(){
				self.viewContext.stopControllGame();
			}.bind(this));
		}
		
		//블럭 드랍과 리필 로직은 스테이트와 상관없이 동작 (라스트팡, 폭탄 상태때는 작동하지 않음)
		if( _state !== EControllerState.LASTPANG_TURN && _state !== EControllerState.GAME_END 
				&& _state !== EControllerState.BOMB_TURN && _state !== EControllerState.BOMB_WATING){
				this.dropBlocks();
				this.refillBoard();
		}
		
	};
	
	/**
	 * 폭탄이 존재하는지 체크하는 로직
	 */
	self.getBlocksBombTypeIndex = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			if (_blocks[index].type === EBlockType.BOMB) {
				return index;
			}
		}	
		return -1;
	};
	
	/**
	 * 폭탄 애니매이션이 끝난는지 검사하는 로직
	 */
	self.isBombCompleted = function(){
		var length = _bombAnimStartBlocks.length;
		
		for(var i = 0; i<length; i++){
			if(_bombAnimStartBlocks[i].state !== EBlockState.REMOVE && _bombAnimStartBlocks[i].type !== EBlockType.BOMB){
				return false;
			}
		}
		
		_scoreData.setScore(length);
		
		_bombToRemeveBlocksUD = [];
		_bombToRemeveBlocksL = [];
		_bombToRemeveBlocksR = [];
		_bombAnimStartBlocks = [];
		return true;
	};
	
	/**
	 * 폭탄 클릭 시 터질 블럭을 찾는 로직
	 */
	self.bombOperate = function(){
		var delay = 0;
		
		for(var i = 0; i<_bombToRemeveBlocksUD.length; i++){
			delay = (i*StzGameConfig.BOMB_REMOVE_TIME);
			
			_bombToRemeveBlocksUD[i].removeToBombDelayTime = delay;
			_bombToRemeveBlocksUD[i].state = EBlockState.REMOVE_TO_BOMB;
			
			_bombAnimStartBlocks.push(_bombToRemeveBlocksUD[i]);
		}
		var tempDelay = 0;
		
		for(var i = 0; i<_bombToRemeveBlocksL.length; i++){
			tempDelay = delay + ((i+1)*StzGameConfig.BOMB_REMOVE_TIME);
			
			_bombToRemeveBlocksL[i].removeToBombDelayTime = tempDelay;
			_bombToRemeveBlocksL[i].state = EBlockState.REMOVE_TO_BOMB;
			
			_bombAnimStartBlocks.push(_bombToRemeveBlocksL[i]);	
		}
		
		for(var i = 0; i<_bombToRemeveBlocksR.length; i++){
			tempDelay = delay + ((i+1)*StzGameConfig.BOMB_REMOVE_TIME);
			
			_bombToRemeveBlocksR[i].removeToBombDelayTime = tempDelay;
			_bombToRemeveBlocksR[i].state = EBlockState.REMOVE_TO_BOMB;
			
			_bombAnimStartBlocks.push(_bombToRemeveBlocksR[i]);	
		}
	};
	
	/**
	 * 블럭 카운트를 체크하여 블럭을 생성하는 로직
	 */
	self.checkBomb = function(){
		if( self.viewContext.bombRemainCount === 0){
			
			 self.viewContext.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
			 
			 while(true){
				 var randomType = StzUtil.createRandomInteger(7, _blocks.length);
				 if(_blocks[randomType] === undefined || _blocks[randomType] === null){
					 continue;
				 }
				 else if(_blocks[randomType].type === undefined || _blocks[randomType].type === EBlockType.BOMB){
					 continue;
				 }
				 else if(_blocks[randomType].state === undefined || _blocks[randomType].state !== EBlockState.NORMAL){
					 continue;
				 }
				 else{
					 _blocks[randomType].state = EBlockState.INIT_BOMB;
					 break;
				 }
			 }
		}
	};
	
	/**
	 * 블럭의 스압 로직
	 */
	self.blockViewSwap = function(toBlock, fromBlock, slidVelocity){
		if(toBlock === undefined || fromBlock === undefined || toBlock.index === undefined || fromBlock.index === undefined){
			return;
		}
		var index = toBlock.index;
		var preIndex = fromBlock.index;
			
		if(_blocks[index] === undefined || _blocks[index] === null || _blocks[index].state === undefined|| 
		(_blocks[index].state !== EBlockState.NORMAL && _blocks[index].state !== EBlockState.SLIDING_END && _blocks[index].state !== EBlockState.REMOVE)){
			return;
		}
		
		if(_blocks[preIndex] === undefined || _blocks[preIndex] === null || _blocks[preIndex].state === undefined || 
		(_blocks[preIndex].state !== EBlockState.NORMAL && _blocks[preIndex].state !== EBlockState.SLIDING_END && _blocks[preIndex].state !== EBlockState.REMOVE)){
			return;
		}
		
		_blocks[index].state = EBlockState.NORMAL;
		_blocks[preIndex].state = EBlockState.NORMAL;
		
		_blocks[index].slidVelocity =	slidVelocity;
		_blocks[preIndex].slidVelocity = slidVelocity;
		
		var temp = _blocks[index].view;
        _blocks[index].view = _blocks[preIndex].view;
        _blocks[preIndex].view = temp; 
        	
        var temp = _blocks[index].type;
        _blocks[index].type = _blocks[preIndex].type;
        _blocks[preIndex].type = temp; 
	};
	
	/**
	 * 모든 블럭들이 슬라이드 여부가 끝난는지 체크
	 */
	self.checkSlidingEnd = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			//블럭의 이동 속도를 체크하여 이 블록이 어느 이동이였는지 체크
			if(_blocks[index].slidVelocity === ESlideVelocity.BLOCK_RETRUN || _blocks[index] === ESlideVelocity.BLOCK_MOVE){
				continue;
			}
			if (_blocks[index].state !== EBlockState.NORMAL
				&&_blocks[index].state !== EBlockState.REMOVE) {
				return false;
			}
		}	
		return true;
	};
	
	/**
	 * 선택된 두 블럭의 상태가 슬라이드가 끝난 여부 체크
	 */
	self.twoCheckSlidingEnd = function(fromBlock, toBlock){
		
		if (fromBlock.state !== EBlockState.NORMAL
				&&fromBlock.state !== EBlockState.REMOVE
				&&toBlock.state !== EBlockState.NORMAL
				&&toBlock.state !== EBlockState.REMOVE) {
				return false;
			}

		return true;
	};
	
	/**
	 * 블럭들이 노멀 상태인지 체크
	 */
	self.checkNormal = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			if(_blocks[index].slidVelocity === ESlideVelocity.BLOCK_RETRUN || _blocks[index] === ESlideVelocity.BLOCK_MOVE){
				continue;
			}
			if (_blocks[index].state !== EBlockState.NORMAL) {
				return false;
			}
		}	
		return true;
	};
	
	/**
	 * 애니매이션 중인 블럭이 있는지 체크
	 */
	self.checkAnim = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			if (_blocks[index].state === EBlockState.ANIMATION) {
				return false;
			}
		}	
		return true;
	};
	
	/**
	 * 전체 인게임 보드에서 매칭된 블럭 체크
	 */
	self.checkMatched = function(remove_Flag, inCallback, inCallbackContext) {
		
		var length = _blocks.length;
		var mactedCount = 0;
		var removeFlag = false;
		
		if(remove_Flag === undefined){
			removeFlag = false;
		}
		else{
			removeFlag = remove_Flag;
		}
		
		for(var i =0; i < length; i++)
		{
			var block = _blocks[i];
			
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
					if(removeFlag === true){
						return 1;
					}
					
					mactedCount += this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown);
				}

				if (countHoriz >= StzGameConfig.MATCH_MIN)
				{
					if(removeFlag === true){
						return 1;
					}
					
					mactedCount += this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY);
					
				}
			}
		}
		
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
       
        if( self.viewContext.bombRemainCount < 0){
        	 self.viewContext.bombRemainCount = 0;
        }
        
        if(removeFlag === true){
			return 0;
		}
        
		return mactedCount;
	};
	
	/**
	 * 두블럭의 이동으로 제거 되는 블럭이 있는지 체크
	 */
	self.isRemoveTwoBlockCheckMatched = function(fromBlock, toBlock) {
		
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
	
	/**
	 * 두블럭의 이동으로 제거되는 블럭 체크
	 */
	self.twoBlockCheckMatched = function(fromBlock, toBlock, inCallback, inCallbackContext) {
		
		for (var filter in this.filters) {
			// check property
			if (this.filters.hasOwnProperty(filter) === false) {
				continue;
			}	
		}

		if (fromBlock === null) { return; }

	    if (toBlock === null ) { return; }

	    // process the selected gem
	    var mactedCount = 0;
	    var countUp = this.countSameTypeBlock(fromBlock, 0, -1);
	    var countDown = this.countSameTypeBlock(fromBlock, 0, 1);
	    var countLeft = this.countSameTypeBlock(fromBlock, -1, 0);
	    var countRight = this.countSameTypeBlock(fromBlock, 1, 0);

	    var countHoriz = countLeft + countRight + 1;
	    var countVert = countUp + countDown + 1;
	
	    var block = fromBlock;
	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	mactedCount += this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, _pivotFlag);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	mactedCount += this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, _pivotFlag);
	    }

	    // now process the shifted (swapped) gem
	    block = toBlock;
	    countUp = this.countSameTypeBlock(toBlock, 0, -1);
	    countDown = this.countSameTypeBlock(toBlock, 0, 1);
	    countLeft = this.countSameTypeBlock(toBlock, -1, 0);
	    countRight = this.countSameTypeBlock(toBlock, 1, 0);

	    countHoriz = countLeft + countRight + 1;
	    countVert = countUp + countDown + 1;

	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	mactedCount += this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, _pivotFlag);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	mactedCount += this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, _pivotFlag);
	    }

	    return mactedCount;
	};
	
	/**
	 * 주변에 같은 블럭의 개수를 체크하는 로직
	 */
	self.countSameTypeBlock = function(startBlock, moveX, moveY) {
		var curX = startBlock.posX + moveX;
		var curY = startBlock.posY + moveY;
		var count = 0;

		while (curX >= 0 && curY >= 0 && curX < InGameBoardConfig.COL_COUNT 
				&& curY < InGameBoardConfig.ROW_COUNT &&this.getBlock(curX, curY) != null && this.getBlock(curX, curY).type === startBlock.type
				&& this.getBlock(curX, curY).state === EBlockState.NORMAL && startBlock.state === EBlockState.NORMAL)
		{
			count++;
		    curX += moveX;
		    curY += moveY;
		}

		return count;
	};
	
	/**
	 * 제거 범위를 매게변수로 입력 받아서 블럭 상태를 제거 상태로 만드는 로직
	 */
	self.killBlockRange = function(from_X, from_Y, to_X, to_Y, pivot_Flag) {
		
		var fromX = Phaser.Math.clamp(from_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var fromY = Phaser.Math.clamp(from_Y , 0, InGameBoardConfig.ROW_COUNT - 1);
	    var toX = Phaser.Math.clamp(to_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var toY = Phaser.Math.clamp(to_Y, 0, InGameBoardConfig.ROW_COUNT - 1);
	    var pivotFlag = false;
	    var mactedCount = 0;
	    
	    if(pivotFlag === undefined){
	    	pivotFlag = false;
	    }
	    else{
	    	pivotFlag = pivot_Flag;
	    }
	    
	    for (var i = fromX; i <= toX; i++)
	    {
	        for (var j = fromY; j <= toY; j++)
	        {
	            var block =  this.getBlock(i, j);
	            if(block === null || block.type === EBlockType.BOMB) {
	            	continue;
	            }  
	            
	    	    if(pivotFlag === true){
	    	    	if(this.isFeverKillBlock(i, j-1) === true){
	    	    		_blocks[(j-1)*InGameBoardConfig.ROW_COUNT + i].state =  EBlockState.REMOVE_ANIM;
	    	    		mactedCount++;
	    	    	}   	
	    	    	if(this.isFeverKillBlock(i, j+1) === true){
	    	    		_blocks[(j+1)*InGameBoardConfig.ROW_COUNT + i].state =  EBlockState.REMOVE_ANIM;
	    	    		mactedCount++;
	    	    	}
	    	    	if(this.isFeverKillBlock(i-1, j) === true){
	    	    		_blocks[j*InGameBoardConfig.ROW_COUNT + (i-1)].state =  EBlockState.REMOVE_ANIM;
	    	    		mactedCount++;
	    	    	}
	    	    	if(this.isFeverKillBlock(i+1, j) === true){
	    	    		_blocks[j*InGameBoardConfig.ROW_COUNT + (i+1)].state =  EBlockState.REMOVE_ANIM;
	    	    		mactedCount++;
	    	    	}	
	    	    	if(this.isFeverKillBlock(i, j) === true){
	    	    		_blocks[j*InGameBoardConfig.ROW_COUNT + i].state =  EBlockState.REMOVE_ANIM;
	    	    		mactedCount++;
	    	    	}	
	    	    } 
	    	    else{
		        	  mactedCount++;
			          block.state = EBlockState.REMOVE_ANIM; 
		        }
	        }
	      
	    }
	    return mactedCount;
	};
	
	/**
	 * 피벗 모드일 경우 블럭 떨어 뜨리는 로직
	 */
	self.isFeverKillBlock = function(x, y){
		
		if(x < 0 || x >= InGameBoardConfig.ROW_COUNT || y < 0 || y >= InGameBoardConfig.COL_COUNT ){
			return false;
		}
		else if(_blocks[y*InGameBoardConfig.ROW_COUNT + x].type === EBlockType.BOMB){
			return false;
		}

		else if(_blocks[y*InGameBoardConfig.ROW_COUNT + x].state !== EBlockState.NORMAL){
			return false;
		}
		else{
			return true;
		}
	};
	
	/**
	 * 빈공간 발생 시 블럭 아래에서 위로 떨어뜨리는 로직
	 */
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
	            	
	            	_blocks[index].setImageFrame(EBlockImage.NORMAL);
	            	_blocks[preIndex].setImageFrame(EBlockImage.NORMAL);
	            	
	            	this.blockViewSwap(_blocks[index], _blocks[preIndex], ESlideVelocity.BLOCK_DROP);
	            	
	            	dropflag = true;
	            }

	        }
	    }
	    return dropflag;
	};
	
	/**
	 * 떨어질 에정인 블럭들 체크하여 못 움직이게 설정
	 */
	self.dropBlocksTempCheck = function() {
	    for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++)
	    {
	        var dropRowCount = 0;

	        for (var j = InGameBoardConfig.ROW_COUNT- 1; j >= 0; j--)
	        {
	            var block = this.getBlock(i, j);
	            
	            if (block.state === EBlockState.REMOVE_ANIM || block.state === EBlockState.ANIMATION
	            	|| block.state === EBlockState.REMOVE)
	            {
	                dropRowCount++;
	            }

	            else if (dropRowCount > 0)
	            {
	            	var preIndex = j*InGameBoardConfig.ROW_COUNT + i;
	            	
	            	_blocks[preIndex].isMoveAndMatch = true;
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
		            	
		            	_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext);
						_blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));	 
		            }
		        }
		    }
	};
	
	self.moveBlock = function(pointer, x, y) {
		if(_controlFlag === false|| _mouseFlag === false || pointer.isDown === false 
		|| _state === EControllerState.BOMB_TURN || _state === EControllerState.BOMB_WATING || _moveBlocks.length === 0){
			return;
		}

		var hitPoint = new Phaser.Rectangle(x, y, 1, 1);
		var length = _blocks.length;
		var hitFlag = false;
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];
			if(block !== null && block.view !== null && block.state === EBlockState.NORMAL){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.isMoveAndMatch === true) {
						return;
					}

					if(_moveBlocks.length === 1){
						if(_moveBlocks[0].view === null || _moveBlocks[0].view.getBounds() === block.view.getBounds()) {
							return;
						}
						
						
						if(Math.abs(_moveBlocks[0].posX - block.posX) === 1){
							if(Math.abs(_moveBlocks[0].posY - block.posY) === 0){
								_moveBlocks.push(block);
								this.controlFlag(false);
								_mouseFlag = false;
								
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1], ESlideVelocity.BLOCK_MOVE);
								
								_tempMoveBlocks.push(_moveBlocks[0]);
								_tempMoveBlocks.push(_moveBlocks[1]);
								
								_moveBlocks[0].isMoveAndMatch = true;
				            	_moveBlocks[1].isMoveAndMatch = true;
					           
					           
					            return;
							}
		
						}
						else if(Math.abs(_moveBlocks[0].posY - block.posY) === 1){
							if(Math.abs(_moveBlocks[0].posX - block.posX) === 0){
								_moveBlocks.push(block);
								this.controlFlag(false);
								_mouseFlag = false;
							
								this.blockViewSwap(_moveBlocks[0], _moveBlocks[1], ESlideVelocity.BLOCK_MOVE);

								_tempMoveBlocks.push(_moveBlocks[0]);
								_tempMoveBlocks.push(_moveBlocks[1]);
								
								_moveBlocks[0].isMoveAndMatch = true;
				            	_moveBlocks[1].isMoveAndMatch = true;
					            return;
							}
						}
						else{
							_mouseFlag = false;
							this.initAllBlockFrame();
							_moveBlocks = [];
						}
					}
					else{
						_mouseFlag = false;
						this.initAllBlockFrame();
						_moveBlocks = [];
					}
					hitFlag = true;
				}
			}
		}
		if(hitFlag === false){
			_mouseFlag = false;
			this.initAllBlockFrame();
			_moveBlocks = [];
		}
	};
	
	self.clickBlock = function(pointer) {
		if(_moveBlocks.length !== 0){
			return;
		}
		var length = _blocks.length;
		var hitPoint = new Phaser.Rectangle(pointer.x, pointer.y, 1, 1);
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];
			if(block !== undefined && block !== null && block.view !== undefined && block.view !== null){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.type === EBlockType.BOMB && this.checkNormal() === true){
						StzLog.print("폭탄 클릭");
						this.bombToRemoveBlockCheck(block);
						_state = EControllerState.BOMB_TURN;
					}
					else{
						if(block.isMoveAndMatch === true){
							return;
						}
						this.initAllBlockFrame();
						_mouseFlag = true;
						block.setImageFrame(EBlockImage.CLICKED);
						_moveBlocks.push(block);
					}
				}
			}
		}
	};
	
	self.unClickBlock = function(pointer) {
		_moveBlocks = [];
	};
	
	self.bombToRemoveBlockCheck = function(bombBlock){
		if(_bombToRemeveBlocksUD.length !== 0){
			return;
		}
		
		bombBlock.type = EBlockType.NONE;
		
		var posX = bombBlock.posX;

		 for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++){
			 if(_blocks[i*InGameBoardConfig.ROW_COUNT + posX].type === EBlockType.BOMB){
				 continue;
			 }			 
			 _bombToRemeveBlocksUD.push(_blocks[i*InGameBoardConfig.ROW_COUNT + posX]);
		 }
		
		 for (var i = posX - 1; i >= 0; i--){
			 if(_blocks[(InGameBoardConfig.ROW_COUNT-1)*InGameBoardConfig.ROW_COUNT + i].type === EBlockType.BOMB){
				 continue;
			 }
			 _bombToRemeveBlocksL.push(_blocks[(InGameBoardConfig.ROW_COUNT-1)*InGameBoardConfig.ROW_COUNT + i]);
		 }

		 for (var i = posX + 1; i < InGameBoardConfig.ROW_COUNT; i++){
			 if(_blocks[(InGameBoardConfig.ROW_COUNT-1)*InGameBoardConfig.ROW_COUNT + i].type === EBlockType.BOMB){
				 continue;
			 }
			 
			 _bombToRemeveBlocksR.push(_blocks[(InGameBoardConfig.ROW_COUNT-1)*InGameBoardConfig.ROW_COUNT + i]);
		 }
	};
	
	self.initBlockFrame = function(){
		var length = _moveBlocks.length;
		
		for(var i=0;i<length;i++){
			if(_moveBlocks[i].state === EBlockState.NORMAL && _moveBlocks[i].type !== EBlockType.BOMB
					&& _moveBlocks[i].type !== EBlockType.NONE){
				_moveBlocks[i].setImageFrame(EBlockImage.NORMAL);
			}
		}

	};
	
	self.initAllBlockFrame = function(){
		var length = _blocks.length;
		
		for(var i=0;i<length;i++){
			if(_blocks[i].state === EBlockState.NORMAL && _blocks[i].type !== EBlockType.BOMB
					&& _blocks[i].type !== EBlockType.NONE){
				_blocks[i].setImageFrame(EBlockImage.NORMAL);
			}
		}

	};
	
	return self;
};
