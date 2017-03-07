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
		emoticonDown:null
};

InGame.prototype.init = function(data) {
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.myColor = data;
	this.currentTurn = ETurn.BLACK;
};

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.initBoard();
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Block(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EBlockType.NONE);	
		
		}
	}

	//현재 턴이 검은색인 사람 부터 시작 한다
//	if(this.currentTurn === ETurn.BLACK){
//		this.findAvailArea();
//	}
};

InGame.prototype.roundArray = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, 
                               {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1},];

/**
 * 현재 블럭을 놓은 위치를 기준으로 탐색 시작 8방향 탐색 시작
 * @param curRow 	현재 가로
 * @param curCol	현재 세로
 * @param curType	현재 타입
 * @returns Array
 */
InGame.prototype.checkAvailTurn = function(curRow, curCol, curType){
	StzCommon.StzLog.print("[checkAvailTurn] Type : " + curType);
	
	var oppositeType = (curType == ETurn.BLACK)? EBlockType.WHITE:EBlockType.BLACK;
	var oppositeTurn= (curType == ETurn.BLACK)? ETurn.WHITE:ETurn.BLACK;
	
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
			this.board[curRow][curCol].changeType(EBlockType.NONE);	
		}
		
		if(BlockCount === 2){
			threeCount++;
		}
		
			
	}
	
	if(threeCount === 2){
		StzCommon.StzLog.print("삼삼 금지");
		this.board[curRow][curCol].changeType(EBlockType.FORBIDERN);	
	}
	else{
		this.currentTurn = oppositeTurn;
	}
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



