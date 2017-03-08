/**
 * 인게임 블럭 데이터 구조
 * @param inKind 블럭대분류
 * @param inType 블럭 소분류
 * @returns
 */
function BlockModel(inKind, inColor, inType, indexRow, indexCol) {
	this.block_kind = inKind;
	this.block_color = inColor;
	this.block_type = inType;
	this.block_index = {
		'row': (indexRow === undefined ? 0 : indexRow),
		'col': (indexCol === undefined ? 0 : indexCol)
	};
	this.block_position = {
		'x': (indexCol === undefined ? 0 : this.block_index.col * StzGameConfig.BLOCK_WIDTH),
		'y': 0
	};
	this.match_label = -1;
	this.view = null;
	this.emitter = null;
}


/**
 * 이미지의 키네임을 반환
 * @returns {String}
 */
BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.block_kind + "_" + this.block_color + (this.block_type === StzEBlockKindType.NONE ? "" : "_" + this.block_type) + ".png";
	return imageKeyName;
};


BlockModel.prototype.createEmitter = function(inGame) {
	this.emitter = inGame.add.emitter(0, 0, 10);
	this.emitter.makeParticles('ingame_block_base', this.getImageKeyname());
	
	// http://www.html5gamedevs.com/topic/5306-absolute-position-of-sprite/
	this.emitter.x = this.view.world.x + StzGameConfig.BLOCK_WIDTH / 2;
	this.emitter.y = this.view.world.y + StzGameConfig.BLOCK_HEIGHT / 2;
};


BlockModel.prototype.createView = function(inGame, inParent, inTouchCallback, inTouchCallbackContext) {
	var result = inGame.add.sprite(this.block_position.x, this.block_position.y, 'ingame_block_base', this.getImageKeyname(), inParent);
	result.inputEnabled = true;
	result.input.enabled = true;
	
	result.events.onInputDown.add(function(sprite, pointer) {
		if (inTouchCallback !== undefined) {
			inTouchCallback.apply(inTouchCallbackContext, [sprite, pointer, this]);
		}
	}, this);
	
	this.view = result;
	
	return this.view;
};

BlockModel.prototype.updateView = function() {
	if (this.view === null) {
		return;
	} 
	
	this.view.loadTexture('ingame_block_base', this.getImageKeyname(), true);
};
