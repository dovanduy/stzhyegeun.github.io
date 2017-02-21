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
};

Level.prototype.onTouchBlock = function(sprite, pointer, model) {
	StzCommon.StzLog.print("[Level (onTouchBlock)] touched! row:" + model.block_index.row + " | col: " + model.block_index.col);
	
	var matchedKey = this.isMatchedBlock(model);
	if (matchedKey === false) {
		return;
	}
	
	for (var blockIndex in this.matchedBlocksList[matchedKey]) {
		this.matchedBlocksList[matchedKey][blockIndex].view.kill();
		this.blockBoardModel[model.block_index.row][model.block_index.col] = null;
	}
};

Level.prototype.create = function() {
	this.scene = new InGame(this.game);
	
	StzCommon.StzUtil.loadJavascript('js/ingame/BlockModel.js', function() {
		for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
			for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
				
				var blockKind = StzEBlockKind.NORMAL;
				var blockKindType = StzCommon.StzUtil.createRandomInteger(Number(StzEBlockKindType.NORMAL_COLOR_MAX));
				//var blockKindType = Math.floor(Math.random() * Number(StzEBlockKindType.NORMAL_COLOR_MAX) + 1);
				this.blockBoardModel[rowIndex][colIndex] = new BlockModel(blockKind, blockKindType, rowIndex, colIndex);
				
				var targetGroup = this.scene['fBlockBoardRow_' + rowIndex];
				this.blockBoardModel[rowIndex][colIndex].view = this.blockBoardModel[rowIndex][colIndex].createView(this.game, targetGroup, this.onTouchBlock, this); 
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
			}
			
			if (specialType !== "") {
				for (var blockIndex in this.matchedBlocksList[matchedKey]) {
					this.matchedBlocksList[matchedKey][blockIndex].block_type = this.matchedBlocksList[matchedKey][blockIndex].block_type + "_" + specialType; 
					this.matchedBlocksList[matchedKey][blockIndex].updateView();
				}
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
				&& nextTopBlock.block_type == currentSearchModel.block_type) {
			inArray.push(nextTopBlock);
			searchCandidates.push(nextTopBlock);
		}
		
		if (nextBottomBlock != null
				&& inArray.indexOf(nextBottomBlock) < 0
				&& nextBottomBlock.block_type == currentSearchModel.block_type) {
			inArray.push(nextBottomBlock);
			searchCandidates.push(nextBottomBlock);
		} 
		
		if (nextLeftBlock != null
				&& inArray.indexOf(nextLeftBlock) < 0
				&& nextLeftBlock.block_type == currentSearchModel.block_type) {
			inArray.push(nextLeftBlock);
			searchCandidates.push(nextLeftBlock);
		} 
		
		if (nextRightBlock != null
				&& inArray.indexOf(nextRightBlock) < 0
				&& nextRightBlock.block_type == currentSearchModel.block_type) {
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
	
	if (nextTopBlock != null && nextTopBlock.model.block_type == inBlockModel.block_type) {
		return this.checkMatches(nextTopBlock.model, inArray);
	}
	
	if (nextBottomBlock != null && nextBottomBlock.model.block_type == inBlockModel.block_type) {
		return this.checkMatches(nextBottomBlock.model, inArray);
	} 
	
	if (nextLeftBlock != null && nextLeftBlock.model.block_type == inBlockModel.block_type) {
		return this.checkMatches(nextLeftBlock.model, inArray);
	} 
	
	if (nextRightBlock != null && nextRightBlock.model.block_type == inBlockModel.block_type) {
		return this.checkMatches(nextRightBlock.model, inArray);
	} 

	// recursion end condition
	return inArray;
};
