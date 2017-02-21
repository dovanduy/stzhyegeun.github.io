/**
 * 인게임 블럭 데이터 구조
 * @param inKind 블럭대분류
 * @param inType 블럭 소분류
 * @returns
 */
function BlockModel(inKind, inType, indexRow, indexCol) {
	this.block_kind = inKind;
	this.block_type = inType;
	this.block_index = {
		'row': (indexRow === undefined ? 0 : indexRow),
		'col': (indexCol === undefined ? 0 : indexCol)
	};
	this.block_position = {
		'x': (indexCol === undefined ? 0 : this.block_index.col * StzGameConfig.BLOCK_WIDTH),
		'y': 0
	};
}


/**
 * 이미지의 키네임을 반환
 * @returns {String}
 */
BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.block_kind + "_" + this.block_type + ".png";
	return imageKeyName;
};


BlockModel.prototype.createView = function(inGame, inParent) {
	var result = inGame.add.sprite(this.block_position.x, this.block_position.y, 'ingame_block_base', this.getImageKeyname(), inParent);
	return result;
};
