function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function() {
	
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
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
			this.board[rowIndex][colIndex] = new Chip(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EChipType.NONE);	
		}
	}
	
	//오셀로 시작 할 경우 4개의 칩이 세팅되어 있는 부분
	this.board[3][3].changeType(EChipType.BLACK);
	this.board[4][4].changeType(EChipType.BLACK);
	this.board[3][4].changeType(EChipType.WHITE);
	this.board[4][3].changeType(EChipType.WHITE);
	
	this.findAvailArea();
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
				this.checkRound(rowIndex, colIndex, curTurnType);
			}
		}
	}
};

InGame.prototype.roundArray = [{x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1}, {x:-1, y:0}, 
                               {x:1, y:0}, {x:-1, y:1}, {x:0, y:1}, {x:1, y:1},];

InGame.prototype.checkRound = function(curRow, curCol, curType){
	var miniChipType = (this.currentTurn == ETurn.BLACK)? EChipType.MINIBLACK:EChipType.MINIWHITE;
	
	for(var i=0; i < this.roundArray.length; i++){
		var cx = curRow + this.roundArray[i].x;
		var cy = curCol + this.roundArray[i].y;
		var rcx = curRow + (this.roundArray[i].x*-1);
		var rcy = curCol + (this.roundArray[i].y*-1);
		
		if(StzGameConfig.ROW_COUNT <= cx || cx < 0 || StzGameConfig.COL_COUNT <= cy || cy < 0 ){
			continue;
		}
		
		if(this.board[cx][cy].getType() === EChipType.NONE){
			if(this.board[rcx][rcy].getType() == curType){
				
				this.board[cx][cy].changeType(miniChipType);
				
			}
		}
	}
};