var EBlockType = {
	NONE		: "",
	NORMA		: "norma", 
	HEARTY		: "hearty", 
	BLUE		: "blue", 
	TRIAN		: "trian", 
	SCREAM		: "scream", 
	CHUBBY		: "chubby", 

	CIRCLE		: "circle",
	VERTICAL	: "vertical",
	HORIZONTAL  : "horizontal"	
};
EBlockType.list = [EBlockType.NORMA, EBlockType.HEARTY, EBlockType.BLUE, EBlockType.TRIAN, EBlockType.SCREAM, EBlockType.CHUBBY]

var EBlockState = {
	NORMAL				: 0, 
	SLIDING				: 1, 
	SLIDING_END			: 2, 
	MATCHED				: 3,
	REMOVE_ANIM 		: 4,
	ANIMATION   		: 5,
	REMOVE 				: 6,

	CREATE_SPECIAL		:7
};

var EBlockImage = {
		NORMAL 		: 1,
		CLICKED 	: 2,
		REMOVE		: 3	
};

var ESlideVelocity = {
		BLOCK_NONE		: 0,
		BLOCK_MOVE 		: 0.15,
		BLOCK_RETRUN	: 0.25,
		BLOCK_DROP 	: 0.2
};
/**
 * 인게임 블럭 데이터 구조
 * @param inColor
 * @param inType
 * @param index
 */
function BlockModel(inType, index, inParentContext, speicalBlockCallBack) {
	this.type = inType;
	this.index = index;
	this.posX = index%InGameBoardConfig.ROW_COUNT;
	this.posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	
	this.position = InGameScene.getBoardCellPosition(index);

	this.view = null;
	this.interruptedView = null;
	this.viewContext = inParentContext;
	this.state = EBlockState.NORMAL;
	this.isMoveAndMatch = false;
	this.removeToBombDelayTime = 0;
	
    // 유저가 스왑한 이후 매칭되지 않아 다시 스왑되는 상황에 세팅되는 플래그
	this.returnFlag = false;
	this.preView = null;
	this.preType = 0;
	
	this.isHintOn = false;
	
	this.isTwoMatched = false;
	this.spicialCreatePosIndex = -1;
	
	this.slidVelocity = 0;
	
	if(speicalBlockCallBack !== undefined){
		this.speicalBlockCallBack = speicalBlockCallBack;
	}

    // 실제로 유저가 스왑한 경우 세팅되는 플래그
	this.isSwapped = false;
	this.isDrop = false;
    // 방해기능으로 인해 
	this.isInterrupted = false;
}


BlockModel.prototype.isPureBlock = function() {
	if (this.isTwoMatched || this.isDrop || this.isInterrupted || this.isSwapped || this.returnFlag || this.isMoveAndMatch) {
		return false;
	}
	
	if (this.view === undefined || this.view === null) {
		return false;
	}
	
	return true;
};

BlockModel.prototype.init = function() {
	this.type = EBlockType.NONE;
	this.state = EBlockState.NORMAL;
	this.index = -1;
	this.position = null;
	this.view = null;
	this.viewContext = null;
	this.removeToBombDelayTime = 0;
	
	this.returnFlag = false;
	this.preView = null;
	this.preType = 0;
	
	this.isHintOn = false;
	
	this.isTwoMatched = false;
	this.spicialCreatePosIndex = -1;
	
	this.slidVelocity = 0;
	
	this.isDrop = false;
	
	this.isInterrupted = false;
};

BlockModel.prototype.isBlockSpicial = function(){
	if(this.type === EBlockType.CIRCLE || this.type === EBlockType.VERTICAL
		||this.type === EBlockType.HORIZONTAL){
		return true;
	}
	return false;
		
};

BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.type + '0001.png';
	return imageKeyName;
};

BlockModel.prototype.setImageFrame = function(imageNum) {
	if(this.state ===  EBlockState.NORMAL &&this.view !== undefined  &&this.view !== null 
			&& this.view.frameName !== undefined && this.view.frameName !== null && this.isMoveAndMatch !== true && this.isBlockSpicial() !== true){
		this.view.frameName = this.type + '000' +  imageNum + '.png';
	}
};

BlockModel.prototype.setBlockState = function(inState) {
	
	if (this.isInterrupted) {
		if (inState === EBlockState.SLIDING || inState === EBlockState.MATCHED || inState === EBlockState.REMOVE_ANIM
			|| inState === EBlockState.REMOVE || inState === EBlockState.CREATE_BOMB || inState === EBlockState.REMOVE_TO_BOMB) {
				return;		
			}
	}
	this.state = inState;
};

BlockModel.prototype.createView = function(inRow, inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	var result = this.viewContext.game.add.sprite(this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard);
	result.width = InGameBoardConfig.BLOCK_WIDTH;
	result.height = InGameBoardConfig.BLOCK_HEIGHT;
	
	result.anchor.setTo(0.5, 1.0);
	result.inputEnabled = true;
	this.setBlockState(EBlockState.NORMAL);
	
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
	
	if (this.slidVelocity === ESlideVelocity.BLOCK_NONE) {
		return;
	}
	
	if (this.isInterrupted === true) {
	    return;
	}

	this.setBlockState(EBlockState.SLIDING);

	if(this.moveYFlag === true){
		this.viewContext.add.tween(this.view).to({y: this.position.y}, this.slidVelocity * 1000, 'Quart.easeOut', true).onComplete.addOnce(function() {
			
			if (this.isSwapped === false && this.returnFlag === false) {
				this.viewContext.add.tween(this.view.scale).to({y: 0.9}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
			} 
				
			this.isSwapped = false;
			
			if (inCallback !== null || inCallback !== undefined) {
				inCallback.call(inCallbackContext);
			}
		}, this);
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
	if(this.view === undefined){
		return;
	}
	if(this.view === null && this.index !== -1 && this.state !== EBlockState.REMOVE){
		this.init();
		return;
	}
	if (this.viewContext === null || this.state === EBlockState.SLIDING || this.state === EBlockState.ANIMATION) {
		return;
	}
	
	if(this.view !== null && this.isHintOn === false){
		this.view.scale.set(1, 1);
	}
	else if(this.view !== null){
		this.view.scale.set(1.2, 1.2);
	}
	
	if (this.isInterrupted === true) {
		if (this.view !== undefined && this.view !== null) {
			if (this.interruptedView === null) {
		        this.interruptedView = this.viewContext.add.text(this.view.world.x, this.view.world.y, '얼', { fontSize: '32px', fill: '#000000', font: 'bold Arial' });
		        this.interruptedView.anchor.setTo(0.5, 1.0);
		    }	
		} else{
	    	this.isInterrupted = false;
	    }
	} else {
	    if (this.interruptedView !== null) {
	        this.interruptedView.kill();
	        this.interruptedView = null;
	    }
	}

	if(this.state === EBlockState.REMOVE_ANIM){
		this.removeBlock("animExplodeNormal");
	}
	
	if(this.state === EBlockState.INIT_BOMB){
		this.setBlockState(EBlockState.NORMAL);
		this.view.animations.playWithDelayList("blockBombIdle", 10, {'2':500}, true);
	}
	
	if(this.state === EBlockState.CREATE_SPECIAL){
		this.setBlockState(EBlockState.NORMAL);
		this.view.frameName = this.type + '.png';
	}
	
	if(this.view !== null && this.state === EBlockState.NORMAL){
		if (this.view.position.y !== this.position.y) {
			
			this.moveYFlag = true;
			this.isMoveAndMatch = true;
			this.slidingBlock(function(){

				this.setBlockState(EBlockState.NORMAL);
				this.isMoveAndMatch = false;
				this.isDrop = false;
				this.slidVelocity = ESlideVelocity.BLOCK_NONE;

				if(this.returnFlag === true){
					if(this.preView === null){
						debugger;
					}
					this.view = this.preView;
					this.type = this.preType;
					this.returnFlag = false;
					this.isSwapped = true;
					this.slidVelocity = ESlideVelocity.BLOCK_RETRUN;
				}
			}.bind(this));
		}
		
		else if (this.view.position.x !== this.position.x) {
			this.isMoveAndMatch = true;
			this.moveYFlag = false;
			this.slidingBlock(function(){
				
				this.setBlockState(EBlockState.NORMAL);
				this.isMoveAndMatch = false;
				this.slidVelocity = ESlideVelocity.BLOCK_NONE;
				this.isDrop = false;
				
				if(this.returnFlag === true){
					if(this.preView === null){
						debugger;
					}
					this.view = this.preView;
					this.type = this.preType;
					this.returnFlag = false;
					this.isSwapped = true;
					this.slidVelocity = ESlideVelocity.BLOCK_RETRUN;
				}
			}.bind(this));
		}
	}
};

BlockModel.prototype.removeBlock = function(animationName, removeToBombDelayTime) {
	if (this.isInterrupted === true) {
		return;
	}
	
	this.setBlockState(EBlockState.ANIMATION);
	
	var blockMatchAnim = this.viewContext.add.sprite(this.view.x, this.view.y, animationName ,null, this.viewContext.scene.fGameBoard);
	blockMatchAnim.animations.add(animationName);
	//blockMatchAnim.anchor.setTo(0.5, 0.5);
	blockMatchAnim.anchor.setTo(0.5, 0.8);
	blockMatchAnim.visible = false;
	this.isMoveAndMatch = true;

	this.isTwoMatched = false;
	this.isSwapped = false;
	this.isDrop = false;
	
	if(removeToBombDelayTime === undefined){

		//this.viewContext.createScoreText(this);
		if(this.isBlockSpicial() === false && this.type !== EBlockType.NONE && this.view.frameName !== ""){
			this.view.frameName = this.type + '0003.png';
		}
		
		this.viewContext.time.events.add(100, function(){
			blockMatchAnim.visible = true;
			
			if(this.view !== undefined && this.view !== null){
				this.view.kill();
				this.view= null;
				this.view = blockMatchAnim;
				blockMatchAnim.animations.play(animationName,40,false);
			}
			
			else{
				this.isMoveAndMatch = false;
			}
			
			if(this.speicalBlockCallBack !== undefined && this.isBlockSpicial()){
				this.speicalBlockCallBack(this.type, this.index);	
			}

		}.bind(this));
		
		blockMatchAnim.animations.currentAnim.onComplete.add(function(){
			this.setBlockState(EBlockState.REMOVE);
			
			if(this.view !== undefined && this.view !== null){
				this.view.kill();
				this.view= null;
			}
			this.type = EBlockType.NONE;
			this.slidVelocity = ESlideVelocity.BLOCK_NONE;
			this.isMoveAndMatch = false;
			this.isInterrupted = false;
		}.bind(this));
	}
};

BlockModel.prototype.destroy = function() {
	
	this.isInterrupted = false;
	this.isMoveAndMatch = false;
	
	if(this.view !== undefined && this.view !== null){
		this.isMoveAndMatch = false;
		this.isDrop = false;
		this.view.kill();
		this.view= null;
	}

	if (this.interruptedView) {
	    this.interruptedView.kill();
	    this.interruptedView = null;
	}
};
