
var EControllerState = {
		NONE_TURN		: "NONE_TURN",
		USER_TURN 		: "USER_TURN",
		SLIDING_TURN 	: "SLIDING_TURN",
		MATCH_TURN 		: "MATCH_TURN",
		DROP_TURN		: "DROP_TURN",
		ANIM_TURN		: "ANIM_TURN",
		REFILL_TURN		: "REFILL_TURN",

		LASTPANG_TURN   : "LASTPANG_TURN",
		GAME_END		: "GAME_END"
};


var InGameController = function(inViewContext) {
	
	var _blocks = StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
	var _state = EControllerState.NONE_TURN;
	var _moveBlocks = [];
	//var _mouseFlag = false;
	var _controlFlag = true;

	var _scoreData = inViewContext.scoreData;

	var _hintTimer = null;
	var _hintIndexArray = [];

	//피벗
	var _pivotFlag = false;
	
	//난이도 증가 데이터 (0~15->0  15 ~끝까지 ->1)
	var _levelCount = 0;
	
	//블럭 연속 매칭 카운트
	var _soundMatchedCount = 1;
	
	var _indexChecker = {
		indexMap: {
			'TOP_LEFT': -1 * InGameBoardConfig.ROW_COUNT - 1, 
			'TOP_CENTER': -1 * InGameBoardConfig.ROW_COUNT, 
			'TOP_RIGHT': -1 * InGameBoardConfig.ROW_COUNT + 1, 
			'MIDDLE_LEFT': -1, 
			'MIDDLE_RIGHT': 1, 
			'BOTTOM_LEFT': InGameBoardConfig.ROW_COUNT - 1, 
			'BOTTOM_CENTER': InGameBoardConfig.ROW_COUNT, 
			'BOTTOM_RIGHT': InGameBoardConfig.ROW_COUNT + 1
		},

		checkLeftBoundary: function(inIndex) {
			return (inIndex % InGameBoardConfig.ROW_COUNT) === 0;
		}, 
		checkRightBoundary: function(inIndex) {
			return (inIndex % InGameBoardConfig.ROW_COUNT) === (InGameBoardConfig.ROW_COUNT - 1);
		},
		checkTopBoundary: function(inIndex) {
			return (inIndex < InGameBoardConfig.ROW_COUNT);
		},
		checkBottomBoundary: function(inIndex) {
			return (inIndex > (InGameBoardConfig.ROW_COUNT * (InGameBoardConfig.COL_COUNT - 1)));
		},
		getEightDirectionIndexList: function(inIndex) {
			var result = {};
			var isLeftBoundary = this.checkLeftBoundary(inIndex);
			var isRightBoundary = this.checkRightBoundary(inIndex);
			var isTopBoundary = this.checkTopBoundary(inIndex);
			var isBottomBoundary = this.checkBottomBoundary(inIndex);
			for (var keyValue in this.indexMap) {
				if (this.indexMap.hasOwnProperty(keyValue)) {
					if (isLeftBoundary && keyValue.indexOf('LEFT') >= 0) {
						continue;
					}
					if (isRightBoundary && keyValue.indexOf('RIGHT') >= 0) {
						continue;
					}
					if (isTopBoundary && keyValue.indexOf('TOP') >= 0) {
						continue;
					}
					if (isBottomBoundary && keyValue.indexOf('BOTTOM') >= 0) {
						continue;
					}
					result[keyValue] = this.indexMap[keyValue];
				}
			}
			return result;
		}
	};
	
	var self = {
		viewContext: inViewContext,
		indexChecker: _indexChecker
	};
	
	//얼음 관련 인터럽트
	self.interruptedIce = new InGameInterruptIce(self.viewContext, self);
	//구름 관련 인터럽트
	self.interruptedCloud = new InGameInterruptCloud(self.viewContext, self);
	
	self.setLevelUP = function(){
		_levelCount++;
	};
	
	self.getLevelUP = function(){
		return _levelCount;
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
		if(state === EControllerState.LASTPANG_TURN){
			this.hintStop();
		}
		_state = state;
	};
	
	self.getState= function(){
		return _state;
	};
	
	self.setPivotFlag= function(flag){
		_pivotFlag = flag;
	};
	
	self.getPivotFlag= function(){
		return _pivotFlag;
	};
	
	/**
	 * 힌트 타이머 동작 
	 */
	self.hintTimerStart = function(){
		if(_state === EControllerState.LASTPANG_TURN || _state === EControllerState.GAME_END){
			return;
		}
		
		this.hintStop();
		
		_hintTimer = self.viewContext.time.events.add(3000, function(){
			self.viewContext.time.events.remove(_hintTimer);
			_hintIndexArray = self.isOneMoveCheckMatched(false);
			
			if (_hintIndexArray) {
				for (var i = 0; i < _hintIndexArray.length; i++) {
					if (_blocks[_hintIndexArray[i]] && _blocks[_hintIndexArray[i]].view) {
						var hintAnim = StzObjectPool.loadView("SPRITE", EBlockAnimation.ANIM_HINT, this.viewContext, _blocks[_hintIndexArray[i]].view.x, _blocks[_hintIndexArray[i]].view.y, EBlockAnimation.ANIM_HINT, null, this.viewContext.scene.fGameBoard);
						hintAnim.animations.add(EBlockAnimation.ANIM_HINT);
						hintAnim.anchor.setTo(0.5, 0.94);
						hintAnim.width = InGameBoardConfig.BLOCK_WIDTH + 15;
						hintAnim.height = InGameBoardConfig.BLOCK_HEIGHT + 15;
						hintAnim.animations.play(EBlockAnimation.ANIM_HINT, 5, true);
						hintAnim.visible = true;
					}
				}
			}
		}.bind(this));
	};
	
	self.hintStop = function() {
		if(_hintTimer !== null){
			self.viewContext.time.events.remove(_hintTimer);
			_hintTimer = null;
		}
		// 힌트 목록 초기화
		if(_hintIndexArray !== null && _hintIndexArray.length > 0){
			_hintIndexArray.splice(0, _hintIndexArray.length);
			StzObjectPool.unloadList(EBlockAnimation.ANIM_HINT, EBlockAnimation.ANIM_HINT);
		}
	};
	
	/**
	 * 블럭 객체 반환
	 */
	self.getBlock = function(inRowIndex, inColIndex) {
		StzLog.assert(inRowIndex >= 0 && inRowIndex < InGameBoardConfig.ROW_COUNT, '[InGameController] Invalide inRowIndex: ' + inRowIndex);
		StzLog.assert(inColIndex >= 0 && inColIndex < InGameBoardConfig.COL_COUNT, '[InGameController] Invalide inColIndex: ' + inColIndex);
		return _blocks[inColIndex*InGameBoardConfig.ROW_COUNT + inRowIndex];
	};
	
	self.getBlockByIndex = function (inIndex) {
		StzLog.assert(inIndex >= 0 && inIndex < (InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT) , '[InGameController] Invalid inIndex: ' + inIndex);
		return _blocks[inIndex];
	};
	

	/**
	 * 스페셜 블럭 파괴 될때 불리는 콜백
	 */
	self.speicalBlockCallBack = function(type, index) {
		self.hintTimerStart();
		InGameSpecialBlock.specialBlockOperate(_blocks, index, type, this.speicalBlockScoreCallBack);
	};
	
	/**
	 * 스페셜 블럭으로 인해 파괴되는 블럭 점수 계산하기 위한 콜백
	 */
	self.speicalBlockScoreCallBack = function(removeBlockCount, index, inRemoveBlockList, scoreType) {

		
		if (inRemoveBlockList && inRemoveBlockList.length > 0) {
			
			for (var indexRemoveList = inRemoveBlockList.length - 1; indexRemoveList >= 0; indexRemoveList--) {
				var currentBlock = inRemoveBlockList[indexRemoveList];
				if (currentBlock && currentBlock.isInterrupted) {
					self.interruptedIce.removeInterruptedByIndex(currentBlock.index);
				}
			}
		}
		
		if(removeBlockCount <= 0){
			return;
		}
		
		_scoreData.setScore(removeBlockCount, true, scoreType);
		self.viewContext.createScoreText(_blocks[index].view.world.x, _blocks[index].view.world.y, removeBlockCount, scoreType);
		self.viewContext.createComboText();	
	};
	
	/**
	 * 초기 인게임 블럭 생성
	 */
	self.initBoard = function() {
		
		for (var index = 0; index < _blocks.length; index++) {
			
			var randomType = StzUtil.createRandomInteger(0, 4);
			if (_blocks[index] === null || _blocks[index] === undefined) {
				_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext, this.speicalBlockCallBack.bind(this));	
			} else {
				_blocks[index].init();
				_blocks[index].type = EBlockType.list[randomType];
			}
			_blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
		}
		
		if(this.checkMatched(true, function(){}) !== 0){
			for (var index = 0; index < _blocks.length; index++) {
				_blocks[index].destroy();
			}
			_blocks =  StzUtil.createArray(InGameBoardConfig.ROW_COUNT * InGameBoardConfig.COL_COUNT);
			self.initBoard();
		}
		else{
			return;
		}
	};

	self.updateView = function() {
		
		if(self.interruptedIce) {
			self.interruptedIce.updateInterrupt();
		}
		
		if(self.interruptedCloud) {
			self.interruptedCloud.updateInterrupt();
		}
		
		for (var index = 0; index < _blocks.length; index++) {
			if (_blocks[index] === null) {
				continue;
			}
			_blocks[index].updateView();
		}
		
		//떨어 질 예정인 블럭들을 못움직이게 하기(매번 주기적으로 체크)
		this.dropBlocksTempCheck();
		
		//손으로 스왑한 블럭의 경우 따로 매칭 체크
		if(_state !== EControllerState.LASTPANG_TURN && _state !== EControllerState.GAME_END ){
			//매칭된 블럭
			var machedArray = this.getMouseMoveMatched();
			//손으로 스압한 블럭이 스페셜 블럭
			var specialArray = this.getSpecialArray();
			
			var length = machedArray.length;
			if(this.isMouseMoveMatchedCheckSlidingEnd(machedArray) === true && this.isMouseMoveMatchedCheckSlidingEnd(specialArray) ){

				//매칭 된 블럭이 MATCH_MIN 보다 클 경우 (손으로 스압 했을 때 블럭이 매칭된 경우)
				if(length >= StzGameConfig.MATCH_MIN){
						//매칭신시사운드 매치 카운트 초기화
						_soundMatchedCount = 1;
					
						self.hintTimerStart();
						self.viewContext.time.events.add(100, function(){
							StzSoundList[ESoundName.SE_MATCH+"1_"+StzUtil.createRandomInteger(1,2)].play();
						});
						
						_scoreData.setScore(length, true, EScoreType.GEN_MATCHED);
						if(_pivotFlag === true){
							self.viewContext.createScoreText(_blocks[machedArray[0].spicialCreatePosIndex].view.world.x, _blocks[machedArray[0].spicialCreatePosIndex].view.world.y, length, EScoreType.GEN_MATCHED);
						}
						
						//매칭 배열에 들어 있는 블럭들을 타입, 매칭의 시작 점을 기준으로 정렬
						var devideBlocks = this.devideBlock(machedArray);
							
						var devideLength = devideBlocks.length;
						for(var i=0;i<devideLength;i++){
							//매칭 된 블럭을 체크 하고 스페셜 블럭으로 만들거나 터트림
							this.checkAndCreateSpecialBlock(devideBlocks[i], true);
						}

						this.viewContext.createComboText();

				}
	
				if(specialArray.length === 1){
					//현재 움직인 블럭이 스페셜 블럭인데 한 개인 경우
					_soundMatchedCount = 1;
					self.hintTimerStart();
					InGameSpecialBlock.specialBlockOperate(_blocks, specialArray[0].index, specialArray[0].type, this.speicalBlockScoreCallBack);
					
				}
				else if(specialArray.length !== 0){
					_soundMatchedCount = 1;
					var devideSpecialBlocks = self.sortToTouchIdSpecialBlocks(specialArray);
					InGameSpecialBlock.specialBlocksOperate(_blocks, devideSpecialBlocks, this.speicalBlockScoreCallBack);

				}
			}
		}

		if(_state === EControllerState.USER_TURN){
			//슬라이드 중인 블럭이 없을 경우 매칭 유무 체크 상태로 변경
			if(this.checkNormal(true) === false){
				//StzLog.print("슬라이드 유무 체크");
				_state = EControllerState.SLIDING_TURN;
			}
			else{
				if(_pivotFlag === true){
					this.AllBlockClickFrame();
				}
				_state = EControllerState.NONE_TURN;
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
				_state = EControllerState.ANIM_TURN;
			}.bind(this));
			//매칭 사운드 소리 3단계 조절하기 위한 부분
			if (currentDropMatchedCount > 0) {
				_soundMatchedCount++;
				if(_soundMatchedCount > StzGameConfig.MATCHED_MAX_COUNT){
					_soundMatchedCount = StzGameConfig.MATCHED_MAX_COUNT;
				}
				var soundMatchedCount = _soundMatchedCount;
				self.viewContext.time.events.add(100, function(){
					//연쇄 파괴 매칭되는 소리 구별
					StzSoundList[ESoundName.SE_MATCH + soundMatchedCount+"_"+StzUtil.createRandomInteger(1,2)].play();
				}.bind(soundMatchedCount));

				self.hintTimerStart();
			}
			else{
				_state = EControllerState.USER_TURN;
			}
		}

		else if(_state === EControllerState.LASTPANG_TURN){
			
			var specialBlockIndex = -1;
			var lastPangMachedCount = 0;
			if(this.checkNormal(false) === true){
				lastPangMachedCount = this.checkMatched(false, function() {}.bind(this));
				
				if(lastPangMachedCount === 0){
					specialBlockIndex = this.getSpecialBlockIndex();
					
                    if(specialBlockIndex !== -1){
                    	InGameSpecialBlock.specialBlockOperate(_blocks, _blocks[specialBlockIndex].index, _blocks[specialBlockIndex].type, this.speicalBlockScoreCallBack);
                    }
				}
				else if (lastPangMachedCount > 0) {
					self.viewContext.time.events.add(100, function(){
						StzSoundList[ESoundName.SE_MATCH +"1_"+StzUtil.createRandomInteger(1,2)].play();
					});

					_scoreData.setScore(lastPangMachedCount, false, EScoreType.GEN_MATCHED);	
				}
			
			}
			//더이상 블럭의 이동이 없을 경우 게임 종료
			if(this.checkNormal(false) === true){
				_state = EControllerState.GAME_END;
			}
			
			else{
				this.dropBlocks();
				this.refillBoard(false);
			}
		}
		
		else if(_state === EControllerState.GAME_END){
			
			if (self.viewContext.meGameEnd === false) {
				self.viewContext.meGameEnd = true;
				if (window.realjs) {
					realjs.realSendMessage(JSON.stringify({'game_end': true}), false);
				}
				self.viewContext.showWaitingFriends();
			}
			
			if (self.viewContext.checkGameEnd()) {
				self.viewContext.hideWaitingFriends();
				self.viewContext.time.events.add(Phaser.Timer.SECOND , function() {
					self.viewContext.stopControllGame();
				}.bind(self));
			}

		}
		
		//블럭 드랍과 리필 로직은 스테이트와 상관없이 동작 (라스트팡, 폭탄 상태때는 작동하지 않음)
		if( /*this.checkAnim() === true &&*/ _state !== EControllerState.LASTPANG_TURN || _state !== EControllerState.GAME_END && this.isDroping() === false){
			if(this.dropBlocks() === true){
				this.refillBoard(true);
				
				if(_pivotFlag === true){
					this.AllBlockClickFrame();
				}
				
				_state = EControllerState.USER_TURN;
			}
		}
		
	};
	
	/**
	 * 현재 드롭 중인 상태가 있는지 체크
	 */
	self.isDroping = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			if (_blocks[index].slidVelocity === ESlideVelocity.BLOCK_DROP) {
				return true;
			}
		}	
		return false;
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
			
		// 방어 코드 삽입, 혹시나 flag 값 제대로 안바뀌었을 경우 체크 하는 부분
		/////////////////////////////////////////////////////////
		if(_blocks[index] === undefined || _blocks[index] === null || _blocks[index].state === undefined|| 
		(_blocks[index].state !== EBlockState.NORMAL && _blocks[index].state !== EBlockState.SLIDING_END && _blocks[index].state !== EBlockState.REMOVE)){
			return;
		}
		
		if(_blocks[preIndex] === undefined || _blocks[preIndex] === null || _blocks[preIndex].state === undefined || 
		(_blocks[preIndex].state !== EBlockState.NORMAL && _blocks[preIndex].state !== EBlockState.SLIDING_END && _blocks[preIndex].state !== EBlockState.REMOVE)){
			return;
		}
		
		if(_blocks[index].isMoveAndMatch === true || _blocks[preIndex].isMoveAndMatch === true){
			return;
		}
		
		if(_blocks[index].state === EBlockState.REMOVE_ANIM || _blocks[preIndex].state === EBlockState.REMOVE_ANIM){
			return;
		}
		
		if(_blocks[index].returnFlag === true || _blocks[preIndex].returnFlag === true){
			_blocks[index].returnFlag = false;
			_blocks[preIndex].returnFlag = false;
			 
			 return;
		}
		
		if(_blocks[index].isTwoMatched === true || _blocks[preIndex].isTwoMatched === true){
			_blocks[index].isTwoMatched = false;
			_blocks[preIndex].isTwoMatched = false;
			
			return;
		}
		
		if(_blocks[index].isInterrupted === true || _blocks[preIndex].isInterrupted === true){

			_blocks[index].isInterrupted = false;
			_blocks[preIndex].isInterrupted  = false;
			
			return
		}
		
		if(_blocks[index].isMoveAndMatch === true || _blocks[preIndex].isMoveAndMatch === true){

			//debugger;
			_blocks[index].isMoveAndMatch = false;
			_blocks[preIndex].isMoveAndMatch = false;
			
			return;
		}
		
		if(_blocks[index].isSwapped === true || _blocks[preIndex].isSwapped === true){
			//debugger;
			_blocks[index].isSwapped = false;
			_blocks[preIndex].isSwapped = false;
			
			return;
		}
		///////////////////////////////////////////////////////////////////////////////////////

		_blocks[index].slidVelocity =	slidVelocity;
		_blocks[preIndex].slidVelocity = slidVelocity;
		
		if(_blocks[index].view !== null && _blocks[preIndex].view !== null){
			_blocks[index].preView =	_blocks[index].view;
			_blocks[index].preType =	_blocks[index].type;
			
			_blocks[preIndex].preView = _blocks[preIndex].view;
			_blocks[preIndex].preType = _blocks[preIndex].type;
		}

		var temp = _blocks[index].view;
        _blocks[index].view = _blocks[preIndex].view;
        _blocks[preIndex].view = temp; 
        	
        var temp = _blocks[index].type;
        _blocks[index].type = _blocks[preIndex].type;
        _blocks[preIndex].type = temp; 
	};
	
	/**
	 * 손으로 이동 후 매치된 불럭을 리턴
	 */
	self.getMouseMoveMatched = function(){
		var machedArray = [];
		for (var index = 0; index < _blocks.length; index ++) {
			//블럭의 이동 속도를 체크하여 이 블록이 어느 이동이였는지 체크
			if (_blocks[index].isTwoMatched === true && !_blocks[index].isBlockSpicial()) {
				machedArray.push(_blocks[index]);
			}
		}	
		return machedArray;
	};
	
	/**
	 * 손으로 이동 후 매칭된  블럭 중 스페셜 블럭을 리턴
	 */
	self.getSpecialArray = function(){
		var specialArray = [];
		for (var index = 0; index < _blocks.length; index ++) {
			if (_blocks[index].isTwoMatched === true && _blocks[index].isBlockSpicial()) {
				specialArray.push(_blocks[index]);
			}
		}	
		return specialArray;
	};
	
	/**
	 * 스페셜 블럭 중에서 가장 상단에 있는 블럭의 index를 리턴
	 */
	self.getSpecialBlockIndex = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			if (_blocks[index].isBlockSpicial()) {
				return index;
			}
		}	
		return -1;
	};
	
	/**
	 * 터치된 블럭 터치 id에 따라 정렬된 배열을 리턴
	 */
	self.sortToTouchIdSpecialBlocks = function(speicalBlocks){
		var devideBlocks = [];
		var speicalLength = speicalBlocks.length;
		
		for(var i =0; i < speicalLength; i++){
			if(devideBlocks.length === 0){
				devideBlocks[0] = [];
				devideBlocks[0].push(speicalBlocks[i]);
			}
			else{
				var devideLength = devideBlocks.length;
				var sameFlag = false;
				
				for(var j =0; j < devideLength; j++){
					if(devideBlocks[j][0].touchId === speicalBlocks[i].touchId){
						devideBlocks[j].push(speicalBlocks[i]);
						sameFlag = true;
						break;
					}
				}
				
				if(sameFlag === false){
					devideBlocks[devideLength] = [];
					devideBlocks[devideLength].push(speicalBlocks[i]);
				}
			}
		}
		
		return devideBlocks;
	};
	
	/**
	 * 매치된 블럭을 타입별, 스페셜 블럭 생성 위치를 기준으로 나눔
	 */
	self.devideBlock = function(machedArray){
		var devideBlocks = [];
		var machedLength = machedArray.length;

		for(var i =0; i < machedLength; i++){
			if(devideBlocks.length === 0){
				devideBlocks[0] = [];
				devideBlocks[0].push(machedArray[i]);
			}
			else{
				var devideLength = devideBlocks.length;
				var sameFlag = false;
				
				for(var j =0; j < devideLength; j++){
					if(devideBlocks[j][0].type === machedArray[i].type
						&&devideBlocks[j][0].spicialCreatePosIndex === machedArray[i].spicialCreatePosIndex){
						devideBlocks[j].push(machedArray[i]);
						sameFlag = true;
						break;
					}
				}
				
				if(sameFlag === false){
					devideBlocks[devideLength] = [];
					devideBlocks[devideLength].push(machedArray[i]);
				}
			}
		}
		
		return devideBlocks;
	};
	
	/**
	 * 매치된 블럭을 체크하여 스페셜블록을 만듬
	 */
	self.checkAndCreateSpecialBlock = function(machedBlocks, isMoveMatched){
		var blockLength = machedBlocks.length;
		var spicialCreatePosIndex = machedBlocks[0].spicialCreatePosIndex;
		
		if(blockLength === 3){
			for(var i=0;i<blockLength;i++){
				machedBlocks[i].setBlockState(EBlockState.REMOVE_ANIM);
				machedBlocks[i].isTwoMatched = false;
				machedBlocks[i].spicialCreatePosIndex = -1;
			}
		}
		else if(blockLength === 4){
			var fourspeicalType = InGameMatchFilter.isFourCheck(machedBlocks);

			for(var i=0;i<blockLength;i++){
				if(spicialCreatePosIndex === machedBlocks[i].index){
					if(fourspeicalType === EBlockType.NONE){
						machedBlocks[i].setBlockState(EBlockState.REMOVE_ANIM);
					}
					else{
						machedBlocks[i].setBlockState(EBlockState.CREATE_SPECIAL);
						machedBlocks[i].type = fourspeicalType;
					}
				}
				else{
					machedBlocks[i].setBlockState(EBlockState.REMOVE_ANIM);
				}
				machedBlocks[i].isTwoMatched = false;
				machedBlocks[i].spicialCreatePosIndex = -1;
			}
		}
		else {
			if(blockLength >= 5){
				for(var i=0;i<blockLength;i++){
					if(spicialCreatePosIndex ===  machedBlocks[i].index){
						machedBlocks[i].setBlockState(EBlockState.CREATE_SPECIAL);
						machedBlocks[i].type = EBlockType.CIRCLE;
					}
					else{
						machedBlocks[i].setBlockState(EBlockState.REMOVE_ANIM);
					}
					
					machedBlocks[i].isTwoMatched = false;
					machedBlocks[i].spicialCreatePosIndex = -1;
				}
			}
			else{
				for(var i=0;i<blockLength;i++){
					machedBlocks[i].setBlockState(EBlockState.REMOVE_ANIM);
					
					machedBlocks[i].isTwoMatched = false;
					machedBlocks[i].spicialCreatePosIndex = -1;
				}
			}
			
		}
		if(spicialCreatePosIndex === -1){
			return;
		}
		
		if(isMoveMatched === false){
			_scoreData.setScore(machedBlocks.length, false, EScoreType.GEN_MATCHED);
		}
		
		if(isMoveMatched === false || _pivotFlag === false ){
			
			self.viewContext.createScoreText(_blocks[spicialCreatePosIndex].view.world.x, _blocks[spicialCreatePosIndex].view.world.y, machedBlocks.length, EScoreType.GEN_MATCHED);
		}
		
		
	};
	
	/**
	 * 사용자에 이동되서 터지는 블럭들의 상태 변화가 끝났는지 체크
	 */
	self.isMouseMoveMatchedCheckSlidingEnd = function(machedArray){
		for (var index = 0; index < machedArray.length; index ++) {
			if (machedArray[index].state !== EBlockState.NORMAL
					&&machedArray[index].state !== EBlockState.REMOVE) {
					return false;
				}
		}	
		return true;
	};
	
	/**
	 * 모든 블럭들이 슬라이드 여부가 끝난는지 체크
	 */
	self.checkSlidingEnd = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			
			//블럭에 외적 요소의 저항이 있는 경우 체크
			if(_blocks[index].isExternalFactors() === false){
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
	 * 블럭들이 노멀 상태인지 체크
	 * isPureBlock : pureBlock인지 체크 할 것인지 여부
	 */
	self.checkNormal = function(isPureBlock){

		for (var index = 0; index < _blocks.length; index ++) {
		
			if (_blocks[index].state !== EBlockState.NORMAL) {
				return false;
			}
			if(isPureBlock === true){
				if(_blocks[index].isPureBlock() === false){
					return false;
				}
			}
		}	
		return true;
	};
	
	/**
	 * 애니매이션 중인 블럭이 있는지 체크
	 */
	self.checkAnim = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			
			//블럭에 외적 요소의 저항이 있는 경우 체크
			if(_blocks[index].isExternalFactors() === false){
				continue;
			}

			if (_blocks[index].state === EBlockState.ANIMATION) {
				return false;
			}
		}	
		return true;
	};
	

	/**
	 * 현재 보드 상에 있는 블럭들 중 한번의 이동으로 매치될 수 있는 것이 있는 지 확인하는 함수
	 * isBoolean === true : 리필 후 매칭 가능 여부 확인 할 경우
	 * isBoolean === false : 힌트 블럭의 배열을 리턴 할 경우
	 */ 
	self.isOneMoveCheckMatched = function(isBoolean) {
		
		var length = _blocks.length;
		var movePos = [1, -1, (1*InGameBoardConfig.ROW_COUNT), -(1*InGameBoardConfig.ROW_COUNT)];
		for(var i =0; i < length; i++)
		{
			var movePosLength = movePos.length;
			
			for(var j =0; j < movePosLength; j++){
				if(i+movePos[j] <= 0 || i+movePos[j] >= length){
					continue;
				}
				
				if(movePos[j] === 1){
					if(i%InGameBoardConfig.ROW_COUNT === 6){
						continue;
					}
				}
				
				if(movePos[j] === -1){
					if(i%InGameBoardConfig.ROW_COUNT === 0){
						continue;
					}
				}
				
				var block = _blocks[i+movePos[j]];

				// NOTE @hyegeun 방해 얼음 - isOneMoveCheckMatched에서 방해 블럭은 건너뜀
				if (block.isInterrupted === true) {
					continue;
				}
				
				if( block != null && block.view != null && block.state === EBlockState.NORMAL)
				{
					var curType =  _blocks[i].type;
					var preType = _blocks[i+movePos[j]].type;
					
					var arrayVert = [];
					var arrayHoriz = [];
					
					block.type = curType;
					_blocks[i].type = preType;
					
					arrayVert.push(_blocks[i].index);
					arrayHoriz.push(_blocks[i].index);
					
					arrayVert = StzUtil.sumArrays(arrayVert, this.countSameTypeBlock(block, 0, -1, true));
					arrayVert = StzUtil.sumArrays(arrayVert, this.countSameTypeBlock(block, 0, 1, true));
					
					arrayHoriz = StzUtil.sumArrays(arrayHoriz, this.countSameTypeBlock(block, -1, 0, true));
					arrayHoriz = StzUtil.sumArrays(arrayHoriz, this.countSameTypeBlock(block, 1, 0, true));
					
					block.type = preType;
					_blocks[i].type = curType;
					
					if (arrayVert.length >= StzGameConfig.MATCH_MIN)
					{
						return (isBoolean=== true)? true:arrayVert;
					}

					if (arrayHoriz.length >= StzGameConfig.MATCH_MIN)
					{
						return (isBoolean=== true)? true:arrayHoriz;
					}	
					
				}
			}
		}
		return (isBoolean === true)? false:null;
	};
	
	// 리필된 블럭이 떨어진 후, 전체 인게임 보드에서 매칭된 블럭 체크
	self.checkMatched = function(remove_Flag, inCallback, inCallbackContext) {
		
		var length = _blocks.length;
		var mactedCount = 0;
		var removeFlag = false;
		
		var matctedArray = [];
		
		if(remove_Flag === undefined){
			removeFlag = false;
		}
		else{
			removeFlag = remove_Flag;
		}
		
		for(var i =0; i < length; i++)
		{
			var block = _blocks[i];
			
			if(block.returnFlag === true){
				continue;
			}

			// NOTE @hyegeun 자동 매칭 블럭들 중에 얼음이 있는 경우 매칭되지 않음
			if (block.isInterrupted === true) {
			    continue;
			}

			if( block != null && block.view != null && block.state === EBlockState.NORMAL)
			{
				var countUp = this.countSameTypeBlock(block, 0, -1);
				var countDown = this.countSameTypeBlock(block, 0, 1);
				var countLeft = this.countSameTypeBlock(block, -1, 0);
				var countRight = this.countSameTypeBlock(block, 1, 0);
				
				var countHoriz = countLeft + countRight + 1;
				var countVert = countUp + countDown + 1;

				var matctedTempArray = [];
				
				if (countVert >= StzGameConfig.MATCH_MIN)
				{
					if(removeFlag === true){
						return 1;
					}
					
					matctedTempArray = StzUtil.sumArrays(matctedTempArray, this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, false));
				}

				if (countHoriz >= StzGameConfig.MATCH_MIN)
				{
					if(removeFlag === true){
						return 1;
					}
					
					matctedTempArray = StzUtil.sumArrays(matctedTempArray, this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, false));
				}
				
				for(var j=0;j<matctedTempArray.length;j++){
					matctedTempArray[j].spicialCreatePosIndex = matctedTempArray[Math.floor(matctedTempArray.length/2)].index;
				}
				
				matctedArray = StzUtil.sumArrays(matctedArray, matctedTempArray);
			}
		}
		
		var devideBlocks = this.devideBlock(matctedArray);
		
		var devideLength = devideBlocks.length;
		
		for(var i=0;i<devideLength;i++){
			this.checkAndCreateSpecialBlock(devideBlocks[i], false);
			mactedCount += devideBlocks[i].length;
		}
		
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
        
        if(removeFlag === true){
			return 0;
		}
        
		return mactedCount;
	};
	
	
	/**
	 * 두블럭의 이동으로 제거되는 블럭 체크
	 */
	self.twoBlockCheckMatched = function(fromBlock, toBlock) {
		
		if (fromBlock === undefined || fromBlock === null) { 
				return; 
			}

	    if (toBlock === undefined || toBlock === null ) { 
	    		return; 
	    }
	    
	    // NOTE @hyegeun fromBlock이나 toBlock이 방해당한 블럭이라면 로직 제한
	    if (fromBlock.isInterrupted === true || toBlock.isInterrupted === true) {
	    	return;
	    }

	    // process the selected gem
	    var mactedBlocks = [];
	    var countUp = this.countSameTypeBlock(fromBlock, 0, -1);
	    var countDown = this.countSameTypeBlock(fromBlock, 0, 1);
	    var countLeft = this.countSameTypeBlock(fromBlock, -1, 0);
	    var countRight = this.countSameTypeBlock(fromBlock, 1, 0);

	    var countHoriz = countLeft + countRight + 1;
	    var countVert = countUp + countDown + 1;
	
	    var block = fromBlock;
	    
	    var machedBlocks = [];
	    var machedVertBlocks = [];
	    var machedHorizBlocks = [];
	    
	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	machedVertBlocks = this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, true);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	machedHorizBlocks = this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, true);
	    }
	    
	    machedBlocks = StzUtil.sumArrays(machedVertBlocks, machedHorizBlocks);
	    
	    if(machedBlocks.length !== 0){
	    	for(var i =0; i<machedBlocks.length; i++){
	    		machedBlocks[i].spicialCreatePosIndex = fromBlock.index;
	    	}
	    }
	    // now process the shifted (swapped) gem
	    block = toBlock;
	    countUp = this.countSameTypeBlock(toBlock, 0, -1);
	    countDown = this.countSameTypeBlock(toBlock, 0, 1);
	    countLeft = this.countSameTypeBlock(toBlock, -1, 0);
	    countRight = this.countSameTypeBlock(toBlock, 1, 0);
	    
	    countHoriz = countLeft + countRight + 1;
	    countVert = countUp + countDown + 1;
	    
	    machedVertBlocks = [];
	    machedHorizBlocks = [];
	    
	    if (countVert >= StzGameConfig.MATCH_MIN)
	    {
	    	machedVertBlocks = this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, true);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	machedHorizBlocks = this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, true);
	    }
	    
	    var tempMachedBlocks = StzUtil.sumArrays(machedVertBlocks, machedHorizBlocks);
	    
	    if(tempMachedBlocks.length !== 0){
	    	for(var i =0; i<tempMachedBlocks.length; i++){
	    		tempMachedBlocks[i].spicialCreatePosIndex = toBlock.index;
	    	}
	    }
	    
	    machedBlocks = StzUtil.sumArrays(machedBlocks, tempMachedBlocks);
	    
		if(fromBlock.isBlockSpicial()){
			machedBlocks.push(fromBlock);
		}
		
		if(toBlock.isBlockSpicial()){
			machedBlocks.push(toBlock);
		}
		
	    return machedBlocks;
	};
	
	/**
	 * 주변에 같은 블럭의 개수를 체크하는 로직
	 */
	self.countSameTypeBlock = function(startBlock, moveX, moveY, isArray_Flag) {
		var curX = startBlock.posX + moveX;
		var curY = startBlock.posY + moveY;
		var count = 0;
		var isArrayFlag = false;
		var indexArray = [];
		
		if(isArray_Flag === undefined){
			isArrayFlag = false;
		}
		else{
			isArrayFlag = isArray_Flag;
		}
		
		while (curX >= 0 && curY >= 0 && curX < InGameBoardConfig.COL_COUNT 
				&& curY < InGameBoardConfig.ROW_COUNT &&this.getBlock(curX, curY) != undefined &&this.getBlock(curX, curY) != null && this.getBlock(curX, curY).type === startBlock.type
				&& this.getBlock(curX, curY).state === EBlockState.NORMAL
				&& startBlock.state === EBlockState.NORMAL
				&&this.getBlock(curX, curY).isMoveAndMatch === false && startBlock.isMoveAndMatch === false
				&&!this.getBlock(curX, curY).isBlockSpicial() && !startBlock.isBlockSpicial()) {
			var currentBlock = this.getBlock(curX, curY);
			// NOTE @hyegeun 방해 얼음 : 매칭된 개수를 찾는 도중 방해 블럭이 나오면 카운트 멈춤
			if (currentBlock.isInterrupted === true) {
				break;
			}
			if(isArrayFlag === true){
				indexArray.push(curX + InGameBoardConfig.ROW_COUNT*curY);
			}
			else{
				count++;
			}
			
		    curX += moveX;
		    curY += moveY;
		}

		if(isArrayFlag === false){
			return count;
		}
		else{
			return indexArray;
		}
	};
	
	/**
	 * 제거 범위를 매게변수로 입력 받아서 블럭 상태를 제거 상태로 만드는 로직
	 */
	self.killBlockRange = function(from_X, from_Y, to_X, to_Y, isMoveMatched) {
		
		var fromX = Phaser.Math.clamp(from_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var fromY = Phaser.Math.clamp(from_Y , 0, InGameBoardConfig.ROW_COUNT - 1);
	    var toX = Phaser.Math.clamp(to_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var toY = Phaser.Math.clamp(to_Y, 0, InGameBoardConfig.ROW_COUNT - 1);

	    var machedBlocks = [];
	
	    for (var i = fromX; i <= toX; i++)
	    {
	        for (var j = fromY; j <= toY; j++)
	        {
	            var block =  this.getBlock(i, j);
	            if(block === undefined || block === null || block.isBlockSpicial()) {
	            	continue;
	            }  
	            
	            if(isMoveMatched === true && _pivotFlag === true){
	    	    	if(this.isFeverKillBlock(i, j-1) === true){
	    	    		 machedBlocks.push(_blocks[(j-1)*InGameBoardConfig.ROW_COUNT + i]);
	    	    	}   	
	    	    	if(this.isFeverKillBlock(i, j+1) === true){
	    	    		 machedBlocks.push(_blocks[(j+1)*InGameBoardConfig.ROW_COUNT + i]);
	    	    	}
	    	    	if(this.isFeverKillBlock(i-1, j) === true){
	    	    		 machedBlocks.push(_blocks[j*InGameBoardConfig.ROW_COUNT + (i-1)]);
	    	    	}
	    	    	if(this.isFeverKillBlock(i+1, j) === true){
	    	    		 machedBlocks.push(_blocks[j*InGameBoardConfig.ROW_COUNT + (i+1)]);
	    	    	}	
	    	    	if(this.isFeverKillBlock(i, j) === true){
	    	    		 machedBlocks.push(_blocks[j*InGameBoardConfig.ROW_COUNT + i]);
	    	    	}	
	    	    } 
	    	    else{
	    	    	  machedBlocks.push(block);
		        }
		   }

	    }
	    return machedBlocks;
	};

	/**
	 * 피벗 모드 일 경우에는 주변 블럭이 제거 되는데 그 중에서 제거가 가능한 블럭인지 체크
	 */
	self.isFeverKillBlock = function(x, y){
		
		if(x < 0 || x >= InGameBoardConfig.ROW_COUNT || y < 0 || y >= InGameBoardConfig.COL_COUNT ){
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

	        for (var j = InGameBoardConfig.ROW_COUNT-1; j >= 0; j--)
	        {
	            var block = this.getBlock(i, j);
	            
	         // NOTE @hyegeun 방해 얼음 : 드랍 방지
	            if (block.isInterrupted === true) {
	            	dropRowCount = 0;
	            	continue;
	            }
	            
	            if (block.view === null)
	            {
	                dropRowCount++;
	                if(j === 0){
		            	dropflag = true;
	                }
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

	         // NOTE @hyegeun 방해얼음 : 드랍 방지
            	if (block.isInterrupted === true) {
            		dropRowCount = 0;
            		continue;
            	}
	            
	            
	            if (block.state === EBlockState.REMOVE_ANIM || block.state === EBlockState.ANIMATION
	            	|| block.state === EBlockState.REMOVE || block.isTwoMatched === true)
	            {
	                dropRowCount++;   
	            }

	            else if (dropRowCount > 0)
	            {
	            	var preIndex = j*InGameBoardConfig.ROW_COUNT + i;
	            	
	            	_blocks[preIndex].isDrop = true;
	            }
	        }
	    }
	};
	
	self.refillBoard = function(checkFlag) {
		var refillBlocks = [];
		
		for (var i = 0; i < InGameBoardConfig.COL_COUNT; i++){

	        for (var j = 0; j < InGameBoardConfig.ROW_COUNT; j++){
	            var block = this.getBlock(i, j);

	            // NOTE @hyegeun 방해 얼음 : 신규 생성하지 않도록 막음
	            if (block.isInterrupted === true) {
	            	break;
	            }
	            
	            if ((block === null ||  block.view === null) && (block.isTwoMatched === false || block.isMoveAndMatch === true)) {
	            	
	            	 if( block.returnFlag === true){
	 	            	continue;
	   	            }
	            	 
	            	var index = j*InGameBoardConfig.ROW_COUNT + i;
	            	var randomType = StzUtil.createRandomInteger(0, 4 + _levelCount);
	            
	            	if ( _blocks[index] === undefined || _blocks[index] === null) {
	            		_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext, this.speicalBlockCallBack);	
	            	} else {
	            		_blocks[index].init();
	            		_blocks[index].type = EBlockType.list[randomType];
	            	}
	            	_blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
					refillBlocks.push(_blocks[index]);
	            }
	        }
	    }

		if(checkFlag === true && this.isOneMoveCheckMatched(true) === false){
			for (var index = 0; index < refillBlocks.length; index++) {
				refillBlocks[index].destroy();
			}
		}
	};
	
	self.moveBlock = function(pointer, x, y) {
		if(_controlFlag === false){
			return;
		}

		if(_moveBlocks[pointer.id] === undefined || _moveBlocks[pointer.id] === null || _moveBlocks[pointer.id].fromBlock === undefined || _moveBlocks[pointer.id].fromBlock === null){
			return;
		}
		
		if( _moveBlocks[pointer.id].fromBlock.returnFlag === true){
          	return;
		}

		if (_moveBlocks[pointer.id].fromBlock.isInterrupted === true) {
            return;
		}

		var hitPoint = new Phaser.Rectangle(x, y, 30, 30);
		var length = _blocks.length;
		var machedBlocks = [];
		var hitFlag = false;
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];
			if(block !== null && block.view !== null && block.state === EBlockState.NORMAL){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					
					if(_moveBlocks[pointer.id] === undefined){
						delete _moveBlocks[pointer.id];
						return;
					}
			
					if( _moveBlocks[pointer.id].fromBlock.view === undefined  || _moveBlocks[pointer.id].fromBlock.view === null ||_moveBlocks[pointer.id].fromBlock.view.getBounds() === block.view.getBounds()) {
						return;
					}
					
					if(block.isPureBlock() === false){
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(Math.abs(_moveBlocks[pointer.id].fromBlock.posX - block.posX) === 1){
						if(Math.abs(_moveBlocks[pointer.id].fromBlock.posY - block.posY) === 0){
							hitFlag = true;
							_moveBlocks[pointer.id].toBlock = block;

							this.blockViewSwap(_moveBlocks[pointer.id].fromBlock, _moveBlocks[pointer.id].toBlock, ESlideVelocity.BLOCK_MOVE);
							machedBlocks = this.twoBlockCheckMatched(_moveBlocks[pointer.id].fromBlock, _moveBlocks[pointer.id].toBlock);
							if(machedBlocks.length === 0){
			
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].play();
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].onStop.add(function(){
									StzSoundList[ESoundName.SE_BLOCK_SWITCH].onStop.removeAll(this);
									StzSoundList[ESoundName.SE_BLOCK_MISSMATCH].play();
								}, this);
								
								if(_moveBlocks[pointer.id].fromBlock.isBlockSpicial() === false 
									&& _moveBlocks[pointer.id].toBlock.isBlockSpicial() === false){
									_moveBlocks[pointer.id].fromBlock.returnFlag = true;
									_moveBlocks[pointer.id].toBlock.returnFlag = true;

								}
			
								delete _moveBlocks[pointer.id];
							}
							else{
								
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].play();
								var length = machedBlocks.length;
								for(var i=0;i<length;i++){
									machedBlocks[i].isTwoMatched = true;
									machedBlocks[i].touchId = pointer.id;
								}

								delete _moveBlocks[pointer.id];
							}

				            return;
						}
	
					}
					else if(Math.abs(_moveBlocks[pointer.id].fromBlock.posY - block.posY) === 1){
						if(Math.abs(_moveBlocks[pointer.id].fromBlock.posX - block.posX) === 0){
							
							hitFlag = true;
							_moveBlocks[pointer.id].toBlock = block;

							this.blockViewSwap(_moveBlocks[pointer.id].fromBlock, _moveBlocks[pointer.id].toBlock, ESlideVelocity.BLOCK_MOVE);
							
							machedBlocks = this.twoBlockCheckMatched(_moveBlocks[pointer.id].fromBlock, _moveBlocks[pointer.id].toBlock);
							if(machedBlocks.length === 0){
					
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].play();
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].onStop.add(function(){
									StzSoundList[ESoundName.SE_BLOCK_SWITCH].onStop.removeAll(this);
									StzSoundList[ESoundName.SE_BLOCK_MISSMATCH].play();
								}, this);
								
								if(_moveBlocks[pointer.id].fromBlock.isBlockSpicial() === false 
										&& _moveBlocks[pointer.id].toBlock.isBlockSpicial() === false){
										_moveBlocks[pointer.id].fromBlock.returnFlag = true;
										_moveBlocks[pointer.id].toBlock.returnFlag = true;
										self.hintTimerStart();
								}

								delete _moveBlocks[pointer.id];
							}
							else{
					
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].play();
								var length = machedBlocks.length;
								for(var i=0;i<length;i++){
									machedBlocks[i].isTwoMatched = true;	
									machedBlocks[i].touchId = pointer.id;
								}

								delete _moveBlocks[pointer.id];
							}
				            return;
						}
					}
					else{
						delete _moveBlocks[pointer.id];		
					}
					
				}
			}	
		}
		if(hitFlag === false){
			//마우스 포인트 보드 밖으로 넘어 갈 경우 블럭 상태 초기화
			this.initBlockFrame(_moveBlocks[pointer.id].fromBlock);
			delete _moveBlocks[pointer.id];	
		}
	};
	
	self.clickBlock = function(pointer) {
		if(_controlFlag === false){
			return;
		}
		
		if(_state === EControllerState.LASTPANG_TURN || _state === EControllerState.GAME_END){
			return;
		}
		 _moveBlocks[pointer.id] = {fromBlock:null, toBlock:null};
		
		var length = _blocks.length;
		var hitPoint = new Phaser.Rectangle(pointer.x, pointer.y, 2, 2);
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];

			if(block !== undefined && block !== null && block.view !== undefined && block.view !== null && block.state === EBlockState.NORMAL){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.isPureBlock() === false){
						delete _moveBlocks[pointer.id];
						return;
					}
					// NOTE @hyegeun 얼음 방해 : 테스트 코드
					if (pointer.middleButton.isDown) {
						
						var targetInterruptList = this.interruptedIce.getInterruptedBlocks(block.index);
						this.interruptedIce.setInterrupted(targetInterruptList, true, function(inRemainCount) {
							//console.log('[InGameController] IceInterrupted Remain: ' + inRemainCount);
						}, this);
						
					}
					if( block.returnFlag === true){
						block.returnFlag = false;
	  	            	return;
	  	            }
					StzSoundList[ESoundName.SE_BLOCK_CLICK].play();
					
					if(block.isMoveAndMatch === true){
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(block.isTwoMatched === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(block.isDrop === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					// NOTE @hyegeun 얼음 방해 : 클릭 제한 - 방해된 블럭을 터치했을 때 아무런 영향 없음.
					if (block.isInterrupted === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(!block.isBlockSpicial()){
						block.setImageFrame(EBlockImage.CLICKED);
					}

					_moveBlocks[pointer.id].fromBlock = block;
						
				}
				
			}
		}
	};
	
	self.unClickBlock = function(pointer) {
		if(_controlFlag === false){
			return;
		}
		
		if(_state === EControllerState.LASTPANG_TURN || _state === EControllerState.GAME_END){
			return;
		}
		
		//현재 클릭 된 블럭의 값이 없는 상태에서 마우스 버튼 놓을 경우 리턴
		if(_moveBlocks[pointer.id] === undefined || _moveBlocks[pointer.id] === null){
			return;
		}
		
		if(_moveBlocks[pointer.id].fromBlock === undefined || _moveBlocks[pointer.id].fromBlock === null){
			return;
		}
//		if(_moveBlocks[pointer.id] !== undefined && _moveBlocks[pointer.id] !== null){
//			if(_moveBlocks[pointer.id].fromBlock !== undefined && _moveBlocks[pointer.id].fromBlock !== null){
//				this.initBlockFrame(_moveBlocks[pointer.id].fromBlock);
//				delete _moveBlocks[pointer.id];
//				return;
//			}
//			
//			if(_moveBlocks[pointer.id].toBlock !== undefined && _moveBlocks[pointer.id].toBlock !== null){
//				this.initBlockFrame(_moveBlocks[pointer.id].toBlock);
//				delete _moveBlocks[pointer.id];
//				return;
//			}
//
//			
//		}
		
		var length = _blocks.length;
		var hitPoint = new Phaser.Rectangle(pointer.x, pointer.y, 2, 2);
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];

			if(block !== undefined && block !== null && block.view !== undefined && block.view !== null && block.state === EBlockState.NORMAL){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(_moveBlocks[pointer.id].fromBlock !== block){
						this.initBlockFrame(_moveBlocks[pointer.id].fromBlock);
						delete _moveBlocks[pointer.id];
						return;
					}

					if(block.isPureBlock() === false){
						delete _moveBlocks[pointer.id];
						return;
					}
					if (block.isInterrupted === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if (block.isExternalFactors() === false) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(block.isBlockSpicial() === true){
						_soundMatchedCount = 1;
						self.hintTimerStart();
						InGameSpecialBlock.specialBlockOperate(_blocks, i , block.type, this.speicalBlockScoreCallBack);
					}
				}
			}
		}
		this.initBlockFrame(_moveBlocks[pointer.id].fromBlock);
		delete _moveBlocks[pointer.id];
	};
	

	self.initBlockFrame = function(block){
		if(_pivotFlag === true){
			return;
		}
		
		if(block.state === EBlockState.NORMAL && !block.isBlockSpicial()
				&& block.type !== EBlockType.NONE){
			block.setImageFrame(EBlockImage.NORMAL);
		}

	};
	
	self.initAllBlockFrame = function(){
		var length = _blocks.length;
		
		if(_pivotFlag === true){
			return;
		}
		
		for(var i=0;i<length;i++){
			if(_blocks[i].state === EBlockState.NORMAL && !_blocks[i].isBlockSpicial()
					&& _blocks[i].type !== EBlockType.NONE){
				_blocks[i].setImageFrame(EBlockImage.NORMAL);
			}
		}

	};
	
	self.AllBlockClickFrame = function(){
		var length = _blocks.length;
		
		for(var i=0;i<length;i++){
			if(!_blocks[i].isBlockSpicial() || _blocks[i].type !== EBlockType.NONE){
					_blocks[i].setImageFrame(EBlockImage.CLICKED);	
			}
		}

	};
	
	return self;
};