function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype = {
		whilteCount:0,
		blackCount:0,
		myColor:0,
		popupResult:null,
		popupWating:null,
		popupEmoticon:null,
		emoticonUP:null,
		emoticonDown:null,
		forbidernBlocks:[]
};

InGame.prototype.init = function(data) {
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.myColor = data;
	this.currentTurn = ETurn.BLACK;
	
	window.connetCallback[EServerMethod.CHANGE_TURN] = this.responeChangeTurn.bind(this);
	window.connetCallback[EServerMethod.SEND_EMOTICON] = this.responeEmoticon.bind(this);
};

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.popupResult = this.game.plugins.add(new PopupResult(this.game, this, {blind:true}));
	this.popupWating = this.game.plugins.add(new PopupWating(this.game, this, {blind:false}));
	this.popupEmoticon = this.game.plugins.add(new PopupEmoticon(this.game, this, {blind:false, offsetY:300, callbackFunc:function(){
		if(this.popupEmoticon.closeState === EPopupCloseState.CONFIRM){
			this.scene.fBtnEmoticon.alpha = 0.5;
			this.scene.fBtnEmoticon.inputEnabled = false;
		}
	}}));
	
	this.forbidernBlocks = [];
	
	this.emoticonUP = new EmoticonManager(this.game, this, EEmoticonNames.ALL,{scaleX:0.4, scaleY:0.4});
	this.emoticonUP.setPos(450 , 10);
	
	this.emoticonDown = new EmoticonManager(this.game, this, EEmoticonNames.ALL,{scaleX:0.4, scaleY:0.4, callBackFunc:this.onEmoticonComplete});
	this.emoticonDown.setPos(450 , 810);
	
	this.scene.fBtnEmoticon.inputEnabled = true;
	this.scene.fBtnEmoticon.events.onInputUp.add(this.onEmoticon, this);
	
	this.initBoard();
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Block(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EBlockType.NONE);	
		}
	}
};

InGame.prototype.onEmoticonComplete = function(){
	StzCommon.StzLog.print("[InGame] onEmoticonComplete");
	
	this.scene.fBtnEmoticon.alpha = 1;
	this.scene.fBtnEmoticon.inputEnabled = true;
};

InGame.prototype.onEmoticon = function(){
	if(this.popupEmoticon.isOpen === true){
		this.popupEmoticon.popupClose();
	}
	else{
		this.popupEmoticon.popupOpen();
	}
}

InGame.prototype.roundArray = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, 
                               {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1},];

/**
 * 현재 블럭을 놓은 위치를 기준으로 탐색 시작 8방향 탐색 시작
 * @param curRow 	현재 가로
 * @param curCol	현재 세로
 * @param curType	현재 타입
 * @returns boolean
 */
InGame.prototype.checkAvailTurn = function(curRow, curCol, curType){
	StzCommon.StzLog.print("[checkAvailTurn] Type : " + curType);
	
	var oppositeType = (curType == ETurn.BLACK)? EBlockType.WHITE:EBlockType.BLACK;
	
	var threeCount = 0;
	
	for(var i=0; i < this.roundArray.length/2; i++){
		var upX = curRow + this.roundArray[i].x;
		var upY = curCol + this.roundArray[i].y;

		var downX = curRow + this.roundArray[7 - i].x;
		var downY = curCol + this.roundArray[7 - i].y;
		
		var endCount = 0;
		
		var BlockCount = 0;
		
		if(StzGameConfig.ROW_COUNT > upX && upX >= 0 && StzGameConfig.COL_COUNT > upY || upY >= 0 ){
			endCount += this.lineCheck(upX, upY, oppositeType, curType, this.roundArray[i], false);
			BlockCount += this.lineCheck(upX, upY, oppositeType, curType, this.roundArray[i], true);
		}
		
		if(StzGameConfig.ROW_COUNT > downX && downX >= 0 && StzGameConfig.COL_COUNT > downY || downY >= 0 ){
			endCount += this.lineCheck(downX, downY, oppositeType, curType, this.roundArray[7 - i], false);
			BlockCount += this.lineCheck(downX, downY, oppositeType, curType, this.roundArray[7 - i], true);
		}
		
	
		if(endCount === 4){
			StzCommon.StzLog.print("게임 종료");
		}
		
		else if(endCount > 4){
			StzCommon.StzLog.print("6목 이상 금지");
			this.forbidernBlocks.push({curRow:curRow, curCol:curCol});
			this.board[curRow][curCol].changeType(EBlockType.FORBIDERN);
			return false;
		}
		
		if(BlockCount === 2){
			threeCount++;
		}	
	}
	
	if(threeCount === 2){
		StzCommon.StzLog.print("삼삼 금지");
		this.forbidernBlocks.push({curRow:curRow, curCol:curCol});
		this.board[curRow][curCol].changeType(EBlockType.FORBIDERN);
		return false;
	}
	
	return true;
};

InGame.prototype.lineCheck = function(cx, cy, oppositeType, curType, roundData, forbidren){
    var tempx = cx ;
    var tempy = cy ;
    
    var cotinueCount = 0;
    var noneCount = 0;
    
    while(true){
    	if(cotinueCount === 4) {
    		return cotinueCount;
    	}
    	
    	if(StzGameConfig.ROW_COUNT <= tempx || tempx < 0 || StzGameConfig.COL_COUNT <= tempy || tempy < 0 ){
    		if(forbidren === true && noneCount === 0){
    			cotinueCount--;
    		}
    		break;
		}
    	
    	if(forbidren === true){
    		if(this.board[tempx][tempy].getType() === EBlockType.NONE){
    			noneCount++;
    		}
    		
    		if(noneCount === 2){
    			break;
    		}
    	}
        if(this.board[tempx][tempy].getType() === curType){
        	cotinueCount++;
        }
        else if((this.board[tempx][tempy].getType() === EBlockType.NONE && !forbidren)
    			||this.board[tempx][tempy].getType() === oppositeType){
        		if(forbidren === true){
        			cotinueCount--;
        		}
	    			break;
    	}
        
        tempx = tempx + roundData.x;
        tempy = tempy + roundData.y;
    }
    
    return cotinueCount;
};

InGame.prototype.requestChangeTurn = function(rowIndex, colIndex, type){
	var nextTurn = (this.currentTurn === ETurn.BLACK)?ETurn.WHITE:ETurn.BLACK;
	this.currentTurn = nextTurn;
	
	var sendJson = JSON.stringify({
		"method" : 		EServerMethod.CHANGE_TURN, 
		"rowIndex":		rowIndex,
		"colIndex" : 	colIndex, 
		"type" : 		type,
		"nextTurn" : 	nextTurn
	});
	var length = this.forbidernBlocks.length;
	
	for(var i=0;i<length;i++){
		this.board[this.forbidernBlocks.curRow][this.forbidernBlocks.curCol].changeType(EBlockType.NONE);
	}
	
	this.forbidernBlocks = [];
	
	this.popupWating.popupOpen();
	Server.request(sendJson);
};

InGame.prototype.responeChangeTurn = function(data){
	if(data === undefined && data === null) return;
	
	this.popupWating.popupClose();
	this.currentTurn = data.nextTurn;
	this.board[data.rowIndex][data.colIndex].changeType(data.type);	
};

InGame.prototype.requestEmoticon = function(EmoticonName){
	var sendJson = JSON.stringify({
		"method" : 		EServerMethod.SEND_EMOTICON,
		"EmoticonName" : EmoticonName,
	});
	Server.request(sendJson);
};

InGame.prototype.responeEmoticon = function(data){
	 if(data.EmoticonName !== undefined){
		 this.emoticonUP.show(data.EmoticonName);
	 }
};
