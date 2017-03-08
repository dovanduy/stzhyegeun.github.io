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
	// 블럭의 모양을 변경하기 위해 매칭된 블럭의 갯수가 필요하다.
	this.matchedBlocksList = [];
	// 레벨 터치 enabled
	this.levelTouchEnabled = true;
};


Level.prototype.create = function() {
	this.scene = new InGame(this.game);
	
	StzCommon.StzUtil.loadJavascript('js/ingame/BlockModel.js', function() {
		for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
			for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
				
				var blockKind = StzEBlockKind.NORMAL;
				var blockColor = StzCommon.StzUtil.createRandomInteger(Number(StzEBlockColor.MAX));
				//var blockKindType = Math.floor(Math.random() * Number(StzEBlockKindType.NORMAL_COLOR_MAX) + 1);
				this.blockBoardModel[rowIndex][colIndex] = new BlockModel(blockKind, blockColor, StzEBlockKindType.NONE, rowIndex, colIndex);
				
				var targetGroup = this.scene['fBlockBoardRow_' + rowIndex];
				this.blockBoardModel[rowIndex][colIndex].createView(this.game, targetGroup, this.onTouchBlock, this); 
			}
		}
		StzCommon.StzLog.print("[Level] create - blockBoardModel");
		
		
		for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
			for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {

				var checkArray = this.checkMatchesIteration(this.blockBoardModel[rowIndex][colIndex], []);
				if (checkArray != null && checkArray != undefined && checkArray.length > 1) {
					var keyName = rowIndex + "|" + colIndex;
					this.matchedBlocksList[keyName] = checkArray;
				}
			}
		}
		
		console.log(this.matchedBlocksList);
		
		this.updateMatchedBlockImage();
	}, this);
};


Level.prototype.onTouchBlock = function(sprite, pointer, model) {
	if (this.levelTouchEnabled === false) {
		return;
	}
	
	StzCommon.StzLog.print("[Level (onTouchBlock)] touched! row:" + model.block_index.row + " | col: " + model.block_index.col);
	
	var matchedKey = this.isMatchedBlock(model);
	if (matchedKey === false) {
		this.levelTouchEnabled = false;
		
		var bounce = this.game.add.tween(model.view);
		bounce.to({x: model.view.x - 10}, 50, Phaser.Easing.Bounce.InOut, true, 0, 1, true);
		bounce.onComplete.addOnce(function() {
			this.levelTouchEnabled = true;
		}, this);
		
		return;
	}
	
	this.levelTouchEnabled = false;
	for (var blockIndex in this.matchedBlocksList[matchedKey]) {
		var currentModel = this.matchedBlocksList[matchedKey][blockIndex];
		
		if (currentModel.view === null) {
			StzCommon.StzLog.print("[Level (onTouchBlock)] ");
		}
		currentModel.createEmitter(this.game);
		/*
		currentModel.emitter.events.onDestroy.addOnce(function() {
			if (--emitterCount <= 0) {
				this.levelTouchEnabled = true;
			}
		}, this);
		*/
		
		currentModel.block_kind = StzEBlockKind.NONE;
		currentModel.block_color = StzEBlockColor.NONE;
		currentModel.block_type = StzEBlockKindType.NONE;
		currentModel.view.parent.remove(currentModel.view);
		currentModel.view.kill();
		currentModel.view = null;
		currentModel.emitter.start(true, 500, null, 10);
		
		//this.blockBoardModel[model.block_index.row][model.block_index.col] = null;
	}
	this.game.time.events.add(500, function() {
		// 보드 리어레인지
		this.reArrangeBlockBoard();
		
		// 매치 리스트 재생성
		this.matchedBlocksList = [];
		for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
			for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {

				var checkArray = this.checkMatchesIteration(this.blockBoardModel[rowIndex][colIndex], []);
				if (checkArray != null && checkArray != undefined && checkArray.length > 1) {
					var keyName = rowIndex + "|" + colIndex;
					this.matchedBlocksList[keyName] = checkArray;
				}
			}
		}
		this.updateMatchedBlockImage();
		this.levelTouchEnabled = true;
	}, this);
};


Level.prototype.reArrangeBlockBoard = function() {
	for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
		
		// Check All blockmodel data exist in column
		var existBlockCount = 0;
		for (var rowIndex = StzGameConfig.ROW_COUNT - 1; rowIndex >= 0; rowIndex--) {
			var currentBlockModel = this.blockBoardModel[rowIndex][colIndex];
			
			StzCommon.StzLog.assert(currentBlockModel !== undefined, "[Level (reArrangeBlockBoard)] no BlockModel at index (" + rowIndex + ", " + colIndex + ")");
			if (currentBlockModel.view === null) {
				// 블럭이 없는 경우
				
				// Get first exist block model 
				var firstBlockModel = (function() {
					var indexOffset = 1;
					var result = null; 
					do {
						if (rowIndex < indexOffset) {
							break;
						}
						
						StzCommon.StzLog.print("[Level (reArrangeBlockBoard)] get BlockData (" + (rowIndex - indexOffset) + ", " + colIndex + ")");
						result = this.blockBoardModel[rowIndex - indexOffset][colIndex];
						if (result.view === null) {
							indexOffset++;
						} else {
							break;
						}
					} while(rowIndex - indexOffset >= 0);
					
					return result;
				}).call(this);
				
				if (firstBlockModel !== null && firstBlockModel.view !== null) {
					// 위쪽에 블럭이 있는 경우
					
					// 레퍼런스 체인지
					currentBlockModel.block_kind = firstBlockModel.block_kind;
					currentBlockModel.block_color = firstBlockModel.block_color;
					currentBlockModel.block_type = firstBlockModel.block_type;
					
					firstBlockModel.block_kind = StzEBlockKind.NONE;
					firstBlockModel.block_color = StzEBlockColor.NONE;
					firstBlockModel.block_type = StzEBlockKindType.NONE;
					firstBlockModel.view.parent.remove(firstBlockModel.view);
					firstBlockModel.view.kill();
					firstBlockModel.view = null;
					
					var targetGroup = this.scene['fBlockBoardRow_' + currentBlockModel.block_index.row];
					currentBlockModel.createView(this.game, targetGroup, this.onTouchBlock, this);
					//this.blockBoardModel[rowIndex][colIndex].createView(this.game, targetGroup, this.onTouchBlock, this);

					// 소속 그룹 체인지
					//this.scene['fBlockBoardRow_' + currentBlockModel.block_index.row].add(currentBlockModel.view);
				}
			} else {
				// 블럭이 존재하는 경우
				existBlockCount++;
			}
			
		}
		
		// 블럭 재생성
		if (existBlockCount < StzGameConfig.ROW_COUNT) {
			
			for (var newRowIndex = 0; newRowIndex < StzGameConfig.ROW_COUNT; newRowIndex++) {
				var currentBlockModel = this.blockBoardModel[newRowIndex][colIndex];
				
				StzCommon.StzLog.assert(currentBlockModel !== null, "[Level (reArrangeBlockBoard)] currentBlockModel === null : (" + newRowIndex + ", " + colIndex + ")");
				
				if (currentBlockModel.view === null) {
					var blockKind = StzEBlockKind.NORMAL;
					var blockColor = StzCommon.StzUtil.createRandomInteger(Number(StzEBlockColor.MAX));
					var targetGroup = this.scene['fBlockBoardRow_' + newRowIndex];

					this.blockBoardModel[newRowIndex][colIndex].block_kind = blockKind;
					this.blockBoardModel[newRowIndex][colIndex].block_color = blockColor;
					this.blockBoardModel[newRowIndex][colIndex].createView(this.game, targetGroup, this.onTouchBlock, this);
				} 
			}
		}
		
	}
};




/**
 * 현재 블럭의 4방향 다음 한칸의 블럭을 반환
 * 
 * @param inCurrentBlockModel
 * @param inDirection
 * @returns {"model": BlockModel, "view": Phaser.Sprite} 또는 null
 */
Level.prototype.getNextBlock = function(inCurrentBlockModel, inDirection) {
	
	var result = {};
	
	switch (inDirection) {
	
	case "top":
		if (inCurrentBlockModel.block_index.row <= 0) {
			return null;
		}

		return this.blockBoardModel[inCurrentBlockModel.block_index.row - 1][inCurrentBlockModel.block_index.col];
	
	case "bottom":
		if (inCurrentBlockModel.block_index.row >= StzGameConfig.ROW_COUNT - 1) {
			return null;
		}
		
		return this.blockBoardModel[inCurrentBlockModel.block_index.row + 1][inCurrentBlockModel.block_index.col];
	
	case "right":
		if (inCurrentBlockModel.block_index.col >= StzGameConfig.COL_COUNT - 1) {
			return null;
		}
		
		return this.blockBoardModel[inCurrentBlockModel.block_index.row][inCurrentBlockModel.block_index.col + 1];

	case "left":
		if (inCurrentBlockModel.block_index.col <= 0) {
			return null;
		}
		
		return this.blockBoardModel[inCurrentBlockModel.block_index.row][inCurrentBlockModel.block_index.col - 1];
	}

	StzCommon.StzLog.assert(false, "[Level] getNextBlock - Wrong Direction: " + inDirection);
};


/**
 * 매칭된 블럭 정보를 저장한 객체 Level.prototype.matchedBlockList에 선택한 블럭이 포함되어 있는지 검사하는 로직
 * 
 * @param inBlockModel
 * @returns
 */
Level.prototype.isMatchedBlock = function(inBlockModel) {
	
	for (var matchedKey in this.matchedBlocksList) {
		if (this.matchedBlocksList.hasOwnProperty(matchedKey)) {
			if (this.matchedBlocksList[matchedKey].indexOf(inBlockModel) >= 0) {
				return matchedKey;
			}
		}
	}
	
	return false;
};


/**
 * 매칭된 블럭정보 this.matchedBLocksList를 참조하여 특수블럭을 생성할 수 있는 매칭 블럭들의 이미지를 업데이트
 */
Level.prototype.updateMatchedBlockImage = function() {
	for (var matchedKey in this.matchedBlocksList) {
		if (this.matchedBlocksList.hasOwnProperty(matchedKey)) {

			var specialType = "";
			if (this.matchedBlocksList[matchedKey].length >= 10) {
				specialType = StzEBlockKindType.NORMAL_THUNDER;
			} else if (this.matchedBlocksList[matchedKey].length >= 8) {
				specialType = StzEBlockKindType.NORMAL_BOMB;
			} else if (this.matchedBlocksList[matchedKey].length >= 5) {
				specialType = StzEBlockKindType.NORMAL_LINE + "_" + StzCommon.StzUtil.createRandomInteger(1);
			} else {
				specialType = StzEBlockKindType.NONE;
			}
			
			for (var blockIndex in this.matchedBlocksList[matchedKey]) {
				this.matchedBlocksList[matchedKey][blockIndex].block_type = specialType; 
				this.matchedBlocksList[matchedKey][blockIndex].updateView();
			}
		}
	}
};


Level.prototype.checkMatchesIteration = function (inBlockModel, inArray) {

	var currentSearchModel = inBlockModel;
	var searchCandidates = [];
	
	if (inArray.indexOf(currentSearchModel) < 0) {
		inArray.push(currentSearchModel);
	}
	
	do {
	
		if (this.isMatchedBlock(currentSearchModel) !== false) {
			
			if (searchCandidates.length <= 0) {
				break;
			} 
			currentSearchModel = searchCandidates.shift();
			continue;
		}
	
		var nextTopBlock = this.getNextBlock(currentSearchModel, "top");
		var nextBottomBlock = this.getNextBlock(currentSearchModel, "bottom");
		var nextLeftBlock = this.getNextBlock(currentSearchModel, "left");
		var nextRightBlock = this.getNextBlock(currentSearchModel, "right");
		
		if (nextTopBlock != null
				&& inArray.indexOf(nextTopBlock) < 0 
				&& nextTopBlock.block_color == currentSearchModel.block_color) {
			inArray.push(nextTopBlock);
			searchCandidates.push(nextTopBlock);
		}
		
		if (nextBottomBlock != null
				&& inArray.indexOf(nextBottomBlock) < 0
				&& nextBottomBlock.block_color == currentSearchModel.block_color) {
			inArray.push(nextBottomBlock);
			searchCandidates.push(nextBottomBlock);
		} 
		
		if (nextLeftBlock != null
				&& inArray.indexOf(nextLeftBlock) < 0
				&& nextLeftBlock.block_color == currentSearchModel.block_color) {
			inArray.push(nextLeftBlock);
			searchCandidates.push(nextLeftBlock);
		} 
		
		if (nextRightBlock != null
				&& inArray.indexOf(nextRightBlock) < 0
				&& nextRightBlock.block_color == currentSearchModel.block_color) {
			inArray.push(nextRightBlock);
			searchCandidates.push(nextRightBlock);
		} 
		
		if (searchCandidates.length <= 0) {
			break;
		} 
		
		currentSearchModel = searchCandidates.shift();
		
	} while (true);
	
	return inArray;
}

/**
 * 재귀를 통해 연결된 같은 타입 블럭 모델의 배열을 반환하는 함수
 * Stack Overflow 발생함... ㅜㅜ
 * 
 * @param inBlockModel
 * @param inArray
 * @returns
 */
Level.prototype.checkMatches = function(inBlockModel, inArray) {
	
	if (this.isMatchedBlock(inBlockModel) !== false) {
		// recursion end condition
		return inArray;
	}
	
	if (inArray.indexOf(inBlockModel) < 0) {
		inArray.push(inBlockModel);
	} 
	
	var nextTopBlock = this.getNextBlock(inBlockModel, "top");
	var nextBottomBlock = this.getNextBlock(inBlockModel, "bottom");
	var nextLeftBlock = this.getNextBlock(inBlockModel, "left");
	var nextRightBlock = this.getNextBlock(inBlockModel, "right");
	
	if (nextTopBlock != null && nextTopBlock.model.block_color == inBlockModel.block_color) {
		return this.checkMatches(nextTopBlock.model, inArray);
	}
	
	if (nextBottomBlock != null && nextBottomBlock.model.block_color == inBlockModel.block_color) {
		return this.checkMatches(nextBottomBlock.model, inArray);
	} 
	
	if (nextLeftBlock != null && nextLeftBlock.model.block_color == inBlockModel.block_color) {
		return this.checkMatches(nextLeftBlock.model, inArray);
	} 
	
	if (nextRightBlock != null && nextRightBlock.model.block_color == inBlockModel.block_color) {
		return this.checkMatches(nextRightBlock.model, inArray);
	} 

	// recursion end condition
	return inArray;
};
