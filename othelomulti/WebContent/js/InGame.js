function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function(data) {
	
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.currentTurn = data;
};

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.initBoard();
	
	window.peerConn.on('data', function(data){
		 var data = JSON.parse(data);	
		 this.board[data.rowIndex][data.colIndex].changeType(data.type);
		 
		 this.removeAvailArea();
		 this.checkAvailTurn(data.rowIndex, data.colIndex, data.type);
		 this.findAvailArea();
		 
		 this.currentTurn = (data.turn == ETurn.BLACK)?ETurn.WHITE:ETurn.BLACK;
	},this);
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Chip(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EChipType.NONE);	
		}
	}
	
	//오셀로 시작 할 경우 4개의 칩이 세팅되어 있는 부분
	this.board[3][3].changeType(EChipType.BLACK);
	this.board[4][3].changeType(EChipType.WHITE);
	this.board[3][4].changeType(EChipType.WHITE);
	this.board[4][4].changeType(EChipType.BLACK);

	if(this.currentTurn === ETurn.BLACK){
		this.findAvailArea();
	}
};

InGame.prototype.removeAvailArea = function(){
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(this.board[rowIndex][colIndex].getType() == EChipType.MINIBLACK ||
					this.board[rowIndex][colIndex].getType() == EChipType.MINIWHITE){
				this.board[rowIndex][colIndex].changeType(EChipType.NONE);
			}
		}
	}
};

/**
 * 다음 턴의 사람이 이용 가능한 위치를 탐색
 */
InGame.prototype.findAvailArea = function(){
	//검색 할 타입 (현재 턴의 반대 값)
	var checkType = (this.currentTurn == ETurn.BLACK)? EChipType.WHITE:EChipType.BLACK;
	//현재 타입 (핸재 턴의 값)
	var curTurnType = (this.currentTurn == ETurn.BLACK)? EChipType.BLACK:EChipType.WHITE;
	
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(checkType === this.board[rowIndex][colIndex].getType()){
				this.checkRound(rowIndex, colIndex, checkType, curTurnType);
			}
		}
	}
};


InGame.prototype.roundArray = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, 
                               {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1},];

/**
 * curRow, curCol 블럭을 기준은로 8방향 탐색
 */
InGame.prototype.checkRound = function(curRow, curCol, oppositeType, curType){
	var miniChipType = (this.currentTurn == ETurn.BLACK)? EChipType.MINIBLACK:EChipType.MINIWHITE;
	
	for(var i=0; i < this.roundArray.length; i++){
		var cx = curRow + this.roundArray[i].x;
		var cy = curCol + this.roundArray[i].y;

		if(StzGameConfig.ROW_COUNT <= cx || cx < 0 || StzGameConfig.COL_COUNT <= cy || cy < 0 ){
			continue;
		}
		
		if(this.board[cx][cy].getType() === EChipType.NONE){
			this.board[cx][cy].changeType(curType);
		}
		else{
			continue;
		}
		
		var tempArray = this.lineCheck(cx, cy, oppositeType, curType, this.roundArray[7 - i]);
		
		if(tempArray === undefined || tempArray == null || tempArray.length === 0) {
			this.board[cx][cy].changeType(EChipType.NONE);
			continue;
		}

		this.board[cx][cy].changeType(miniChipType);
	}
};

InGame.prototype.checkAvailTurn = function(curRow, curCol, curType){
	StzCommon.StzLog.print("[checkAvailTurn] Type : " + curType);
	
	var oppositeType = (curType == ETurn.BLACK)? EChipType.WHITE:EChipType.BLACK;
	
	for(var i=0; i < this.roundArray.length; i++){
		var cx = curRow + this.roundArray[i].x;
		var cy = curCol + this.roundArray[i].y;

		if(StzGameConfig.ROW_COUNT <= cx || cx < 0 || StzGameConfig.COL_COUNT <= cy || cy < 0 ){
			continue;
		}
		
		var tempArray = this.lineCheck2(cx, cy, oppositeType, curType, this.roundArray[i]);
			
		if(tempArray === undefined || tempArray == null || tempArray.length === 0) continue;
			
		for(var j = 0; j < tempArray.length; j++){
			tempArray[j].changeType(curType);
		}
	}
};

InGame.prototype.lineCheck = function(cx, cy, oppositeType, curType, roundData){
	var tempx = cx ;
	var tempy = cy ;
	
	var tempArray = [];
	while(true){
		
		tempx = tempx + roundData.x;
		tempy = tempy + roundData.y;
		
		if(StzGameConfig.ROW_COUNT <= tempx || tempx < 0 || StzGameConfig.COL_COUNT <= tempy || tempy < 0 ){
			tempArray = [];
			return tempArray;
		}
		
		if(this.board[tempx][tempy].getType() === curType){
			return tempArray;
		}
		
		if(this.board[tempx][tempy].getType() === oppositeType){
			tempArray.push(this.board[tempx][tempy]);
		}
		
		if(this.board[tempx][tempy].getType() === EChipType.NONE
			||this.board[tempx][tempy].getType() === EChipType.MINIBLACK
			||this.board[tempx][tempy].getType() === EChipType.MINIWHITE){
			tempArray = [];
			return tempArray;
		}
	}
};

InGame.prototype.lineCheck2 = function(cx, cy, oppositeType, curType, roundData){
    var tempx = cx ;
    var tempy = cy ;
    
    var tempArray = [];
    while(true){
        if(this.board[tempx][tempy].getType() === curType){
            return tempArray;
        }
        
        if(this.board[tempx][tempy].getType() === oppositeType){
            tempArray.push(this.board[tempx][tempy]);
        }
        
        if(this.board[tempx][tempy].getType() === EChipType.NONE
    			||this.board[tempx][tempy].getType() === EChipType.MINIBLACK
    			||this.board[tempx][tempy].getType() === EChipType.MINIWHITE){
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

InGame.prototype.onSendData = function(rowIndex, colIndex, type, turn){
	var sendJson = JSON.stringify({
		"rowIndex" : rowIndex, 
		"colIndex" : colIndex, 
		"type" : type,
		"turn" : turn
	});
	
	window.peerConn.send(sendJson);
};


