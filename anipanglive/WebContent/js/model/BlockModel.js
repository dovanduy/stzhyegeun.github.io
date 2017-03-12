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
EBlockSpType.list = [EBlockSpType.NORMAL, EBlockSpType.SP_LINE, EBlockSpType.SP_CIRCLE, EBlockSpType.SELECTED, EBlockSpType.MATCHED]


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

BlockModel.prototype.createView = function(inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	var result = this.viewContext.game.add.sprite(this.position.x, this.position.y, 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard);
	result.scale.setTo(0.9, 0.9);
	result.anchor.setTo(0.5, 0.5);
	result.inputEnabled = true;
	result.events.onInputDown.add(function(sprite, pointer) {
		if (inTouchCallback !== undefined) {
			inTouchCallback.apply(inTouchCallbackContext, [sprite, pointer, this]);
		}
	}, this);
	
	this.view = result;
	return this.view;
};