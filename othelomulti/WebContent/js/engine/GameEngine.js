GameEngine.prototype = {
		game:null,
		aParent:null,
		autoMiniChipPosArray:null,
};

function GameEngine(inGame, aParent, autoFlag) {
	if(!(this instanceof GameEngine)){
		return new GameEngine(inGame, aParent, borad, autoFlag);
	}

	this.inGame = inGame;
	this.aParent = aParent;
	
}

GameEngine.prototype.roundArray = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, 
                               {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1},];


/**
 *  mini로 지정되어 있는 부분 제거
 */
GameEngine.prototype.removeAvailArea = function(board){
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(board[rowIndex][colIndex].getType() == EChipType.MINIBLACK ||
					board[rowIndex][colIndex].getType() == EChipType.MINIWHITE){
					board[rowIndex][colIndex].changeType(EChipType.NONE);
			}
		}
	}
};

/**
 * 다음 턴의 사람이 이용 가능한 위치를 탐색
 */
GameEngine.prototype.findAvailArea = function(board, currentTurn){
	//검색 할 타입 (현재 턴의 반대 값)
	var checkType = (currentTurn == ETurn.BLACK)? EChipType.WHITE:EChipType.BLACK;
	//현재 타입 (핸재 턴의 값)
	var curTurnType = (currentTurn == ETurn.BLACK)? EChipType.BLACK:EChipType.WHITE;
	
	if(StzGameConfig.AUTO_FLAG === true){
		this.autoMiniChipPosArray = [];
	}
	
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(checkType === board[rowIndex][colIndex].getType()){
				this.checkRound(board, currentTurn, rowIndex, colIndex, checkType, curTurnType);
			}
		}
	}
};

/**
 * 모든 Chip들의 8방향 탐색을 하여 그 위치가 놓을 수 있는 위치인지 탐색
 */
GameEngine.prototype.checkRound = function(board, currentTurn, curRow, curCol, oppositeType, curType){
	var miniChipType = (currentTurn == ETurn.BLACK)? EChipType.MINIBLACK:EChipType.MINIWHITE;
	
	for(var i=0; i < this.roundArray.length; i++){
		var cx = curRow + this.roundArray[i].x;
		var cy = curCol + this.roundArray[i].y;

		if(StzGameConfig.ROW_COUNT <= cx || cx < 0 || StzGameConfig.COL_COUNT <= cy || cy < 0 ){
			continue;
		}
		
		if(board[cx][cy].getType() === EChipType.NONE){
			board[cx][cy].changeType(curType);
		}
		else{
			continue;
		}
		
		var tempArray = this.lineCheck(board, currentTurn, cx, cy, oppositeType, curType, this.roundArray[7 - i]);
		
		if(tempArray === undefined || tempArray == null || tempArray.length === 0) {
			board[cx][cy].changeType(EChipType.NONE);
			continue;
		}
		//라인 탐색 결과에 tempArray 길이 값이 0이 아니면 현재 구역은 놓을 수 있는 구역이라고 미니Chip으로 표시
		board[cx][cy].changeType(miniChipType);
		if(StzGameConfig.AUTO_FLAG === true){
			this.autoMiniChipPosArray.push({x:cx,y:cy});
		}
	}
};

/**
 * roundData의 쪽으로 curType이 있는지 탐색
 * @param cx			현재 row
 * @param cy			현재 col
 * @param oppositeType	현재 타입의 반대 타입
 * @param curType		현재 타입
 * @param roundData		어느 방향 검사 중 인지
 * @returns {Array}		검사를 통과한 Chip
 */
GameEngine.prototype.lineCheck = function(board, currentTurn, cx, cy, oppositeType, curType, roundData){
	var tempx = cx ;
	var tempy = cy ;
	
	var tempArray = [];
	while(true){
		//roundData 방향으로 모든 Chip 타입 검사
		tempx = tempx + roundData.x;
		tempy = tempy + roundData.y;
		
		if(StzGameConfig.ROW_COUNT <= tempx || tempx < 0 || StzGameConfig.COL_COUNT <= tempy || tempy < 0 ){
			tempArray = [];
			return tempArray;
		}
		
		if(board[tempx][tempy].getType() === curType){
			return tempArray;
		}
		
		if(board[tempx][tempy].getType() === oppositeType){
			tempArray.push(board[tempx][tempy]);
		}
		
		if(board[tempx][tempy].getType() === EChipType.NONE
			||board[tempx][tempy].getType() === EChipType.MINIBLACK
			||board[tempx][tempy].getType() === EChipType.MINIWHITE){
			tempArray = [];
			return tempArray;
		}
	}
};

/**
 * 현재 블럭을 놓은 위치를 기준으로 탐색 시작 8방향 탐색 시작
 * @param curRow 	현재 가로
 * @param curCol	현재 세로
 * @param curType	현재 타입
 * @returns Array
 */
GameEngine.prototype.checkReverseChip = function(board, curRow, curCol, curType){
	StzCommon.StzLog.print("[checkAvailTurn] Type : " + curType);
	
	var oppositeType = (curType == ETurn.BLACK)? EChipType.WHITE:EChipType.BLACK;
	var reverseArray = [];
	
	for(var i=0; i < this.roundArray.length; i++){
		var cx = curRow + this.roundArray[i].x;
		var cy = curCol + this.roundArray[i].y;

		if(StzGameConfig.ROW_COUNT <= cx || cx < 0 || StzGameConfig.COL_COUNT <= cy || cy < 0 ){
			continue;
		}
		
		//한 방향 당 라인탐색 시작
		var tempArray = this.lineCheck2(board, cx, cy, oppositeType, curType, this.roundArray[i]);
	
		if(tempArray === undefined || tempArray == null || tempArray.length === 0) continue;
			
		for(var j = 0; j < tempArray.length; j++){
			reverseArray.push(tempArray[j]);
		}
	}

	return reverseArray;
	
};

GameEngine.prototype.lineCheck2 = function(board, cx, cy, oppositeType, curType, roundData){
    var tempx = cx ;
    var tempy = cy ;
    
    var tempArray = [];
    while(true){
        if(board[tempx][tempy].getType() === curType){
            return tempArray;
        }
        
        if(board[tempx][tempy].getType() === oppositeType){
            tempArray.push(board[tempx][tempy]);
        }
        
        if(board[tempx][tempy].getType() === EChipType.NONE
    			||board[tempx][tempy].getType() === EChipType.MINIBLACK
    			||board[tempx][tempy].getType() === EChipType.MINIWHITE){
    			tempArray = [];
    			return tempArray;
    	}

        tempx = tempx + roundData.x;
        tempy = tempy + roundData.y;
        
        if(StzGameConfig.ROW_COUNT <= tempx || tempx < 0 || StzGameConfig.COL_COUNT <= tempy || tempy < 0 ){
            tempArray = [];
            return tempArray;
        }
    }
};

GameEngine.prototype.autoPlay = function(board, currentTurn){
	this.findAvailArea(board, currentTurn);
	
	var bestPosArray = this.checkReversArray();
	
	var length = bestPosArray.length;
	var bX = 0;
	var bY = 0;
	var reverseArray = [];
	
	var reversCount = 0;
	var bestArray = [];
	
	for(var i=0; i<length; i++ ){
		var cX = bestPosArray[i].x;
		var cY = bestPosArray[i].y;
		
		reverseArray = this.checkReverseChip(board, cX, cY, currentTurn);
		if(reversCount < reverseArray.length){
			reversCount = reverseArray.length;
			bestArray = reverseArray;
			bX = cX;
			bY = cY;
		}
	}
	if(bestArray.length === 0){
		return null;
	}
	
	board[bX][bY].changeType(currentTurn);
	
	 for(var i =0; i<bestArray.length; i++){
		 bestArray[i].animationChangeType(currentTurn);
	 }
	 
	 return bestArray;
};
GameEngine.prototype.highPriorityArray = [{x:0,y:0},{x:7,y:0},{x:0,y:7},{x:7,y:7}];

GameEngine.prototype.lowPriorityArray = [{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1}
                                        ,{x:1,y:6},{x:2,y:6},{x:3,y:6},{x:4,y:6},{x:5,y:6},{x:6,y:6}
                                        ,{x:1,y:2},{x:1,y:3},{x:1,y:4},{x:1,y:5}
                                        ,{x:6,y:2},{x:6,y:3},{x:6,y:4},{x:6,y:5}];
GameEngine.prototype.checkReversArray = function(){
	var length = this.autoMiniChipPosArray.length;
	var highLength = this.highPriorityArray.length;
	var lowLength  = this.lowPriorityArray.length;
	
	var bestPosArray = [];
	//highPriorityArray 검사
	
	for(var i=0; i<length; i++ ){
		for(var j=0;j<highLength;j++){
			if(this.autoMiniChipPosArray[i].x === this.highPriorityArray[j].x &&
			  this.autoMiniChipPosArray[i].y === this.highPriorityArray[j].y){
				bestPosArray.push(this.autoMiniChipPosArray[i]);
			}	
		}
	}
	
	if(bestPosArray.length !== 0) return bestPosArray;
	
	for(var i=0; i<length; i++ ){
		for(var j=0;j<lowLength;j++){
			if(this.autoMiniChipPosArray[i].x === this.lowPriorityArray[j].x &&
				this.autoMiniChipPosArray[i].y === this.lowPriorityArray[j].y){
				break;
			}
		}
		
		if(j === lowLength){
			bestPosArray.push(this.autoMiniChipPosArray[i]);
		}
	}
	
	if(bestPosArray.length !== 0) {
		return bestPosArray;
	}

	return this.autoMiniChipPosArray;

};