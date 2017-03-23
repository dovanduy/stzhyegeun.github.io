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
	SLIDING_END: 2, 
	MATCHED: 3,
	REMOVE_ANIM   : 4,
	ANIMATION   : 5,
	REMOVE : 6
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
	this.posX = index%InGameBoardConfig.ROW_COUNT;
	this.posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	
	this.position = InGameScene.getBoardCellPosition(index);
	this.view = null;
	this.viewContext = inParentContext;
	this.state = EBlockState.NORMAL;
	this.isMoveAndMatch = false;
}

BlockModel.prototype.init = function() {
	this.type = EBlockType.NONE;
	this.spType = EBlockSpType.NORMAL;
	this.state = EBlockState.NORMAL;
	this.index = -1;
	this.position = null;
	this.view = null;
	this.viewContext = null;
};

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
			StzLog.print('[BlockModel (onInputDown)] index: (' + this.position.x + ', ' + this.position.y + ')');	
		}
		
		if (inTouchCallback !== undefined) {
			inTouchCallback.apply(inTouchCallbackContext, [sprite, pointer, this]);
		}
	}, this);
	
	
	
	this.view = result;
	return this.view;
};


BlockModel.prototype.setBlockPos = function(index){
	this.position = InGameScene.getBoardCellPosition(index);
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
	
	if (this.state === EBlockState.SLIDING) {
		return;
	}
	
	this.state = EBlockState.SLIDING;

	if(this.moveYFlag === true){
		this.viewContext.add.tween(this.view).to({y: this.position.y}, BlockModel.Setting.SLIDING_SECONDS * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
			if (inCallback !== null || inCallback !== undefined) {
				inCallback();
			}
		}, inCallbackContext);
	}
	else{
		this.viewContext.add.tween(this.view).to({x: this.position.x}, BlockModel.Setting.SLIDING_SECONDS * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
			if (inCallback !== null || inCallback !== undefined) {
				inCallback();
			}
		}, inCallbackContext);
	}
	
};



BlockModel.prototype.updateView = function() {
	if(this.view == null && this.index !== -1 && this.state !== EBlockState.REMOVE){
		this.init();
		return;
	}
	if (this.viewContext === null || this.state === EBlockState.SLIDING || this.state === EBlockState.ANIMATION) {
		return;
	}
	
	if(this.state === EBlockState.REMOVE_ANIM){
		this.state = EBlockState.ANIMATION;
		
		var blockMatchAnim = this.viewContext.add.sprite(this.view.x, this.view.y, "animExplodeNormal",null, this.viewContext.scene.fGameBoard);
		blockMatchAnim.animations.add("blockmatch");
		blockMatchAnim.anchor.setTo(0.5, 0.5);
		
		this.view.kill();
		this.view= null;
		this.isMoveAndMatch = true;
		this.view = blockMatchAnim; 
		blockMatchAnim.animations.play("blockmatch",15,false);
		
		blockMatchAnim.animations.currentAnim.onComplete.add(function(){
			this.state = EBlockState.REMOVE;
			this.view.kill();
			this.view= null;
			this.isMoveAndMatch = false;
		}.bind(this));
	}
	
	if(this.view !== null && this.state === EBlockState.NORMAL){
		if (this.view.position.y !== this.position.y) {
			this.moveYFlag = true;
			this.isMoveAndMatch = true;
			this.slidingBlock(function(){
				this.state = EBlockState.NORMAL;
				this.isMoveAndMatch = false;
			}.bind(this));
		}
		
		else if (this.view.position.x !== this.position.x) {
			this.isMoveAndMatch = true;
			this.moveYFlag = false;
			this.slidingBlock(function(){
				this.state = EBlockState.NORMAL;
				this.isMoveAndMatch = false;
			}.bind(this));
		}
	}
	
	//this.isMoveAndMatch = (this.view.x === this.position.x && this.view.y === this.position.y);
};

BlockModel.Setting = {
	SLIDING_SECONDS: 0.10	
};