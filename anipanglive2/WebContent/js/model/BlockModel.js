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
EBlockType.list = [EBlockType.NORMA, EBlockType.HEARTY, EBlockType.BLUE, EBlockType.TRIAN, EBlockType.SCREAM, EBlockType.CHUBBY];

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
		BLOCK_DROP 	: 0.10
};

var EBlockAnimation = {
		ANIM_EXPLODE_NORMAL 	: "animExplodeNormal",
		ANIM_EXPLODE_SPECIAL 	: "animExplodeSpecial",
		ANIM_HINT				: "animHint"
			
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

    // 유저가 스왑한 이후 매칭되지 않아 다시 스왑되는 상황에 세팅되는 플래그
	this.returnFlag = false;
	//스왑전에 이 블럭의 View
	this.preView = null;
	//스왑전에 이 블럭의 type
	this.preType = 0;
	
	//스와이프된 블럭이 매칭 될 경우 true
	this.isTwoMatched = false;
	//현재 블럭의 매칭으로 스페셜 블럭이 생성될 인덱스
	this.spicialCreatePosIndex = -1;
	//블럭 이동의 속도
	this.slidVelocity = 0;
	
	if(speicalBlockCallBack !== undefined){
		this.speicalBlockCallBack = speicalBlockCallBack;
	}

    // 실제로 유저가 스왑한 경우 세팅되는 플래그
	this.isSwapped = false;
	//떨어질 예정인 블럭 체크
	this.isDrop = false;
    // 방해기능으로 인해 
	this.isInterrupted = false;
	
	//블럭을 터치한 손가락의 id
	this.touchId = -1;
	
	//스페셜 블록의 영향으로 터진경우 딜레이 값
	this.specialDelayTime = -1;
}


BlockModel.prototype.isPureBlock = function() {
	if (this.isTwoMatched || this.isDrop || this.isInterrupted || this.isSwapped || this.returnFlag || this.isMoveAndMatch) {
		return false;
	}
	
	if(this.state !== EBlockState.NORMAL){
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
	
	this.isMoveAndMatch = false;
	this.returnFlag = false;
	
	this.preView = null;
	this.preType = 0;
	
	this.isTwoMatched = false;
	this.spicialCreatePosIndex = -1;
	
	this.slidVelocity = 0;
	
	this.isSwapped = false;
	this.isDrop = false;
	this.isInterrupted = false;
	
	this.touchId = -1;
	this.specialDelayTime = -1;
	
	/*
	this.index = -1;
	this.position = null;
	this.view = null;
	this.viewContext = null;
	*/
};

BlockModel.prototype.isBlockSpicial = function(){
	if(this.type === EBlockType.CIRCLE || this.type === EBlockType.VERTICAL
		||this.type === EBlockType.HORIZONTAL ){
		return true;
	}
	return false;
};

BlockModel.prototype.isExternalFactors = function(){
	
	// NOTE @hyegeun 얼음 방해 : 방해가 있는 경우 블럭 모델이나 뷰가 없을 수도 있다.
	if (!this || !this.view) {
		return false;
	}
	
	if(this.slidVelocity === ESlideVelocity.BLOCK_RETRUN || this.slidVelocity === ESlideVelocity.BLOCK_MOVE){
		return false;
	}
	
	if (this.isTwoMatched === true) {
		return false;
	}

	if (this.isDrop === true) {
		return false;
	}
	
	if (this.returnFlag === true) {
		return false;
	}
	
	// NOTE @hyegeun 얼음 방해 : 방해가 있는 경우 슬라이드 여부 체크 스킵
	if (this.isInterrupted) {
		return false;
	}
	
	return true;
};

BlockModel.prototype.getImageKeyname = function() {
	var imageKeyName = this.type + '0001.png';
	return imageKeyName;
};

BlockModel.prototype.setImageFrame = function(imageNum) {
	if(this.state ===  EBlockState.NORMAL &&this.view !== undefined  &&this.view !== null 
			&& this.view.frameName !== undefined && this.view.frameName !== null && this.isMoveAndMatch !== true && this.isBlockSpicial() !== true){
		
		//특수 블럭 안터지는 버그에 대한 방어 코드 
		if(this.type === ""){
			if(this.view.frameName === 'circle.png'){
				this.type = EBlockType.CIRCLE;
			}
			else if(this.view.frameName === 'horizontal.png'){
				this.type = EBlockType.HORIZONTAL;
			}
			else if(this.view.frameName === 'vertical.png'){
				this.type = EBlockType.VERTICAL;
			}
			return;
		}
		
		this.view.frameName = this.type + '000' +  imageNum + '.png';
	}
};

BlockModel.prototype.setBlockState = function(inState, specialDelayTime) {
	
	if (this.isInterrupted) {
		if (inState === EBlockState.SLIDING || inState === EBlockState.MATCHED || inState === EBlockState.REMOVE_ANIM
			|| inState === EBlockState.REMOVE || inState === EBlockState.CREATE_BOMB || inState === EBlockState.REMOVE_TO_BOMB) {
				return;		
			}
	}
	if(specialDelayTime !== undefined && inState === EBlockState.REMOVE_ANIM){
		this.specialDelayTime = specialDelayTime;
	}
	else if(specialDelayTime === undefined && inState === EBlockState.REMOVE_ANIM){
		this.specialDelayTime = -1;
	}
	
	this.state = inState;
};

BlockModel.prototype.createInterruptedIceView = function() {
	if (!this.viewContext) {
		return;
	}
	
	if (!this.view) {
		return;
	}
	
	if (!this.isInterrupted) {
		return;
	}
	
	this.isMoveAndMatch = false;
	this.isTwoMatched = false;
	this.isDrop = false;
	this.isSwapped = false;
	this.setBlockState(EBlockState.NORMAL);
	
	this.interruptedView = this.viewContext.game.add.sprite(this.view.x, this.view.y, 'interruptIce', 'ice_nodetail.png', this.viewContext.scene.fGameBoard);
	this.interruptedView.anchor.setTo(0.5, 1.0);
	return this.interruptedView;
};
	
BlockModel.prototype.createView = function(inRow, inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	this.view = StzObjectPool.loadView("SPRITE", this.type, this.viewContext, this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard)

	this.view.anchor.setTo(0.5, 1.0);
	this.view.inputEnabled = true;
	this.setBlockState(EBlockState.NORMAL);
	
	this.slidVelocity = ESlideVelocity.BLOCK_DROP;
	
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
	
	if (this.isTwoMatched === false) {
		this.touchId = -1;
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

BlockModel.prototype.createSpecialTween = function() {
	if(this.type === EBlockType.VERTICAL){
		this.viewContext.add.tween(this.view.scale).to({y:[0.9, 1.05, 1]}, 800, "Linear", true, 0, -1);
	}
	else if(this.type === EBlockType.HORIZONTAL){
		this.viewContext.add.tween(this.view.scale).to({x:[0.9, 1.05, 1]}, 800, "Linear", true, 0, -1);
	}
	else if(this.type === EBlockType.CIRCLE){
		this.viewContext.add.tween(this.view.scale).to({x :[0.95, 1.05, 1],y:[0.95, 1.05, 1]}, 800, "Linear", true, 0, -1);
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
	
	if (this.isInterrupted === true) {
		if (this.view !== undefined && this.view !== null) {
			if (this.interruptedView === null) {
				this.createInterruptedIceView();
		        //this.interruptedView = this.viewContext.add.text(this.view.world.x, this.view.world.y, '얼', { fontSize: '32px', fill: '#000000', font: 'bold Arial' });
		        //this.interruptedView.anchor.setTo(0.5, 1.0);
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
	
	if(this.state === EBlockState.REMOVE_ANIM && this.specialDelayTime === -1){
		this.removeBlock(EBlockAnimation.ANIM_EXPLODE_NORMAL);
	}
	else if(this.state === EBlockState.REMOVE_ANIM && this.specialDelayTime !== -1){
		this.removeBlock(EBlockAnimation.ANIM_EXPLODE_SPECIAL);
	}
	
	
	if(this.state === EBlockState.CREATE_SPECIAL){
		this.setBlockState(EBlockState.NORMAL);
		this.view.frameName = this.type + '.png';
		this.createSpecialTween();
	}
	
	if(this.view !== null /*&& this.state === EBlockState.NORMAL*/){
		if (this.view.position.y !== this.position.y || this.view.position.x !== this.position.x) {
			
			this.moveYFlag = (this.view.position.y !== this.position.y)?true:false;
			this.isMoveAndMatch = true;
			this.slidingBlock(function(){

				this.setBlockState(EBlockState.NORMAL);
				this.isMoveAndMatch = false;
				this.isDrop = false;
				this.slidVelocity = ESlideVelocity.BLOCK_NONE;
				
				if(this.returnFlag === true){
					if(this.preView === null){
						return;
					}
					//리턴 상태 일 경우 블럭을 다시 원상복귀 상태로
					this.view = this.preView;
					this.type = this.preType;
					
					this.returnFlag = false;
					this.isSwapped = true;
					this.slidVelocity = ESlideVelocity.BLOCK_RETRUN;
					this.setImageFrame(EBlockImage.NORMAL);
				}
			}.bind(this));
		}
		else{
			this.isDrop = false;
			this.isSwapped = false;
			this.isMoveAndMatch = false;
		}
	}
};

BlockModel.prototype.removeBlock = function(animationName) {
	if (this.isInterrupted === true) {
		return;
	}
	
	this.setBlockState(EBlockState.ANIMATION);
	
	//var blockMatchAnim = this.viewContext.add.sprite(this.view.x, this.view.y, animationName ,null, this.viewContext.scene.fGameBoard);
	var blockMatchAnim = StzObjectPool.loadView("SPRITE", animationName, this.viewContext, this.position.x, this.position.y, animationName, null, this.viewContext.scene.fGameBoard);
	if (blockMatchAnim.animations.currentAnim === null) {
		blockMatchAnim.animations.add(animationName);	
	} else {
		blockMatchAnim.animations.currentAnim.frame = 0;
	}
	if(animationName === EBlockAnimation.ANIM_EXPLODE_NORMAL){
		//일반 터짐일 경우 블럭 표정 터짐 100ms 간 유지
		blockMatchAnim.anchor.setTo(0.5, 0.8);
		if(this.isBlockSpicial() === false && this.type !== EBlockType.NONE && this.view.frameName !== ""){
			this.view.frameName = this.type + '0003.png';
		}
		this.viewContext.time.events.add(100, function(){
			this.removeAnimation(blockMatchAnim, animationName);
		}.bind(this, blockMatchAnim, animationName));

	}
	else{
		//특수 블럭 터짐일 경우 블럭 표정 터짐 사용 안함
		blockMatchAnim.anchor.setTo(0.5, 0.65);
		this.viewContext.time.events.add(10, function(){
			this.removeAnimation(blockMatchAnim, animationName);
		}.bind(this, blockMatchAnim, animationName));
	}
	//blockMatchAnim.anchor.setTo(0.5, 0.5);
	blockMatchAnim.visible = false;
	this.isMoveAndMatch = true;

	blockMatchAnim.animations.currentAnim.onComplete.removeAll();
	blockMatchAnim.animations.currentAnim.onComplete.add(function(){
		this.setBlockState(EBlockState.REMOVE);
		
		if(this.view !== undefined && this.view !== null){
			// unload Explode Anim
			StzObjectPool.unloadView(animationName, blockMatchAnim);	
			
			//this.view.kill();
			this.view= null;	
			blockMatchAnim = null;
			
			this.type = EBlockType.NONE;
		}

		this.slidVelocity = ESlideVelocity.BLOCK_NONE;
		
		this.isMoveAndMatch = false;
		this.isInterrupted = false;
		this.isTwoMatched = false;
		this.isDrop = false;
		this.isSwapped = false;
		this.returnFlag = false;
		
		this.specialDelayTime = -1;
	}.bind(this, animationName));	
};

BlockModel.prototype.removeAnimation = function(blockMatchAnim, animationName){
	//blockMatchAnim.visible = true;
	
	if((this.type === EBlockType.BLUE && this.viewContext.iceInterrupCount < InGameInterruptedConfig.ICE_MAX_COUNT)  
		|| (this.type === EBlockType.TRIAN && this.viewContext.cloudInterrupCount < InGameInterruptedConfig.CLOUD_MAX_COUNT)){
		var fromPosition = this.view.world;
		var toPosition = null;
		
		if(this.type === EBlockType.BLUE ){
			toPosition = this.viewContext.scene.fBtnIce.world;
			this.viewContext.iceInterruptBlockRemainCount--;
		}
		else if(this.type === EBlockType.TRIAN){
			 toPosition = this.viewContext.scene.fBtnCloud.world;
			 this.viewContext.cloudInterruptBlockRemainCount--;
		}
		
		var centralPosition = new Phaser.Point(fromPosition.x, 1000);
		var cloneView = StzObjectPool.loadView("SPRITE", "light", this.viewContext, this.position.x, this.position.y + this.viewContext.scene.fGameBoard.y, 'light', null, this.viewContext.scene);
		this.viewContext.moveSpriteByQuadraticBezierCurve(cloneView, fromPosition, centralPosition, toPosition, 350, function(inView){
			StzObjectPool.unloadView("light", inView);
		}.bind(this,cloneView/*, [this.type, cloneView]*/) );
	}
	
	if(this.view !== undefined && this.view !== null){
		
		if(animationName === EBlockAnimation.ANIM_EXPLODE_NORMAL){
			blockMatchAnim.visible = true;
			StzObjectPool.unloadView(this.type, this.view);
			this.view= null;
			this.view = blockMatchAnim;
			blockMatchAnim.animations.play(animationName,40,false);
		}
		else{
			this.viewContext.time.events.add(this.specialDelayTime*60, function(){
				blockMatchAnim.visible = true;
				StzObjectPool.unloadView(this.type, this.view);
				this.view= null;
				this.view = blockMatchAnim;
				blockMatchAnim.animations.play(animationName,30,false);
			}.bind(this));
		}
	}
	
	else{
		this.isMoveAndMatch = false;
	}
	
	if(this.speicalBlockCallBack !== undefined && this.isBlockSpicial()){
		this.speicalBlockCallBack(this.type, this.index);	
	}
}
BlockModel.prototype.destroy = function(isDestroy) {
	
	if (isDestroy === undefined) {
		isDestroy = false;
	}
	
	this.isInterrupted = false;
	this.isMoveAndMatch = false;
	this.isDrop = false;
	
	if(this.view !== undefined && this.view !== null){
		this.isMoveAndMatch = false;
		this.isDrop = false;
		StzObjectPool.unloadView(this.type, this.view);
		/*
		if (isDestroy) {
			this.view.destroy();
		} else {
			this.view.kill();	
		}
		*/
		this.view= null;
	}

	if (this.interruptedView) {
		if (isDestroy) {
			this.interruptedView.destroy();
		} else {
			this.interruptedView.kill();	
		}
	    this.interruptedView = null;
	}
};
