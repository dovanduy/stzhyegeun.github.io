/**
 * @유영선 리스트박스 컨트롤러 (현재 세로 모드만 구현)
 * 현재 리더보드만을 위한 리스트 박스로 되어 잇고 추후 확장성 있게 수정 예정
 */
var EListType ={
		VERTICAL_LISTVIEW 			: 'VERTICAL_LISTVIEW',
		HORIZONTAL_LISTVIEW 		: 'HORIZONTAL_LISTVIEW',
	
		VERTICAL_SWAPVIEW 			: 'VERTICAL_SWAPVIEW',
		HORIZONTAL_SWAPVIEW  		: 'HORIZONTAL_SWAPVIEW',
} ;

function ListBoxController (inGame,listDataArray, itemGroup, listData) {
	// delegates
	this.onDragDown = null;
	this.onDragUP = null;
	this.preMoveTweenCallback = null;
	this.postMoveTweenCallback = null;
	this.onUpdate = null;
	
	this.inGame = inGame;
	
	this.sprite = this.inGame.add.sprite(0, 0, null);
	this.fItemList = itemGroup;
	//mask : 실제 리스트에 보여지는 화면
	var mask = this.inGame.add.graphics(0, 0);
	mask.beginFill(0xffffff);
    mask.drawRect(listData.maskRect.x, listData.maskRect.y, listData.maskRect.width, listData.maskRect.height);
	this.sprite.mask = mask;
	//실제 터치가 되는 영역
	var spriteHitRect = new Phaser.Rectangle(listData.hitRect.x, listData.hitRect.y, listData.hitRect.width, listData.hitRect.height);
	this.totalList = listDataArray;
	this.listType = listData.listType;
	this.listOffset = listData.listOffset;
	
	this.sprite.hitArea = spriteHitRect;
	inGame.world.bringToTop(this.sprite);
	
    this.sprite.events.onDragUpdate.add(this.dragUpdate, this);
	this.sprite.events.onInputUp.add(this.stopDrag, this);
	this.sprite.events.onInputDown.add(this.startDrag, this);
	
	this.listSize = listData.listSize;

	this.sprite.visible = false;
	this.sprite.addChild(this.fItemList);
	
	this.start = {x:0,y:0};
	//인덱스 0의 좌표의 시작을 0이 아니게 시작할 필요가 있는경우 사용
	this.listStartPos = (listData.listStartPos !== undefined)? listData.listStartPos:-1;
	//인덱스 마지막 다음 위치에 빈공간이 필요한 경우 사용
	this.listLastPos = (listData.listLastPos !== undefined)? listData.listLastPos:-1;

	//리스트에 addChild한 리스트
	this.drawingList = [];
	this.drawingLength = 0;
	//화면의 맥스 크기 (수평, 수직에 따라 데이터가 다름)
	this.viewMaxSize = (this.listType === EListType.VERTICAL_LISTVIEW || this.listType === EListType.VERTICAL_SWAPVIEW)? this.sprite.mask.height:this.sprite.mask.width;
	
	//item의 총 크기
	if(this.listType === EListType.VERTICAL_LISTVIEW || this.listType === EListType.VERTICAL_SWAPVIEW){
		this.maxSize = (this.listLastPos !== -1)?	this.listLastPos : (this.totalList.length - 1)*this.listSize;
	}
	else{
		this.maxSize = (this.listLastPos !== -1)?	this.listLastPos : (this.totalList.length)*this.listSize;
	}
	
	//리스트에 addChild하는 최대 아이템 개수
	if(listData.drawingListMaxCount !== undefined){
		this.drawingListMaxCount = listData.drawingListMaxCount;
	}
	else{
		this.drawingListMaxCount = Math.round(this.viewMaxSize/this.listSize)*5;		
		this.drawingListMaxCount = (this.drawingListMaxCount%2 === 0)? this.drawingListMaxCount:++this.drawingListMaxCount;
	}
	
	this.isDrag = false;
	//수직, 수평 리스트 구분
	this.pos = (this.listType === EListType.VERTICAL_LISTVIEW || this.listType === EListType.VERTICAL_SWAPVIEW)? 'y':'x';
	this.reversPos = (this.listType === EListType.VERTICAL_LISTVIEW || this.listType === EListType.VERTICAL_SWAPVIEW)? 'x':'y';
	//리스트 박스인지, 스왑뷰인지의 구분
	this.isSwapView = (this.listType === EListType.HORIZONTAL_SWAPVIEW || this.listType === EListType.VERTICAL_SWAPVIEW)? true:false;
	
	//다음 리스트로 넘어가는 기준값
	if(this.isSwapView === true){
		this.swapOffset = this.listSize*0.05;
	}
}
/**
 * 위로 드래그 할 경우 리스트 삭제/생성 하는부분 아래 쪽 드래그 랑 동일
 */
ListBoxController.prototype.createUpListItem = function(){
	var count = 0;
	var endIndex = 0;
	
	var curFirstIndex = 0;

	if(this.drawingList[0] && this.drawingList[0].index === 0){
		StzLog.print('UP 가장 위에 인덱스 0');
		return;
	}
	this.isDrag = false;
	
	if(this.drawingList.length === this.drawingListMaxCount){
		for(var i =this.drawingListMaxCount/2; i < this.drawingListMaxCount; i++){
			this.drawingList[i].item.destroy();
		}
		this.drawingList.splice(this.drawingListMaxCount/2, this.drawingListMaxCount/2);
		curFirstIndex = this.drawingList[0].index;
	}
	
	if(this.drawingList.length !== 0){
		curFirstIndex = this.drawingList[0].index - 1;
	}
	
	for (var index = curFirstIndex - 1; index >= 0; index--) {
		if(this.drawingList.length + (++count) > this.drawingListMaxCount - 1){
			endIndex = index + 1;
			break;
		}
		
		if(index === 0){
			endIndex = index;
		}
	}
	
	if(this.onDragUP){
		this.onDragUP(curFirstIndex, endIndex, this.drawingList);
	}
};

/**
 * 왼쪽 드래그 할 경우 리스트 삭제/생성 하는부분 아래 쪽 드래그 랑 동일
 */
ListBoxController.prototype.createLeftListItem = function(){
	var count = 0;
	var endIndex = 0;
	
	var curFirstIndex = 0;

	if(this.drawingList[0] && this.drawingList[0].index === 0){
		StzLog.print('UP 가장 위에 인덱스 0');
		return;
	}
	this.isDrag = false;
	//뒷쪽 부분 삭제
	if(this.drawingList.length === this.drawingListMaxCount){
		for(var i =this.drawingListMaxCount/2; i < this.drawingListMaxCount; i++){
			this.curSwapNum++;
			this.drawingList[i].item.destroy();
		}
		this.drawingList.splice(this.drawingListMaxCount/2, this.drawingListMaxCount/2);
		curFirstIndex = this.drawingList[0].index;
	}
	
	if(this.drawingList.length !== 0){
		curFirstIndex = this.drawingList[0].index - 1;
	}
	
	for (var index = curFirstIndex - 1; index >= 0; index--) {
		if(this.drawingList.length + (++count) > this.drawingListMaxCount - 1){
			endIndex = index + 1;
			break;
		}
		
		if(index === 0){
			endIndex = index;
		}
	}
	//삭제된 만큼 앞쪽에 추가
	if(this.onDragUP){
		this.onDragUP(curFirstIndex, endIndex, this.drawingList);
	}
};

/**
 * 리스트를 아래로 드래그 할 경우 위쪽 리스트 삭제 하고 아래 리스트 추가 하는 부분
 */
ListBoxController.prototype.createDownListItem = function(){
	var count = 0;
	var endIndex = 0;

	var curLastIndex = 0;
	
	if(this.drawingList[this.drawingList.length - 1] && this.drawingList[this.drawingList.length - 1].index === this.totalList.length - 1){
		StzLog.print('Down 가장 아래 인덱스');	
		return;
	}
	
	this.isDrag = false;
	
	//현재 리스트 개수 30개로 고정 (추후 수정)
	//현재 리스트 기준 앞쪽 15개 삭제 
	if(this.drawingList.length === this.drawingListMaxCount){
		for(var i =0; i < this.drawingListMaxCount/2; i++){
			this.drawingList[i].item.destroy();
		}
		this.drawingList.splice(0, this.drawingListMaxCount/2);
	}
	
	if(this.drawingList.length !== 0){
		curLastIndex = this.drawingList[this.drawingList.length - 1].index + 1;
	}
	
	for (var index = curLastIndex; index < this.totalList.length; index++) {
		if(this.drawingList.length + (++count) > this.drawingListMaxCount){
			break;
		}
	}
	
	endIndex = index;
	//현재 리스트 기준 뒷쪽 15개 추가 하는 부분
	if(this.onDragDown){
		this.onDragDown(curLastIndex, endIndex, this.drawingList);
	}
};

/**
 * 리스트를 오른로 드래그 할 경우 위쪽 리스트 삭제 하고 아래 리스트 추가 하는 부분
 */
ListBoxController.prototype.createRigthListItem = function(){
	var count = 0;
	var endIndex = 0;

	var curLastIndex = 0;
	
	if(this.drawingList[this.drawingList.length - 1] && this.drawingList[this.drawingList.length - 1].index === this.totalList.length - 1){
		StzLog.print('Down 가장 아래 인덱스');	
		return;
	} 
	
	this.isDrag = false;
	
	//현재 리스트 개수
	//현재 리스트 기준 앞쪽에서 총 개수의 반을 삭제
	if(this.drawingList.length === this.drawingListMaxCount){
		for(var i =0; i < this.drawingListMaxCount/2; i++){
			this.drawingList[i].item.destroy();
		}
		this.drawingList.splice(0, this.drawingListMaxCount/2);
	}
	
	if(this.drawingList.length !== 0){
		curLastIndex = this.drawingList[this.drawingList.length - 1].index + 1;
	}
	
	for (var index = curLastIndex; index < this.totalList.length; index++) {
		if(this.drawingList.length + (++count) > this.drawingListMaxCount){
			break;
		}
	}
	
	endIndex = index;
	//현재 리스트 기준 뒷쪽으로 지워진 만큼 다시 추가 하는 부분 (콜백으로 설정) -> 확장성 있게 만들기 위해서
	if(this.onDragDown){
		this.onDragDown(curLastIndex, endIndex, this.drawingList);
	}
};

/**
 * 리스트 업데이트 하는 부분 (현재 생성된 리스트를 업데이트)
 * @param drawingList 현재 생성된 리스트
 */
ListBoxController.prototype.updateItem = function(drawingList){
	this.drawingList = drawingList;
	this.drawingLength = this.drawingList.length;
	this.isDrag = true;

	this.sprite.hitArea[this.pos] = drawingList[0].item.position[this.pos];
	
	
	this.sprite.hitArea[(this.pos === 'x')? 'width':'height'] = drawingList[drawingList.length -1].item.position[this.pos] + ((this.pos === 'x')?this.listSize:0);		//this.sprite[this.pos];
};

ListBoxController.prototype.getSprite = function(){
	return this.sprite;
};

/**
 * 
 * @param inVisible	리스트 isVisisble
 * @param inDrag    리스트의 dragEvetnt on/off
 */
ListBoxController.prototype.setDrag = function(inVisible){
	//항상 사용전에 true 하고 사용 후에 반드시 false로 해야함
	if(inVisible){
		this.sprite.visible = true;
		this.sprite.inputEnabled = true;
        if(this.sprite.input){
            this.sprite.input.enableDrag();
        }

	}
	else{
		this.sprite.visible = false;
		this.sprite.inputEnabled = false;
        if(this.sprite.input){
            this.sprite.input.disableDrag();
        }

	}
};

ListBoxController.prototype.setInputEnable = function(inVisible){
	//항상 사용전에 true 하고 사용 후에 반드시 false로 해야함
	if(inVisible){
		this.sprite.inputEnabled = true;
        if(this.sprite.input){
            this.sprite.input.enableDrag();
        }

	}
	else{
		this.sprite.inputEnabled = false;
        if(this.sprite.input){
            this.sprite.input.disableDrag();
        }
	}
};

ListBoxController.prototype.startDrag = function(sprite, pointer) {
	//console.log("마우스 다운");
	if(this.isDrag === false){
		return;
	}

	this.start[this.pos] = sprite[this.pos];
};

ListBoxController.prototype.movePrevPosition = function() {
	this.leftAndUpMoveCheckSprite(this.sprite);
	this.listMoveTween(--this.curSwapNum, false);
};

ListBoxController.prototype.moveNextPosition = function() {
	this.listMoveTween(++this.curSwapNum, false);
	this.rightAndDownMoveCheckSprite(this.sprite);
};

ListBoxController.prototype.dragUpdate = function(sprite) {
	//console.log('마우스오버');
	sprite[this.reversPos] = 0;

	if(this.isDrag === false){
		return;
	}
	
	if(this.onUpdate){
		this.onUpdate();
	}
	
	if(this._isCheckPosZeroAndMax(sprite) === false){
		return;
	}

	if(this.start[this.pos] >= sprite[this.pos]){
		//현재 생성된 item의 가장 아래쪽으로 드래그 됬을 경우
		this.rightAndDownMoveCheckSprite(sprite);
	}
	else{
		//현재 생성된 item의 가장 위쪽으로 드래그 됬을 경우
		this.leftAndUpMoveCheckSprite(sprite);
	}

	this.start[this.pos] = sprite[this.pos];
};

ListBoxController.prototype.rightAndDownMoveCheckSprite = function(sprite) {
	if(Math.abs(sprite[this.pos] - this.viewMaxSize) > Math.abs(this.drawingList[this.drawingLength - 1].item.position[this.pos])){
		StzLog.print('오른쪽 마지막');	
		if(this.pos == 'x'){
			this.createRigthListItem();
		}
		else{
			this.createDownListItem();
		}
	}
	StzLog.print('오른쪽');
	this.isRight = true;
};

ListBoxController.prototype.leftAndUpMoveCheckSprite = function(sprite) {
	if(Math.abs(sprite[this.pos] - this.listSize) < Math.abs(this.drawingList[2].item.position[this.pos])){
		StzLog.print('왼쪽 마지막');
		if(this.pos == 'x'){
			this.createLeftListItem();
		}
		else{
			this.createUpListItem();
		}
	}
	StzLog.print('왼쪽');
	this.isRight = false;
};

ListBoxController.prototype.stopDrag = function(sprite, pointer) {
	if(this.isDrag === false){
		return;
	}
	
	if(this._isCheckPosZeroAndMax(sprite, function(){
		if(this.isSwapView === true){
			if(this.listLastPos === -1){
				//여기부분 수정 예정
				this.listMoveTween(this.drawingList.length - 1);
			}
			else{
				this.listMoveTween(this.drawingList.length - 2);
			}
		}
	}.bind(this)) === false){
		return;
	}

	//스왑뷰 구현
	if(this.isSwapView === true){
		//스왑뷰의 시작 점이 drawingList의 첫번째 와 다른 경우 예외처리 (오른쪽 이동 할 때)
		//drawingList 처음 이 0 이 아니거라 listStartPos보다 크면 따로 예외처리 하는 부분
		if(this.isRight === true && this.listStartPos !== -1){
			if(this.listStartPos + this.swapOffset < -sprite[this.pos] && -sprite[this.pos] < this.listStartPos + this.listSize){
				this.listMoveTween(0);
				return;
			}
			else if(this.listStartPos < -sprite[this.pos]  && -sprite[this.pos] < this.listStartPos + this.listSize){
				this.listMoveTween(-1);
				return;
			}
		}
		
		for(var i =0; i < this.drawingList.length; i++){
			
			//오른쪽 이동 일 경우 트윈 발생
			if(this.isRight === true){
				//25 : 스왑뷰 반응의 민감도 수치 (25만큼 더 이동해야 다음으로 넘어감)
				if(this.drawingList[i].item.position[this.pos] +this.swapOffset < -sprite[this.pos] && this.drawingList[i+1].item.position[this.pos] > -sprite[this.pos]){
					this.listMoveTween(i+1);
					return;
				}
				else if(this.drawingList[i].item.position[this.pos] < -sprite[this.pos] && this.drawingList[i+1].item.position[this.pos] > -sprite[this.pos]){
					this.listMoveTween(i);
					return;
				}
			}
			//왼쪽 이동 일 경우 트윈 발생
			else{
				//스왑뷰의 시작 점이 drawingList의 첫번째 와 다른 경우 예외처리 (왼쪽 이동 할 때)
				//drawingList 처음 이 0 이 아니거라 listStartPos보다 크면 따로 예외처리 하는 부분
				if(i-1 < 0 && this.listStartPos === -1) {
					continue;
				}
				else if(i-1 < 0 && this.listStartPos !== -1){
					if(this.drawingList[i].item.position[this.pos] - this.swapOffset > -sprite[this.pos]){
						this.listMoveTween(-1);
						return;
					}
					else if(this.drawingList[i].item.position[this.pos] > -sprite[this.pos]){
						this.listMoveTween(0);
						return;
					}
					
					continue;
				}

				//25 : 스왑뷰 반응의 민감도 수치 (25만큼 더 이동해야 다음으로 넘어감)
				if(this.drawingList[i].item.position[this.pos] -this.swapOffset > -sprite[this.pos] && this.drawingList[i-1].item.position[this.pos] < -sprite[this.pos]){
					this.listMoveTween(i-1);
					return;
				}
				else if(this.drawingList[i].item.position[this.pos] > -sprite[this.pos] && this.drawingList[i-1].item.position[this.pos] < -sprite[this.pos]){
					this.listMoveTween(i);
					return;
				}
			}
			
		}
	}
};

/**
 * 리스트의 시점을 이동 시키는 함수
 * @param index 이동 할 인덱스
 * //@note 유영선 추후 수정 
 */
ListBoxController.prototype.movePostion = function(index, isZero){
	var meIndex = index;

	if(!isZero){
		isZero = false;
	}
	
	if(this.isSwapView === true){
		//현재 포커싱 되어있는 swap 이미지 번호 
		//[공룡볼] 공선택 창 맨처음 빈공간 하드코딩으로 인한 불필요 한 작업 추후 개선 예정
		if(isZero === true){
			this.curSwapNum = -1;
		}
		else{
			this.curSwapNum = meIndex;
		}
	}
	
	for(var i =0; i < this.drawingList.length; i++){
		if(this.drawingList[i].index === meIndex){
			if(meIndex === 0 && this.listStartPos !== -1 && isZero === true){
				this.sprite[this.pos] = this.listStartPos;
			}
			else{
				this.sprite[this.pos] = -this.drawingList[i].item.position[this.pos]  + this.listOffset;
			}

			if(this.isSwapView && this.preMoveTweenCallback){
				this.preMoveTweenCallback(i, isZero);
			}
			
			if(this._isCheckPosZeroAndMax(this.sprite) === false){
				return;
			}
		}
	}
	
	
};

/**
 * 마우스 이동에 따른 화면의 트윈 (swap View)
 * @param curNum 몇번째 인덱스로 이동 할 것인지
 */
ListBoxController.prototype.listMoveTween = function(curNum, isDrag){
	if(this.isSwapView === true){
		//현재 포커싱 되어있는 swap 이미지 번호 
		this.curSwapNum = curNum;
	}
	
	var moveIndex = curNum;
	if(this.totalList.length*this.listSize < this.viewMaxSize){
		return;
	}
	if(isDrag === false){
		this.isDrag = isDrag;
	}
	
	if(curNum < 0){
		if(this.isSwapView && this.preMoveTweenCallback){
			this.preMoveTweenCallback(0, true);
		}
			
		this.inGame.add.tween(this.sprite).to({x:-(this.drawingList[0].item.position[this.pos] - this.listSize)}, 500, 'Quart.easeOut', true)
		.onComplete.addOnce(function() {
			this.sprite.hitArea[this.pos] =  this.listOffset -this.sprite[this.pos];
			this.isDrag = true;
		}.bind(this));
		if(this.curSwapNum < -1){
			this.curSwapNum++;
		}
		
		return;
	}
	
	if(curNum >= this.drawingList.length-1 && this.listLastPos !== -1){
		this.isDrag = true;
		this.curSwapNum--;
		return;
	}
	

	//this.isDrag = false;
	for(var i =0; i < this.drawingList.length; i++){
		if(i === moveIndex){
			if(this.preMoveTweenCallback){
				this.preMoveTweenCallback(moveIndex, false);
			}
			if(this.pos === 'x'){
				if(this.drawingList[i].item.position[this.pos] > this.maxSize){

					this.inGame.add.tween(this.sprite).to({x:-(this.totalList.length*this.listSize -this.viewMaxSize)}, 500, 'Quart.easeOut', true)
					.onComplete.addOnce(function() {
						this.onTweenComplete(this.drawingList[moveIndex].index);
					}.bind(this), moveIndex);
				}
				else{

					this.inGame.add.tween(this.sprite).to({x: -this.drawingList[i].item.position[this.pos]}, 500, 'Quart.easeOut', true)
					.onComplete.addOnce(function() {
						if(this.drawingList[moveIndex]){
							this.onTweenComplete(this.drawingList[moveIndex].index);
						}
					}.bind(this), moveIndex);	
				}		
			}
			else{
				if(this.drawingList[i].item.position[this.pos] > this.maxSize){

					this.inGame.add.tween(this.sprite).to({y:-(this.totalList.length*this.listSize -this.viewMaxSize)}, 500, 'Quart.easeOut', true)
					.onComplete.addOnce(function() {
						this.onTweenComplete(this.drawingList[moveIndex].index);
					}.bind(this), moveIndex);
				}
				else{

					this.inGame.add.tween(this.sprite).to({y: -this.drawingList[i].item.position[this.pos]}, 500, 'Quart.easeOut', true)
					.onComplete.addOnce(function() {
						this.onTweenComplete(this.drawingList[moveIndex].index);
					}.bind(this), moveIndex);	
				}		
			}
		}
	}	
};

ListBoxController.prototype.onTweenComplete = function(moveIndex) {
	//this.sprite.hitArea[this.pos] = this.listOffset -this.sprite[this.pos];
	
	//this.isDrag = true;
	if(this.postMoveTweenCallback){
		this.postMoveTweenCallback(moveIndex, false);
	}
	
	if(this.isDrag === false){
		this.isDrag = true;
	}
};

ListBoxController.prototype.allDisableVisible = function() {
	if(this.drawingList){
		for(var i=0; i < this.drawingList.length; i++){
			this.drawingList[i].item.visible = false;
		}
	}
};

ListBoxController.prototype.onClose = function(isDestroy) {
	if(this.drawingList){
		if(isDestroy === undefined || isDestroy === true){
			for(var i=0; i < this.drawingList.length; i++){
				this.drawingList[i].item.destroy();
			}
		}
		
		this.drawingList = [];
	}
};

ListBoxController.prototype.destroy = function() {
	if(this.sprite){
		this.sprite.destroy();
		this.sprite = null;
	}
	
	if(this.totalList){
		this.totalList = [];
		this.totalList = null;
	}
	
	if(this.drawingList){
		this.drawingList = [];
		this.drawingList = null;
	}
};

ListBoxController.prototype._isCheckPosZeroAndMax = function(sprite, inCallback){
	if(sprite[this.pos] > 0 || this.totalList.length*this.listSize < this.viewMaxSize){
		sprite[this.pos] = 0;
		return false;
	}

	//총 item의 가장 아래쪽으로 드래그 됬을 경우 (생성된 리스트 말고 총 item 기준)
	if(Math.abs(sprite[this.pos] - this.viewMaxSize) >= this.maxSize + ((this.pos === 'x')? 0:this.listSize)){
		StzLog.print('리스트 정말 마지막');	
		sprite[this.pos] = -this.maxSize + this.viewMaxSize  - ((this.pos === 'x')? 0:this.listSize); 
		
		if(inCallback){
			inCallback();
		}
		return false;
	}
	
	return true;
};