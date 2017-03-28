var EBlockType = {
	NONE		: "",
	ARI			: "ari", 
	BLUE		: "blue", 
	LUCY		: "lucy", 
	MAO			: "mao", 
	MICKY		: "micky", 
	MONGYI		: "mongyi", 
	PINKY		: "pinky", 
	BOMB		: "bomb" 
};
EBlockType.list = [EBlockType.BLUE, EBlockType.MICKY, EBlockType.MONGYI, EBlockType.PINKY, EBlockType.LUCY, EBlockType.ARI, EBlockType.MAO]

var EBlockState = {
	NORMAL				: 0, 
	SLIDING				: 1, 
	SLIDING_END			: 2, 
	MATCHED				: 3,
	REMOVE_ANIM 		: 4,
	ANIMATION   		: 5,
	REMOVE 				: 6,
	
	INIT_BOMB			: 7,
	CREATED_BOMB		: 8,
	REMOVE_TO_BOMB		: 9
};

var EBlockImage = {
		NORMAL 		: 1,
		REMOVE		: 4,
		CLICKED 	: 5
};

var ESlideVelocity = {
		BLOCK_MOVE 		: 0.1,
		BLOCK_RETRUN	: 0.5,
		BLOCK_DROP 	: 0.2
};
/**
 * 인게임 블럭 데이터 구조
 * @param inColor
 * @param inType
 * @param index
 */
function BlockModel(inType, index, inParentContext) {
	this.type = inType;
	this.index = index;
	this.posX = index%InGameBoardConfig.ROW_COUNT;
	this.posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	
	this.position = InGameScene.getBoardCellPosition(index);
	this.view = null;
	this.viewContext = inParentContext;
	this.state = EBlockState.NORMAL;
	this.isMoveAndMatch = false;
	this.removeToBombDelayTime = 0;
	
	this.slidVelocity = 0;
}

BlockModel.prototype.init = function() {
	this.type = EBlockType.NONE;
	this.state = EBlockState.NORMAL;
	this.index = -1;
	this.position = null;
	this.view = null;
	this.viewContext = null;
	this.removeToBombDelayTime = 0;
	
	this.slidVelocity = 0;
};

BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.type + '0001.png';
	return imageKeyName;
};

BlockModel.prototype.setImageFrame = function(imageNum) {
	if(this.state ===  EBlockState.NORMAL &&this.view !== undefined  &&this.view !== null 
			&& this.view.frameName !== undefined && this.view.frameName !== null && this.isMoveAndMatch !== true){
		this.view.frameName = this.type + '000' +  imageNum + '.png';
	}
	
};

BlockModel.prototype.createView = function(inRow, inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	var result = this.viewContext.game.add.sprite(this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard);
	result.width = InGameBoardConfig.BLOCK_WIDTH;
	result.height = InGameBoardConfig.BLOCK_HEIGHT;
	
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
	
	result.animations.add("blockBombInit", Phaser.Animation.generateFrameNames("bomb", 1, 5, ".png", 4), 5, false);
	result.animations.add("blockBombIdle", Phaser.Animation.generateFrameNames("bomb", 3, 5, ".png", 4), 5, false);
	this.slidVelocity = ESlideVelocity.BLOCK_DROP;
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
		this.viewContext.add.tween(this.view).to({y: this.position.y}, this.slidVelocity * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
			if (inCallback !== null || inCallback !== undefined) {
				inCallback();
			}
		}, inCallbackContext);
	}
	else{
		this.viewContext.add.tween(this.view).to({x: this.position.x}, this.slidVelocity * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
			if (inCallback !== null || inCallback !== undefined) {
				inCallback();
			}
		}, inCallbackContext);
	}
	
};

BlockModel.prototype.updateView = function() {
	if(this.view === null && this.index !== -1 && this.state !== EBlockState.REMOVE){
		this.init();
		return;
	}
	if (this.viewContext === null || this.state === EBlockState.SLIDING || this.state === EBlockState.ANIMATION) {
		return;
	}
	
	if(this.state === EBlockState.REMOVE_ANIM){
		this.removeBlock("animExplodeNormal");
	}
	
	if(this.state === EBlockState.REMOVE_TO_BOMB){
		this.removeBlock("animExplodeCircle", this.removeToBombDelayTime);
	}
	
	if(this.state === EBlockState.INIT_BOMB){
		this.type = EBlockType.BOMB;
		this.view.animations.play("blockBombInit", 10, false);
		
		this.view.animations.currentAnim.onComplete.add(function(){
			this.state = EBlockState.NORMAL;
			this.view.animations.play("blockBombIdle", 5, true);
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
};

BlockModel.prototype.removeBlock = function(animationName, removeToBombDelayTime) {
	this.state = EBlockState.ANIMATION;
	
	var blockMatchAnim = this.viewContext.add.sprite(this.view.x, this.view.y, animationName ,null, this.viewContext.scene.fGameBoard);
	blockMatchAnim.animations.add(animationName);
	blockMatchAnim.anchor.setTo(0.5, 0.5);
	blockMatchAnim.visible = false;
	this.isMoveAndMatch = true;

	if(removeToBombDelayTime === undefined){
		
		this.view.frameName = this.type + '0004.png';
		this.viewContext.time.events.add(200, function(){
			blockMatchAnim.visible = true;
			this.view.kill();
			this.view= null;
			this.view = blockMatchAnim;
			blockMatchAnim.animations.play(animationName,15,false);
		}.bind(this));
		
		
		blockMatchAnim.animations.currentAnim.onComplete.add(function(){
			this.state = EBlockState.REMOVE;
			this.view.kill();
			this.view= null;
			this.isMoveAndMatch = false;
		}.bind(this));
	}
	else{
		this.viewContext.time.events.add(removeToBombDelayTime, bombRemoveAnim.bind(this, blockMatchAnim, animationName));
	}
	
	function bombRemoveAnim() {
		blockMatchAnim.visible = true;
		this.view.kill();
		this.view= null;
		this.view = blockMatchAnim; 
		blockMatchAnim.animations.play(animationName,15,false);
		
		blockMatchAnim.animations.currentAnim.onComplete.add(function(){
			this.state = EBlockState.REMOVE;
			this.view.kill();
			this.view= null;
			this.isMoveAndMatch = false;
		}.bind(this));
	}
};

BlockModel.prototype.distory = function() {
	if(this.view !== undefined && this.view !== null){
		this.view.kill();
		this.view= null;
	}
};
