// 얼음 방해 컨트롤러
var InGameInterruptIce = function(inViewContext, inController) {
	
	var self = {
		context: inViewContext,
		controller: inController,
		interruptedQueue: [],
		interruptedList: {}, // {'key': {'list': [], 'count': Number}...}
		interruptedTimer: {}, // {'key': Phaser.Timer}
		interruptedScene: {}
	};
	
	self.init = function () {
		if (interruptedQueue.length > 0) {
			interruptedQueue.splice(0, interruptedQueue.length);	
		}
		Object.keys(self.interruptedList).forEach(function(key) { delete self.interruptedList[key]; });
    	Object.keys(self.interruptedTimer).forEach(function(key) { delete self.interruptedTimer[key]; });
	};
	
	self.addIceInterrupt = function() {
		//var currentCount = inIceCount || 4;
		var currentKey = (new Date()).getTime();
		self.interruptedQueue.push(currentKey);
	};
	
	self.updateInterrupt = function() {
		
		var shiftedList = [];
		
		while (self.interruptedQueue.length > 0) {

			var currentKey = self.interruptedQueue.shift();
			var targetList = self.getInterruptedBlocks();
			if (targetList.length > 0) {
				var isSettable = true;
				for (var targetIndex = targetList.length - 1; targetIndex >= 0; targetIndex--) {
					var currentBlock = self.controller.getBlockByIndex(targetList[targetIndex]);
					
					if (currentBlock.isInterrupted === true || currentBlock.isPureBlock() === false) {
						isSettable = false;
						break;
					}
				}
				
				if (isSettable) {
					self.setInterrupted(currentKey, targetList, function(inRemainCount) {
						//console.log('[InGame] IceInterrupted Remain: ' + inRemainCount);
					});	
				} else {
					shiftedList.push(currentKey);
				}
			}
		}
		
		self.interruptedQueue = shiftedList;
	};
	
	// 특정 인덱스 블럭이 어떤 덩어리에 포함되어 있는지 확인
	self.findKey = function(inIndex) {
    	var keyList = Object.keys(self.interruptedList);
    	for (var index = 0; index < keyList.length; index++) {
    		var currentKey = keyList[index];
    		if (self.interruptedList[currentKey].hasOwnProperty('list') === false
    				|| self.interruptedList[currentKey].hasOwnProperty('count') === false) {
    			continue;
    		}
    		
    		if (self.interruptedList[currentKey].list.indexOf(inIndex) >= 0) {
    			return currentKey;
    		}
    	}
    	return null;
    };
	
    self.removeInterruptedByIndex = function(inIndex) {
    	
    	var keyValue = self.findKey(inIndex);
    	if (keyValue === null) {
    		return;
    	}
    	
    	if (InGameInterruptedConfig.ICE_BREAK_RULE === "breakable-each") {
    		var currentTargetBlock = self.controller.getBlockByIndex(inIndex);
            if (currentTargetBlock) {
            	self.interruptedList[keyValue].list.splice(self.interruptedList[keyValue].list.indexOf(inIndex), 1);
                currentTargetBlock.isInterrupted = false;
            }	
    	} else if (InGameInterruptedConfig.ICE_BREAK_RULE === "breakable") {
    		var keyValue = self.findKey(inIndex);
    		if (keyValue) {
    			self.removeInterruptedByKey(keyValue);
    		}
    	}
    };
    
    self.removeInterruptedByKey = function(inKey) {
    	
    	if (self.interruptedScene.hasOwnProperty(inKey)) {
    		self.interruptedScene[inKey].destroy();
    		delete self.interruptedScene[inKey];
    	}
    	
    	if (self.interruptedTimer.hasOwnProperty(inKey)) {
    		self.controller.viewContext.time.events.remove(self.interruptedTimer[inKey]);
    		delete self.interruptedTimer[inKey];
    	}
    	
    	if (self.interruptedList.hasOwnProperty(inKey)) {
    		var thisList = self.interruptedList[inKey];
    		if (thisList.hasOwnProperty('list') && thisList.hasOwnProperty('count')) {
    			for (var index = thisList.list.length - 1; index >= 0; index--) {
    				var currentBlock = self.controller.getBlockByIndex(thisList.list[index]);
    				if (currentBlock) {
    					currentBlock.isInterrupted = false;
    				}
    			}
    		}
    		thisList = null;
    		delete self.interruptedList[inKey];
    	}
    };
    
    self.setInterrupted = function(inKeyValue, inIndexList, inTimerCallback, inTimerCallbackContext) {

    	var stdBlock = null;
    	for (var targetIndex = inIndexList.length - 1; targetIndex >= 0; targetIndex--) {
    		
    		if (targetIndex === 0) {
    			stdBlock = self.controller.getBlockByIndex(inIndexList[targetIndex]);
    		}
            var currentTargetBlock = self.controller.getBlockByIndex(inIndexList[targetIndex]);
            
            if (currentTargetBlock) {
                currentTargetBlock.isInterrupted = true;
            }
        }
    	
    	if (stdBlock && stdBlock.view) {
    		self.interruptedScene[inKeyValue] = new InterruptIceScene(self.context);
    		self.context.scene.fInterruptIce.add(self.interruptedScene[inKeyValue]);
        	self.interruptedScene[inKeyValue].setCenterPosition(stdBlock.view.world.x + InGameBoardConfig.BLOCK_WIDTH * 1.5, stdBlock.view.world.y + InGameBoardConfig.BLOCK_HEIGHT);
    	}
    	
        self.interruptedList[inKeyValue] = {'list': inIndexList, 'count': InGameInterruptedConfig.ICE_TIME};
        self.interruptedTimer[inKeyValue] = self.controller.viewContext.time.events.loop(Phaser.Timer.SECOND, function(inKey) {
        	
        	// 타이머 세팅 
        	this.interruptedList[inKey].count = this.interruptedList[inKey].count - 1;
        	
        	if (this.interruptedScene.hasOwnProperty(inKey)) {
        		this.interruptedScene[inKey].setIceTimerCount(this.interruptedList[inKey].count);	
        	}
        	
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
        }, self, inKeyValue);
    };
    
    // 방해 대상 블럭 랜덤 선택
    self.getInterruptedBlocks = function (inIndex) {
    	
    	var standardIndex = inIndex || -1;
    	
        var result = [];

        // random으로 대상 블럭을 찾는다.
        if (standardIndex === -1) {
            
        	if (result.length > 0) {
                result.splice(0, result.length);
            }

        	
        	do {
        		var topLeftIndex = StzUtil.createRandomInteger(0, InGameBoardConfig.ROW_COUNT * (InGameBoardConfig.COL_COUNT - 1) - 2);
        	} while(self.controller.indexChecker.checkRightBoundary(topLeftIndex) || self.controller.indexChecker.checkBottomBoundary(topLeftIndex));

        	var topRightIndex = topLeftIndex + self.controller.indexChecker.indexMap.MIDDLE_RIGHT;
            var bottomLeftIndex = topLeftIndex + self.controller.indexChecker.indexMap.BOTTOM_CENTER;
            var bottomRightIndex = topLeftIndex + self.controller.indexChecker.indexMap.BOTTOM_RIGHT;
            
            // 예약 대상 블럭 추출
            result.push(topLeftIndex);
            result.push(topRightIndex);
            result.push(bottomLeftIndex);
            result.push(bottomRightIndex);
            return result;
        } 
        
        // TEST 유저가 마우스 가운데 버튼으로 선택한 특정 인덱스
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
        
        return result;
    };
	return self;
};

//구름 방해 컨트롤러
var InGameInterruptCloud = function(inViewContext, inController) {
	
	var self = {
		context: inViewContext,
		controller: inController,
		interruptedQueue: [],
		interruptedList: {}, // {'key': {'list': [], 'count': Number}...}
		interruptedTimer: {}, // {'key': Phaser.Timer}
		interruptedScene: {}
	};
	
	self.init = function () {
		if (interruptedQueue.length > 0) {
			interruptedQueue.splice(0, interruptedQueue.length);	
		}
		Object.keys(self.interruptedList).forEach(function(key) { delete self.interruptedList[key]; });
    	Object.keys(self.interruptedTimer).forEach(function(key) { delete self.interruptedTimer[key]; });
	};
	
	self.addCloudInterrupt = function() {
		var currentKey = (new Date()).getTime();
		self.interruptedQueue.push(currentKey);
	};
	
	self.updateInterrupt = function() {
		
		var shiftedList = [];
		
		while (self.interruptedQueue.length > 0) {

			var currentKey = self.interruptedQueue.shift();
			
			self.setInterrupted(currentKey, function(inRemainCount) {
				console.log('[InGame] IceInterrupted Remain: ' + inRemainCount);
			});	
		}
		
		self.interruptedQueue = shiftedList;
	};

    self.removeInterruptedByKey = function(inKey) {
    	
    	if (self.interruptedScene.hasOwnProperty(inKey)) {
    		self.interruptedScene[inKey].destroy();
    		delete self.interruptedScene[inKey];
    	}
    	
    	if (self.interruptedTimer.hasOwnProperty(inKey)) {
    		self.controller.viewContext.time.events.remove(self.interruptedTimer[inKey]);
    		delete self.interruptedTimer[inKey];
    	}
    	
    	if (self.interruptedList.hasOwnProperty(inKey)) {
    		delete self.interruptedList[inKey];
    	}
    };
    
    self.setInterrupted = function(inKeyValue, inTimerCallback, inTimerCallbackContext) {
    	//화면 중앙에 구름 생성
    	var boradCenterX = InGameBoardConfig.BOARD_WIDTH/2;
    	var boradCenterY = InGameBoardConfig.BOARD_HEIGHT/2 + InGameBoardConfig.BOARD_Y_OFFSET;
    	
    	self.interruptedScene[inKeyValue] = new interruptCloudScene(self.context);
    	self.context.scene.fInterruptCloud.add(self.interruptedScene[inKeyValue]);
    	self.interruptedScene[inKeyValue].setCenterPosition(boradCenterX, boradCenterY);	
    	
        self.interruptedList[inKeyValue] = {'randomMoveX' :0, 'randomMoveY' :0, 'count': InGameInterruptedConfig.CLOUD_TIME};
        self.interruptedTimer[inKeyValue] = self.controller.viewContext.time.events.loop(20, function(inKey) {
        	//1초 단위로 랜덤으로 이동 좌표 변경
        	if(this.interruptedList[inKey].count%1000 === 0){
        		this.interruptedList[inKey].randomMoveX = StzUtil.createRandomInteger(-3, 3);
        		this.interruptedList[inKey].randomMoveY = StzUtil.createRandomInteger(-3, 3);
        		
        		if (this.interruptedScene.hasOwnProperty(inKey)) {
            		this.interruptedScene[inKey].setCloudTimerCount(this.interruptedList[inKey].count);	
            	}
        	}

        	this.interruptedList[inKey].count = this.interruptedList[inKey].count - 20;
        	
        	self.interruptedScene[inKey].setMovePosition(this.interruptedList[inKey].randomMoveX, this.interruptedList[inKey].randomMoveY);
        	
            if (this.interruptedList[inKey].count <= 0) {
            	this.removeInterruptedByKey(inKey);
            }
        }, self, inKeyValue);	
    };
    
	return self;
};
