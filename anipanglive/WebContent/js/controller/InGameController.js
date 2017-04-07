
var EControllerState = {
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
	var _state = EControllerState.USER_TURN;
	var _moveBlocks = [];
	//var _mouseFlag = false;
	var _controlFlag = true;

	var _scoreData = inViewContext.scoreData;

	var _hintTimer = null;
	var _hitIndex = null;

	//피벗
	var _pivotFlag = false;
	
	//난이도 증가 데이터 (0~15->0  15 ~끝까지 ->1)
	var _levelCount = 0;
	
	// 인덱스 체커
	var tweenBombAroundList = {
		'TOP_LEFT': { x: -1 * InGameBoardConfig.BLOCK_WIDTH / 2, y: -1 * InGameBoardConfig.BLOCK_HEIGHT / 2},
		'TOP_CENTER': { x: 0, y: -1 * InGameBoardConfig.BLOCK_HEIGHT / 2},
		'TOP_RIGHT': { x: InGameBoardConfig.BLOCK_WIDTH / 2, y: -1 * InGameBoardConfig.BLOCK_HEIGHT / 2 },
		'MIDDLE_LEFT': { x: -1 * InGameBoardConfig.BLOCK_WIDTH / 2, y: 0 },
		'MIDDLE_RIGHT': { x: InGameBoardConfig.BLOCK_WIDTH / 2, y: 0 },
		'BOTTOM_LEFT': { x: -1 * InGameBoardConfig.BLOCK_WIDTH / 2, y: InGameBoardConfig.BLOCK_HEIGHT / 2 },
		'BOTTOM_CENTER': {x: 0, y: InGameBoardConfig.BLOCK_HEIGHT / 2 },
		'BOTTOM_RIGHT': {x: InGameBoardConfig.BLOCK_WIDTH / 2, y: InGameBoardConfig.BLOCK_HEIGHT / 2}
	};

	var indexChecker = {
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
		viewContext: inViewContext
	};

	self.setLevelUP = function(){
		_levelCount++;
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
	
	self.getPivotFlag= function(){
		return _pivotFlag;
	};
	
	self.hintTimerStart = function(){
		if(_hintTimer !== null){
			self.viewContext.time.events.remove(_hintTimer);
			_hintTimer = null;
		}

		if(_hitIndex !== null){
			_blocks[_hitIndex].isHintOn = false;
			_hitIndex = null;
		}
		
		_hintTimer = self.viewContext.time.events.add(4000, function(){
			self.viewContext.time.events.remove(_hintTimer);
			_hitIndex = self.searchHintBlock();
			
			if(_hitIndex !== null){
				if(_blocks[_hitIndex] !== undefined && _blocks[_hitIndex] !== null 
					&& _blocks[_hitIndex].view !== undefined && _blocks[_hitIndex].view !== null){
					_blocks[_hitIndex].isHintOn = true;
				}
			}
		});
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
	self.speicalBlockScoreCallBack = function(removeBlockCount, index) {
		if(removeBlockCount <= 0){
			return;
		}
		
		_scoreData.setScore(removeBlockCount, true);	
		self.viewContext.createScoreText(_blocks[index].view.world.x, _blocks[index].view.world.y, removeBlockCount);
		self.viewContext.createComboText(_blocks[index]);
	};
	
	/**
	 * 초기 인게임 블럭 생성
	 */
	self.initBoard = function() {
		
		for (var index = 0; index < _blocks.length; index++) {
			
			var randomType = StzUtil.createRandomInteger(0, 4);
			_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext, this.speicalBlockCallBack.bind(this));
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
		
		for (var index = 0; index < _blocks.length; index++) {
			if (_blocks[index] === null) {
				continue;
			}
			_blocks[index].updateView();
		}
		
		if(_state !== EControllerState.LASTPANG_TURN && _state !== EControllerState.GAME_END ){
			var machedArray = this.getMouseMoveMatched();
			var specialArray = this.getSpecialArray();
			
			var length = machedArray.length;
			if(this.isMouseMoveMatchedCheckSlidingEnd(machedArray) === true && this.isMouseMoveMatchedCheckSlidingEnd(specialArray) ){

				if(length >= StzGameConfig.MATCH_MIN){
						self.hintTimerStart();
						self.viewContext.time.events.add(100, function(){
							StzSoundList[ESoundName.SE_MATCH + StzUtil.createRandomInteger(1,3)].play();
						});
						
						if(_pivotFlag === true){
							for(var i=0;i<length;i++){
								machedArray[i].setBlockState(EBlockState.REMOVE_ANIM);
								machedArray[i].isTwoMatched = false;
							}
							self.viewContext.createScoreText(_blocks[machedArray[0].spicialCreatePosIndex].view.world.x, _blocks[machedArray[0].spicialCreatePosIndex].view.world.y, length);
						}
						else{
							var devideBlocks = this.devideBlock(machedArray);
							
							var devideLength = devideBlocks.length;
							for(var i=0;i<devideLength;i++){
								this.checkAndCreateSpecialBlock(devideBlocks[i]);
							}
						}
							
						self.viewContext.bombRemainCount-= 1*length;
						self.viewContext.updateBombGauge();
						_scoreData.setScore(length, true);	
				}
	
				if(specialArray.length === 1){
					self.hintTimerStart();
					InGameSpecialBlock.specialBlockOperate(_blocks, specialArray[0].index, specialArray[0].type, this.speicalBlockScoreCallBack);
					specialArray[0].isTwoMatched = false;
				}
				else{
					for(var i =0; i< specialArray.length;i++){
						specialArray[i].isTwoMatched = false;
					}
				}
			}
		}

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
				self.viewContext.time.events.add(100, function(){
					StzSoundList[ESoundName.SE_MATCH + StzUtil.createRandomInteger(1,3)].play();
				});
				 self.viewContext.bombRemainCount-= 1*currentDropMatchedCount;
				 self.viewContext.updateBombGauge();
				_scoreData.setScore(currentDropMatchedCount, false);	
			}
		}
		else if(_state === EControllerState.ANIM_TURN){
			if(this.checkAnim() === true){
				//StzLog.print("애니매이션 체크");
				_state = EControllerState.USER_TURN;
			}
		}

		else if(_state === EControllerState.LASTPANG_TURN){
			
			var specialBlockIndex = -1;
			var lastPangMachedCount = 0;
			if(this.checkNormal() === true){
				lastPangMachedCount = this.checkMatched(false, function() {}.bind(this));
				
				if(lastPangMachedCount === 0){
					specialBlockIndex = this.getSpecialBlockIndex();
					
                    if(specialBlockIndex !== -1){
                    	InGameSpecialBlock.specialBlockOperate(_blocks, _blocks[specialBlockIndex].index, _blocks[specialBlockIndex].type, this.speicalBlockScoreCallBack);
                    }
				}
				else if (lastPangMachedCount > 0) {
					self.viewContext.time.events.add(100, function(){
						StzSoundList[ESoundName.SE_MATCH + StzUtil.createRandomInteger(1,3)].play();
					});

					_scoreData.setScore(lastPangMachedCount, false);	
				}
			
			}

			if(this.checkNormal() === true){
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
				self.viewContext.stopControllGame();
			}
		}
		
		//블럭 드랍과 리필 로직은 스테이트와 상관없이 동작 (라스트팡, 폭탄 상태때는 작동하지 않음)
		if( this.isDroping() === false&& _state !== EControllerState.LASTPANG_TURN && _state !== EControllerState.GAME_END){
			if(this.dropBlocks() === true){
				this.refillBoard(true);
				
				if(_pivotFlag === true){
					this.AllBlockClickFrame();
				}
				
			}	
		}
		
	};
	
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
			//debugger;
			_blocks[index].returnFlag = false;
			 _blocks[preIndex].returnFlag = false;
			 
			 return;
		}
		
		if(_blocks[index].isTwoMatched === true || _blocks[preIndex].isTwoMatched === true){
			//debugger;
			_blocks[index].isTwoMatched = false;
			_blocks[preIndex].isTwoMatched = false;
			
			return;
		}
		
		if(_blocks[index].isInterrupted === true || _blocks[preIndex].isInterrupted === true){
			//debugger;
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
		
		_blocks[index].setBlockState(EBlockState.NORMAL);
		_blocks[preIndex].setBlockState(EBlockState.NORMAL);
		
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
	 * 손으로 이동 후 매치된 불럭 체크
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
	 * 현재 블럭 중 스페셜 블럭 배열 불러옴
	 */
	self.getSpecialArray = function(){
		var specialArray = [];
		for (var index = 0; index < _blocks.length; index ++) {
			//블럭의 이동 속도를 체크하여 이 블록이 어느 이동이였는지 체크
			if (_blocks[index].isTwoMatched === true && _blocks[index].isBlockSpicial()) {
				specialArray.push(_blocks[index]);
			}
		}	
		return specialArray;
	};
	
	/**
	 * 현재 블럭의 가장 상단의 인덱스를 리턴
	 */
	self.getSpecialBlockIndex = function(){
		for (var index = 0; index < _blocks.length; index ++) {
			//블럭의 이동 속도를 체크하여 이 블록이 어느 이동이였는지 체크
			if (_blocks[index].isBlockSpicial()) {
				return index;
			}
		}	
		return -1;
	};
	
	/**
	 * 매치된 블럭을 타입별로 나눔
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
	self.checkAndCreateSpecialBlock = function(machedBlocks){
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
		self.viewContext.createScoreText(_blocks[spicialCreatePosIndex].view.world.x, _blocks[spicialCreatePosIndex].view.world.y, machedBlocks.length);
	};
	/**
	 * 모든 블럭들이 슬라이드 여부가 끝난는지 체크
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
			//블럭의 이동 속도를 체크하여 이 블록이 어느 이동이였는지 체크
			if(_blocks[index].slidVelocity === ESlideVelocity.BLOCK_RETRUN || _blocks[index] === ESlideVelocity.BLOCK_MOVE){
				continue;
			}
			
			if (_blocks[index].isTwoMatched === true) {
				continue;
			}
			
			// NOTE @hyegeun 얼음 방해 : 방해가 있는 경우 블럭 모델이나 뷰가 없을 수도 있다.
			if (!_blocks[index] || !_blocks[index].view) {
				continue;
			}
			
			// NOTE @hyegeun 얼음 방해 : 방해가 있는 경우 슬라이드 여부 체크 스킵
			if (_blocks[index].isInterrupted) {
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
	 */
	self.checkNormal = function(){
		for (var index = 0; index < _blocks.length; index ++) {
		
			if (_blocks[index].isTwoMatched === true) {
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
	

	// 새로운 블럭을 리필할 때, 현재 보드 상에 있는 블럭들 중 매치될 수 있는 것이 있는 지 확인하는 함수
	self.isOneMoveCheckMatched = function() {
		
		var length = _blocks.length;
		var movePos = [1, -1, (1*InGameBoardConfig.ROW_COUNT), -(1*InGameBoardConfig.ROW_COUNT)];
		for(var i =0; i < length; i++)
		{
			var movePosLength = movePos.length;
			
			for(var j =0; j < movePosLength; j++){
				if(i+movePos[j] <= 0 || i+movePos[j] > length){
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
					
					block.type = curType;
					_blocks[i].type = preType;
					
					var countUp = this.countSameTypeBlock(block, 0, -1);
					var countDown = this.countSameTypeBlock(block, 0, 1);
					var countLeft = this.countSameTypeBlock(block, -1, 0);
					var countRight = this.countSameTypeBlock(block, 1, 0);
					
					var countHoriz = countLeft + countRight + 1;
					var countVert = countUp + countDown + 1;
					
					block.type = preType;
					_blocks[i].type = curType;
					
					if (countVert >= StzGameConfig.MATCH_MIN)
					{
						return true;
					}

					if (countHoriz >= StzGameConfig.MATCH_MIN)
					{
						return true;
					}	
				}
			}
		}
		return false;
	};
	
	/**
	 * 전체 인게임 보드에서 매칭된 블럭 체크
	 */
	self.searchHintBlock = function() {
		
		var length = _blocks.length;
		var movePos = [1, -1, (1*InGameBoardConfig.ROW_COUNT), -(1*InGameBoardConfig.ROW_COUNT)];
		for(var i =0; i < length; i++)
		{
			var movePosLength = movePos.length;
			
			for(var j =0; j < movePosLength; j++){
				if(i+movePos[j] <= 0 || i+movePos[j] > length){
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
				
				if( block != null && block.view != null && block.state === EBlockState.NORMAL)
				{
					var curType =  _blocks[i].type;
					var preType = _blocks[i+movePos[j]].type;
					
					block.type = curType;
					_blocks[i].type = preType;
					
					var countUp = this.countSameTypeBlock(block, 0, -1);
					var countDown = this.countSameTypeBlock(block, 0, 1);
					var countLeft = this.countSameTypeBlock(block, -1, 0);
					var countRight = this.countSameTypeBlock(block, 1, 0);
					
					var countHoriz = countLeft + countRight + 1;
					var countVert = countUp + countDown + 1;
					
					block.type = preType;
					_blocks[i].type = curType;
					
					if (countVert >= StzGameConfig.MATCH_MIN)
					{
						return i;
					}

					if (countHoriz >= StzGameConfig.MATCH_MIN)
					{
						return i;
					}	
				}
			}
		}
		return null;
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
					
					matctedTempArray = StzUtil.sumArrays(matctedTempArray, this.killBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown));
				}

				if (countHoriz >= StzGameConfig.MATCH_MIN)
				{
					if(removeFlag === true){
						return 1;
					}
					
					matctedTempArray = StzUtil.sumArrays(matctedTempArray, this.killBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY));
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
			this.checkAndCreateSpecialBlock(devideBlocks[i]);
			mactedCount += devideBlocks[i].length;
		}
		
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
       
        if( self.viewContext.bombRemainCount < 0 && removeFlag === false){
        	 self.viewContext.bombRemainCount = 0;
        	 self.viewContext.updateBombGauge();
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
	    	machedVertBlocks = this.twoBlockSwapkillBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, _pivotFlag, mactedBlocks);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	machedHorizBlocks = this.twoBlockSwapkillBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, _pivotFlag, mactedBlocks);
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
	    	machedVertBlocks = this.twoBlockSwapkillBlockRange(block.posX, block.posY - countUp, block.posX, block.posY + countDown, _pivotFlag);
	    }

	    if (countHoriz >= StzGameConfig.MATCH_MIN)
	    {
	    	machedHorizBlocks = this.twoBlockSwapkillBlockRange(block.posX - countLeft, block.posY, block.posX + countRight, block.posY, _pivotFlag);
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
	self.countSameTypeBlock = function(startBlock, moveX, moveY) {
		var curX = startBlock.posX + moveX;
		var curY = startBlock.posY + moveY;
		var count = 0;

		
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
			
			count++;
		    curX += moveX;
		    curY += moveY;
		}

		return count;
	};
	
	/**
	 * 제거 범위를 매게변수로 입력 받아서 블럭 상태를 제거 상태로 만드는 로직
	 */
	self.killBlockRange = function(from_X, from_Y, to_X, to_Y) {
		
		var fromX = Phaser.Math.clamp(from_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var fromY = Phaser.Math.clamp(from_Y , 0, InGameBoardConfig.ROW_COUNT - 1);
	    var toX = Phaser.Math.clamp(to_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var toY = Phaser.Math.clamp(to_Y, 0, InGameBoardConfig.ROW_COUNT - 1);

	    var mactedArray = [];
	
	    for (var i = fromX; i <= toX; i++)
	    {
	        for (var j = fromY; j <= toY; j++)
	        {
	            var block =  this.getBlock(i, j);
	            if(block === undefined || block === null || block.isBlockSpicial()) {
	            	continue;
	            }  
	            mactedArray.push(block);
		   }

	    }
	    return mactedArray;
	};
	
	/**
	 * 제거 범위를 매게변수로 입력 받아서 블럭 상태를 제거 상태로 만드는 로직
	 */
	self.twoBlockSwapkillBlockRange = function(from_X, from_Y, to_X, to_Y, pivot_Flag) {
		
		var fromX = Phaser.Math.clamp(from_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var fromY = Phaser.Math.clamp(from_Y , 0, InGameBoardConfig.ROW_COUNT - 1);
	    var toX = Phaser.Math.clamp(to_X, 0, InGameBoardConfig.COL_COUNT - 1);
	    var toY = Phaser.Math.clamp(to_Y, 0, InGameBoardConfig.ROW_COUNT - 1);
	    var pivotFlag = false;
	    var machedBlocks = [];
	    
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
	            if(block === undefined || block === null || block.isBlockSpicial()) {
	            	continue;
	            }  
	            
	    	    if(pivotFlag === true){
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
	 * 피벗 모드일 경우 블럭 떨어 뜨리는 로직
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
	            	
	            	_blocks[index] = new BlockModel(EBlockType.list[randomType], index, self.viewContext, this.speicalBlockCallBack);
					_blocks[index].createView(Math.floor(index / InGameBoardConfig.COL_COUNT));
					refillBlocks.push(_blocks[index]);
				
	            }
	        }
	    }

		if(checkFlag === true && this.isOneMoveCheckMatched() === false){
			for (var index = 0; index < refillBlocks.length; index++) {
				refillBlocks[index].destroy();
			}
			this.refillBoard(true);
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
					
					if( block.returnFlag === true){
						block.returnFlag = false;
	  	            	return;
	  	            }
					
					if (block.isInterrupted === true) {
					    return;
					}

					if(block.isMoveAndMatch === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
			
					if(block.isDrop === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if(block.isTwoMatched === true) {
						delete _moveBlocks[pointer.id];
						return;
					}
					
					if( _moveBlocks[pointer.id].fromBlock.view === undefined  || _moveBlocks[pointer.id].fromBlock.view === null ||_moveBlocks[pointer.id].fromBlock.view.getBounds() === block.view.getBounds()) {
						return;
					}
					
					if(Math.abs(_moveBlocks[pointer.id].fromBlock.posX - block.posX) === 1){
						if(Math.abs(_moveBlocks[pointer.id].fromBlock.posY - block.posY) === 0){
							hitFlag = true;
							_moveBlocks[pointer.id].toBlock = block;

							//this.controlFlag(false);
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
									//machedBlocks[i].isMoveAndMatch = true;	
									machedBlocks[i].isTwoMatched = true;
									
								}
								
								this.dropBlocksTempCheck();	
								
								if (machedBlocks.indexOf(_moveBlocks[pointer.id].fromBlock) < 0) {
									this.viewContext.createComboText(_moveBlocks[pointer.id].fromBlock);	
								} else {
									this.viewContext.createComboText(_moveBlocks[pointer.id].toBlock);
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
										//_moveBlocks[pointer.id].fromBlock.isMoveAndMatch = true;
										//_moveBlocks[pointer.id].toBlock.isMoveAndMatch = true;
								}

								delete _moveBlocks[pointer.id];
							}
							else{
					
								StzSoundList[ESoundName.SE_BLOCK_SWITCH].play();
								var length = machedBlocks.length;
								for(var i=0;i<length;i++){
									//machedBlocks[i].isMoveAndMatch = true;	
									machedBlocks[i].isTwoMatched = true;			
								}
								
								this.dropBlocksTempCheck();	
								
								if (machedBlocks.indexOf(_moveBlocks[pointer.id].fromBlock) < 0) {
									this.viewContext.createComboText(_moveBlocks[pointer.id].fromBlock);	
								} else {
									this.viewContext.createComboText(_moveBlocks[pointer.id].toBlock);
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
					// NOTE @hyegeun 얼음 방해 : 테스트 코드
					if (pointer.middleButton.isDown) {
						
						var targetInterruptList = this.interruptedIce.getInterruptedBlocks(block.index);
						this.interruptedIce.setInterrupted(targetInterruptList, true, function(inRemainCount) {
							console.log('[InGameController] IceInterrupted Remain: ' + inRemainCount);
						}, this);
						
//						if (targetInterruptList.length === 4) {
//							for (var targetIndex = targetInterruptList.length - 1; targetIndex >= 0; targetIndex--) {
//					            var currentTargetBlock = this.getBlockByIndex(targetInterruptList[targetIndex]);
//					            if (currentTargetBlock) {
//					                currentTargetBlock.isInterrupted = !currentTargetBlock.isInterrupted;
//					                if (currentTargetBlock.isInterrupted === false) {
//					                	var arrayIndex = this.interruptedIce.interruptedList.indexOf(currentTargetBlock.index);
//					                	if (arrayIndex >= 0) {
//					                		this.interruptedIce.interruptedList.splice(arrayIndex, 1);
//					                	}
//					                }
//					            }
//					        }
//						}
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
		if(_moveBlocks[pointer.id] !== undefined && _moveBlocks[pointer.id] !== null){
			if(_moveBlocks[pointer.id].fromBlock !== undefined && _moveBlocks[pointer.id].fromBlock !== null){
				this.initBlockFrame(_moveBlocks[pointer.id].fromBlock);
			}
			
			if(_moveBlocks[pointer.id].toBlock !== undefined && _moveBlocks[pointer.id].toBlock !== null){
				this.initBlockFrame(_moveBlocks[pointer.id].toBlock);
			}

			delete _moveBlocks[pointer.id];
		}
		
		var length = _blocks.length;
		var hitPoint = new Phaser.Rectangle(pointer.x, pointer.y, 2, 2);
		
		for(var i=0;i<length;i++){
			var block = _blocks[i];

			if(block !== undefined && block !== null && block.view !== undefined && block.view !== null && block.state === EBlockState.NORMAL){
				if(Phaser.Rectangle.intersects(hitPoint, block.view.getBounds())){
					if(block.isBlockSpicial() === true){
						self.hintTimerStart();
						InGameSpecialBlock.specialBlockOperate(_blocks, i , block.type, this.speicalBlockScoreCallBack);
					}
				}
			}
		}
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
			if(!_blocks[i].isBlockSpicial() && _blocks[i].type !== EBlockType.NONE){
					_blocks[i].setImageFrame(EBlockImage.CLICKED);	
			}
		}

	};
	
    // 얼음 방해 모듈
	self.interruptedIce = (function(inController) {
	    var iceModule = {};
            
	    iceModule.interruptedList = {};
	    iceModule.interruptedTimer = {};
	    
	    iceModule.IS_BREAKABLE = false;

	    iceModule.init = function () {
	    	Object.keys(iceModule.interruptedList).forEach(function(key) { delete iceModule.interruptedList[key]; });
	    	Object.keys(iceModule.interruptedTimer).forEach(function(key) { delete iceModule.interruptedTimer[key]; });
	    };

	    iceModule.findKey = function(inIndex) {
	    	var keyList = Object.keys(iceModule.interruptedList);
	    	for (var index = 0; index < keyList.length; index++) {
	    		var currentKey = keyList[index];
	    		if (iceModule.interruptedList[currentKey].hasOwnProperty('list') === false
	    				|| iceModule.interruptedList[currentKey].hasOwnProperty('count') === false) {
	    			continue;
	    		}
	    		
	    		if (iceModule.interruptedList[currentKey].list.indexOf(inIndex) >= 0) {
	    			return currentKey;
	    		}
	    	}
	    	return null;
	    };
	    
	    iceModule.removeInterruptedByKey = function(inKey) {
	    	if (iceModule.interruptedTimer.hasOwnProperty(inKey)) {
	    		var thisTimer = iceModule.interruptedTimer[inKey];
	    		inController.viewContext.time.events.remove(thisTimer);
	    		delete iceModule.interruptedTimer[inKey];
	    	}
	    	
	    	if (iceModule.interruptedList.hasOwnProperty(inKey)) {
	    		var thisList = iceModule.interruptedList[inKey];
	    		if (thisList.hasOwnProperty('list') && thisList.hasOwnProperty('count')) {
	    			for (var index = thisList.list.length - 1; index >= 0; index--) {
	    				var currentBlock = inController.getBlockByIndex(thisList.list[index]);
	    				if (currentBlock) {
	    					currentBlock.isInterrupted = false;
	    				}
	    			}
	    		}
	    		delete iceModule.interruptedList[inKey];
	    	}
	    };
	    
	    iceModule.setInterrupted = function(inIndexList, inValue, inTimerCallback, inTimerCallbackContext) {
	    	
	    	for (var targetIndex = inIndexList.length - 1; targetIndex >= 0; targetIndex--) {
	            var currentTargetBlock = inController.getBlockByIndex(inIndexList[targetIndex]);
	            if (currentTargetBlock) {
	                currentTargetBlock.isInterrupted = inValue;
	            }
	        }
	    	
	    	if (inValue === true) {
	    		var currentDate = (new Date()).getTime();
		        iceModule.interruptedList[currentDate] = {'list': inIndexList, 'count': InGameInterruptedConfig.ICE_TIME};
		        iceModule.interruptedTimer[currentDate] = inController.viewContext.time.events.loop(Phaser.Timer.SECOND, function(inKey) {
		        	
		        	// 타이머 세팅 
		        	this.interruptedList[inKey].count = this.interruptedList[inKey].count - 1;
		        	
		        	if (inTimerCallback) {
		        		if (inTimerCallbackContext) {
		        			inTimerCallback.call(inTimerCallbackContext, this.interruptedList[inKey].count);	
		        		} else {
		        			inTimerCallback(this.interruptedList[inKey].count);
		        		}
		        	}
		        	
		        	if (this.interruptedList[inKey].count <= 0) {
		        		this.removeInterruptedByKey(inKey);
		        	}
		        }, iceModule, currentDate);
	    	}
	    };
	    
	    // 방해 대상 블럭 랜덤 선택
	    iceModule.getInterruptedBlocks = function (inIndex) {
	    	
	    	var standardIndex = inIndex || -1;
	    	
	        var result = [];

	        if (standardIndex === -1) {
	        	do {
		            if (result.length > 0) {
		                result.splice(0, result.length);
		            }

		            var topLeftIndex = StzUtil.createRandomInteger(0, InGameBoardConfig.ROW_COUNT * (InGameBoardConfig.COL_COUNT - 1) - 2);
		            
		            if (indexChecker.checkRightBoundary(topLeftIndex)
		            	|| indexChecker.checkBottomBoundary(topLeftIndex)) {
		            	continue;
	            	}
		            
		            var topRightIndex = topLeftIndex + indexChecker.indexMap.MIDDLE_RIGHT;
		            var bottomLeftIndex = topLeftIndex + indexChecker.indexMap.BOTTOM_CENTER;
		            var bottomRightIndex = topLeftIndex + indexChecker.indexMap.BOTTOM_RIGHT;
		            
		            if (inController.getBlockByIndex(topLeftIndex).isInterrupted === true
		            		|| inController.getBlockByIndex(topRightIndex).isInterrupted === true
		            		|| inController.getBlockByIndex(bottomLeftIndex).isInterrupted === true
		            		|| inController.getBlockByIndex(bottomRightIndex).isInterrupted === true) {
		            	continue;
		            }
		            
		            if (inController.getBlockByIndex(topLeftIndex).isPureBlock() === false
		            		|| inController.getBlockByIndex(topRightIndex).isPureBlock() === false
		            		|| inController.getBlockByIndex(bottomLeftIndex).isPureBlock() === false
		            		|| inController.getBlockByIndex(bottomRightIndex).isPureBlock() === false) {
		            	continue;
		            }
		            
		            result.push(topLeftIndex);
		            result.push(topRightIndex);
		            result.push(bottomLeftIndex);
		            result.push(bottomRightIndex);
		            break;
		        } while (true);
	        } else {
	        	if (indexChecker.checkRightBoundary(standardIndex)) {
	        		return [];
	        	}
	        	
	        	if (indexChecker.checkBottomBoundary(standardIndex)) {
	        		return [];
	        	}
	        	
	        	result.push(standardIndex);
	        	result.push(standardIndex + indexChecker.indexMap.MIDDLE_RIGHT);
	            result.push(standardIndex + indexChecker.indexMap.BOTTOM_CENTER);
	            result.push(standardIndex + indexChecker.indexMap.BOTTOM_RIGHT);
	        }
	        
	        return result;
        };

	    return iceModule;
	})(self);

	return self;
};