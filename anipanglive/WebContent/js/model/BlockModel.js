var EBlockType = {
	NONE: "",
	ARI: "ari", 
	BLUE: "blue", 
	LUCY: "lucy", 
	MAO: "mao", 
	MICKY: "micky", 
	MONGYI: "mongyi", 
	PINKY: "pinky", 
};
EBlockType.list = [EBlockType.BLUE, EBlockType.MICKY, EBlockType.MONGYI, EBlockType.PINKY, EBlockType.LUCY, EBlockType.ARI, EBlockType.MAO]


var EBlockSpType = {
	NORMAL: 1, 
	SP_LINE: 2, 
	SP_CIRCLE: 3, 
	SELECTED: 4, 
	MATCHED: 5, 
};
EBlockSpType.list = [EBlockSpType.NORMAL, EBlockSpType.SP_LINE, EBlockSpType.SP_CIRCLE, EBlockSpType.SELECTED, EBlockSpType.MATCHED];

var EBlockState = {
	NORMAL: 0, 
	SLIDING: 1, 
	MATCHED: 2
};

/**
 * 인게임 블럭 데이터 구조
 * @param inColor
 * @param inType
 * @param index
 */
function BlockModel(inType, inSpType, index, inParentContext) {
	this.type = inType;
	this.spType = inSpType;
	this.index = index;
	this.position = InGameScene.getBoardCellPosition(index);
	this.view = null;
	this.viewContext = inParentContext;
	this.state = EBlockState.NORMAL;
	
}

BlockModel.prototype.init = function() {
	this.type = EBlockType.NONE;
	this.spType = EBlockSpType.NORMAL;
	this.index = -1;
	this.position = null;
	this.view = null;
	this.viewContext = null;
}

BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.type + '000' + this.spType + '.png';
	return imageKeyName;
};

BlockModel.prototype.createView = function(inRow, inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	var result = this.viewContext.game.add.sprite(this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard);
	result.scale.setTo(0.9, 0.9);
	result.anchor.setTo(0.5, 0.5);
	result.inputEnabled = true;
	// set touch listener
	result.events.onInputDown.add(function(sprite, pointer) {
		if (this.state === EBlockState.SLIDING) {
			return;
		}
		
		if (this.position !== null) {
			StzCommon.StzLog.print('[BlockModel (onInputDown)] index: (' + this.position.x + ', ' + this.position.y + ')');	
		}
		
		if (inTouchCallback !== undefined) {
			inTouchCallback.apply(inTouchCallbackContext, [sprite, pointer, this]);
		}
	}, this);
	
	this.view = result;
	
	if (this.view.position.y !== this.position.y) {
		this.slidingBlock(function(){
			this.state = EBlockState.NORMAL;
		}, this);
	}
	return this.view;
};

/**
 * 블럭 슬라이딩 트윈 등록
 * @param inCallback
 * @param inCallbackContext
 */
BlockModel.prototype.slidingBlock = function(inCallback, inCallbackContext) {
	
	if (this.view === null || this.position === null) {
		return;
	}
	
	if (this.state === EBlockState.SLIDING || this.view.position.y === this.position.y) {
		return;
	}
	
	this.state = EBlockState.SLIDING;
	// StzCommon.StzLog.print("[BlockModel] index: " + this.index + ", start: " + this.view.position.y + ", to: " + this.position.y);
	this.viewContext.add.tween(this.view).to({y: this.position.y}, BlockModel.Setting.SLIDING_SECONDS * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
		if (inCallback !== null || inCallback !== undefined) {
			inCallback();
		}
	}, inCallbackContext);
};

BlockModel.prototype.updateView = function() {
	if (this.view === null || this.viewContext === null) {
		return;
	}
	
	
};

BlockModel.Setting = {
	SLIDING_SECONDS: 0.7	
};