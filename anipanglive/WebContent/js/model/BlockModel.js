var BlockViewPool = {
	DEBUG_MODE: false,
	_normaList: [], 
	_heartyList: [], 
	_blueList: [], 
	_trianList: [], 
	_screamList: [], 
	_chubbyList: [], 
	_circleList: [], 
	_verticalList: [], 
	_horizontalList: [],
	_animExplodeNormalList: [],
	_animExplodeSpecialList: [],
	_animHintList: [],
	
	getTargetList: function(inType) {
		switch (inType) {
		case EBlockType.NORMA:
			return this._normaList;
		case EBlockType.HEARTY:
			return this._heartyList;
		case EBlockType.BLUE: 
			return this._blueList;
		case EBlockType.TRIAN:
			return this._trianList;
		case EBlockType.SCREAM:
			return this._screamList;
		case EBlockType.CHUBBY:
			return this._chubbyList;
		case EBlockType.CIRCLE:
			return this._circleList;
		case EBlockType.VERTICAL:
			return this._verticalList;
		case EBlockType.HORIZONTAL:
			return this._horizontalList;
		case EBlockAnimation.ANIM_EXPLODE_NORMAL:
			return this._animExplodeNormalList;
		case EBlockAnimation.ANIM_EXPLODE_SPECIAL:
			return this._animExplodeSpecialList;
		case EBlockAnimation.ANIM_HINT:
			return this._animHintList;
		}
		return null;
	},
	
	unloadList: function(inType, inAnim) {
		if (inType === undefined || inType === null) {
			return null;
		}
		
		var targetList = this.getTargetList(inType);
		for (var i = targetList.length - 1; i >= 0; i--) {
			
			if (inAnim !== undefined && inAnim !== null && targetList[i].hasOwnProperty('animations') && targetList[i].animations !== null) {
				targetList[i].animations.stop(inAnim, true);
			}
			targetList[i].isPoolUsing = false;
			targetList[i].visible = false;
		}
	}, 
	
	unloadView: function(inType, inBlockView) {
		
		if (inType === undefined || inType === null) {
			return null;
		}
		
		if (inBlockView === undefined || inBlockView === null) {
			if (this.DEBUG_MODE) {
				console.log('[BlockViewPool (unloadView)] unload fail, inBlockView is null - type: ' + inType);
			}
			return null;
		}

		
		inBlockView.visible = false;
		if (this.DEBUG_MODE) {
			console.log('[BlockViewPool (unloadView)] will unload - inType: ' + inType);
		}
		var targetList = this.getTargetList(inType);
		if (targetList === null) {
			return false;
		}
		
		var currentIndex = -1;
		if (inBlockView.poolIndex === undefined || inBlockView.poolIndex === null || inBlockView.poolIndex === -1) {
			currentIndex = targetList.indexOf(inBlockView);	
			if (this.DEBUG_MODE) {
				console.log('[BlockViewPool (unloadView)] no poolIndex - index: ' + currentIndex);
			}
		} else {
			currentIndex = inBlockView.poolIndex;
			if (this.DEBUG_MODE) {
				console.log('[BlockViewPool (unloadView)] poolIndex exist - index: ' + currentIndex);
			}
		}
		
		if (currentIndex >=  0 && currentIndex < targetList.length) {
			if (this.DEBUG_MODE) {
				//console.log('[BlockViewPool (unloadView)] unload success- index: ' + currentIndex + ', type: ' + inType);	
			}
			
			//targetList[currentIndex].frame = 0;
			if (targetList[currentIndex] === undefined || targetList[currentIndex] === null) {
				if (this.DEBUG_MODE) {
					console.log('[BlockViewPool (unloadView)] failed: no view in pool - index: ' + currentIndex);
				}
				return false; 
			}
			
			targetList[currentIndex].isPoolUsing = false;
			return true;
		}

		if (this.DEBUG_MODE) {
			console.log('[BlockViewPool (unloadView)] unload fail- type: ' + inType + ', key: ' + inBlockView.key);	
		}
		
		return false;
	},
	
	loadView: function(inType, inContext, inX, inY, inKey, inFrame, inGroup) {
		
		if (inType === undefined || inType === null) {
			return null;
		}
		
		if (inContext === undefined || inContext === null) {
			return null;
		}
		
		// inType에 따라 리스트에 사용가능한 view가 있는지 확인
		var targetList = this.getTargetList(inType);
		if (targetList === null) {
			return null;
		}

		var resultBlockView = null;
		for (var index = 0; index < targetList.length; index++) {
			if (targetList[index].isPoolUsing === false) {
				if (this.DEBUG_MODE) {
					//console.log('[BlockViewPool (loadView)] load from list - index: ' + index + ', type: ' + inType + ', list length: ' + targetList.length);
				}
				resultBlockView = targetList[index];
				break;
			}
		}
		
		if (resultBlockView === null) {
			// view가 없다면 생성
			resultBlockView = inContext.game.add.sprite(inX, inY, inKey, inFrame, inGroup);
			targetList.push(resultBlockView);
			if (this.DEBUG_MODE) {
				console.log('[BlockViewPool (loadView)] create - type: ' + inType + ', list length: ' + targetList.length);
			}
		} else {
			resultBlockView.x = inX;
			resultBlockView.y = inY;
			if (inFrame) {
				resultBlockView.frameName = inFrame;	
			} else {
				resultBlockView.frame = 0;
			}
			
		}

		if (resultBlockView.parent !== inGroup) {
			resultBlockView.parent.remove(resultBlockView);
			
			if (inGroup) {
				inGroup.add(resultBlockView);
			} else {
				inContext.scene.add(resultBlockView);
			}
		}
		
		// view가 있다면 사용 반환하면서 커스텀 플래그 셋
		resultBlockView.isPoolUsing = true;
		resultBlockView.visible = true;
		resultBlockView.poolIndex = targetList.indexOf(resultBlockView);
		return resultBlockView;
	}, 
	
	init: function() {
		while(this._normaList.length > 0) {
			this._normaList.shift().kill();
		}
		while(this._heartyList.length > 0) {
			this._heartyList.shift().kill();
		}
		while(this._blueList.length > 0) {
			this._blueList.shift().kill();
		}
		while(this._trianList.length > 0) {
			this._trianList.shift().kill();
		}
		while(this._screamList.length > 0) {
			this._screamList.shift().kill();
		}
		while(this._chubbyList.length > 0) {
			this._chubbyList.shift().kill();
		}
		while(this._circleList.length > 0) {
			this._circleList.shift().kill();
		}
		while(this._verticalList.length > 0) {
			this._verticalList.shift().kill();
		}
		while(this._horizontalList.length > 0) {
			this._horizontalList.shift().kill();
		}
		while(this._animExplodeNormalList.length > 0) {
			this._animExplodeNormalList.shift().kill();
		}
		while(this._animExplodeSpecialList.length > 0) {
			this._animExplodeSpecialList.shift().kill();
		}
		while(this._animHintList.length > 0) {
			this._animHintList.shift().kill();
		}
	}
};

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
		BLOCK_DROP 	: 0.15
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
	
	this.interruptedView = this.viewContext.game.add.sprite(this.view.x, this.view.y, 'interruptIce', 'ice_nodetail.png', this.viewContext.scene.fGameBoard);
	this.interruptedView.anchor.setTo(0.5, 1.0);
	return this.interruptedView;
};
	
BlockModel.prototype.createView = function(inRow, inTouchCallback, inCallbackContext) {
	if (this.viewContext === null) {
		return null;
	}
	
	this.view = BlockViewPool.loadView(this.type, this.viewContext, this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard)
	//this.view = this.viewContext.game.add.sprite(this.position.x, -1 * InGameBoardConfig.BLOCK_HEIGHT * (InGameBoardConfig.ROW_COUNT - inRow - 1), 'blocks', this.getImageKeyname(), this.viewContext.scene.fGameBoard);
	//this.view.width = InGameBoardConfig.BLOCK_WIDTH;
	//this.view.height = InGameBoardConfig.BLOCK_HEIGHT;
	
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
	}
	
	if(this.view !== null && this.state === EBlockState.NORMAL){
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
				}
			}.bind(this));
		}
		else{
			this.isDrop = false;
		}
	}
};

BlockModel.prototype.removeBlock = function(animationName) {
	if (this.isInterrupted === true) {
		return;
	}
	
	this.setBlockState(EBlockState.ANIMATION);
	
	//var blockMatchAnim = this.viewContext.add.sprite(this.view.x, this.view.y, animationName ,null, this.viewContext.scene.fGameBoard);
	var blockMatchAnim = BlockViewPool.loadView(animationName, this.viewContext, this.position.x, this.position.y, animationName, null, this.viewContext.scene.fGameBoard);
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
		this.viewContext.time.events.add(0, function(){
			this.removeAnimation(blockMatchAnim, animationName);
		}.bind(this, blockMatchAnim, animationName));
	}
	//blockMatchAnim.anchor.setTo(0.5, 0.5);
	blockMatchAnim.visible = false;
	this.isMoveAndMatch = true;

	this.isTwoMatched = false;
	this.isSwapped = false;
	this.isDrop = false;
	
	blockMatchAnim.animations.currentAnim.onComplete.removeAll();
	blockMatchAnim.animations.currentAnim.onComplete.add(function(){
		this.setBlockState(EBlockState.REMOVE);
		
		if(this.view !== undefined && this.view !== null){
			// unload Explode Anim
			BlockViewPool.unloadView(animationName, blockMatchAnim);	
			
			//this.view.kill();
			this.view= null;	
			blockMatchAnim = null;
		}

		this.type = EBlockType.NONE;
		this.slidVelocity = ESlideVelocity.BLOCK_NONE;
		this.isMoveAndMatch = false;
		this.isInterrupted = false;
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
		var cloneView = this.viewContext.game.add.image(this.view.world.x, this.view.world.y, 'light');
		//var cloneView = BlockViewPool.loadView(this.type, this.viewContext, this.position.x, this.position.y + this.viewContext.scene.fGameBoard.y, 'blocks', this.getImageKeyname(), this.viewContext.scene);
		this.viewContext.moveSpriteByQuadraticBezierCurve(cloneView, fromPosition, centralPosition, toPosition, 350, function(){
//			if(inParams[1] !== undefined && inParams[1] !== null){
//				//BlockViewPool.unloadView(inParams[0], inParams[1]);
//				cloneView.kill();
//				cloneView = null;
//			}
			cloneView.kill();
			cloneView = null;
		}.bind(this,cloneView/*, [this.type, cloneView]*/) );
	}
	
	if(this.view !== undefined && this.view !== null){
		
		if(animationName === EBlockAnimation.ANIM_EXPLODE_NORMAL){
			blockMatchAnim.visible = true;
			BlockViewPool.unloadView(this.type, this.view);
			this.view= null;
			this.view = blockMatchAnim;
			blockMatchAnim.animations.play(animationName,40,false);
		}
		else{
			this.viewContext.time.events.add(this.specialDelayTime*60, function(){
				blockMatchAnim.visible = true;
				BlockViewPool.unloadView(this.type, this.view);
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
	
	if(this.view !== undefined && this.view !== null){
		this.isMoveAndMatch = false;
		this.isDrop = false;
		BlockViewPool.unloadView(this.type, this.view);
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
