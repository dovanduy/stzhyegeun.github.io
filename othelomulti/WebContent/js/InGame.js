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
		popupWating:null
};
/**
 * 먼저 기다리는 사람이 검은색 (먼저 시작)
 * @param data 현재 턴 
 */
InGame.prototype.init = function(data) {
	
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.myColor = data;
	this.currentTurn = data;
};

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.popupResult = this.game.plugins.add(new PopupResult(this.game, this, {blind:true}));
	this.popupWating = this.game.plugins.add(new PopupWating(this.game, this, {blind:false}));
	//this.popupResult.popupOpen();
	this.initBoard();
	
	this.txtWhiteCount = this.game.add.bitmapText(this.scene.fWhiteChipSmall.x + this.scene.fWhiteChipSmall.width + 30, 
			this.scene.fWhiteChipSmall.y + this.scene.fWhiteChipSmall.height/2 + 10, 
			'textScoreFont', '0', 35);
	this.txtWhiteCount.anchor.set(0.5, 0.5);
	
	this.txtBlackCount = this.game.add.bitmapText(this.scene.fBlackChipSmall.x + this.scene.fBlackChipSmall.width + 30, 
			this.scene.fBlackChipSmall.y + this.scene.fBlackChipSmall.height/2 + 10, 
			'textScoreFont', '0', 35);
	this.txtBlackCount.anchor.set(0.5, 0.5);

	this.scene.fGroupUI.add(this.txtWhiteCount);
	this.scene.fGroupUI.bringToTop(this.txtWhiteCount);
	this.scene.fGroupUI.add(this.txtBlackCount);
	this.scene.fGroupUI.bringToTop(this.txtBlackCount);
	
	this.countingChip();
	window.peerConn.on('data', function(data){
		 this.popupWating.popupClose();
		 
		 if(data === "END"){
			var winerChip = (this.whilteCount >= this.blackCount)?ETurn.WHITE:ETurn.BLACK;
			var count = (this.myColor === ETurn.BLACK)?this.blackCount:this.whilteCount;	
			this.popupResult.setData(this.myColor, winerChip, count);
				
			 this.popupResult.popupOpen();
			 return;
		 }
		
		 var data = JSON.parse(data);	
		 this.board[data.rowIndex][data.colIndex].changeType(data.type);
	
		 this.removeAvailArea();
		 this.checkAvailTurn(data.rowIndex, data.colIndex, data.type);
		 
		 //현재 턴이 내 차례인 경우
		 this.isTurn = true;
		 this.currentTurn = (data.turn == ETurn.BLACK)?ETurn.WHITE:ETurn.BLACK;	
	},this);
};

InGame.prototype.onChangeComplete = function(){
	
	 for(var i =0;i<this.reverseArray.length;i++){
		 if(this.reverseArray[i].animationFlag == false) return
	 }
	 
	 //현재 턴이 내 차례인 경우
	 if(this.isTurn === true){
		 this.findAvailArea();
		 this.checkEnd();
		 this.isTurn = false;
	 }
	
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Chip(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EChipType.NONE);	
		}
	}
	
	//오셀로 시작 할 경우 4개의 칩이 세팅되어 있는 부분
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT-1; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(rowIndex%2 === 1)
				this.board[rowIndex][colIndex].changeType(EChipType.BLACK);
			else
				this.board[rowIndex][colIndex].changeType(EChipType.WHITE);
		}
	}
	/*this.board[3][3].changeType(EChipType.BLACK);
	this.board[4][3].changeType(EChipType.WHITE);
	this.board[3][4].changeType(EChipType.WHITE);
	this.board[4][4].changeType(EChipType.BLACK);*/

	//현재 턴이 검은색인 사람 부터 시작 한다
	if(this.currentTurn === ETurn.BLACK){
		this.findAvailArea();
	}
};

/**
 *  mini로 지정되어 있는 부분 제거
 */
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
 * 모든 Chip들의 8방향 탐색을 하여 그 위치가 놓을 수 있는 위치인지 탐색
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
		//라인 탐색 결과에 tempArray 길이 값이 0이 아니면 현재 구역은 놓을 수 있는 구역이라고 미니Chip으로 표시
		this.board[cx][cy].changeType(miniChipType);
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
InGame.prototype.lineCheck = function(cx, cy, oppositeType, curType, roundData){
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

/**
 * 현재 블럭을 놓은 위치를 기준으로 탐색 시작 8방향 탐색 시작
 * @param curRow 	현재 가로
 * @param curCol	현재 세로
 * @param curType	현재 타입
 * @returns Array
 */
InGame.prototype.checkAvailTurn = function(curRow, curCol, curType){
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
		var tempArray = this.lineCheck2(cx, cy, oppositeType, curType, this.roundArray[i]);
	
		if(tempArray === undefined || tempArray == null || tempArray.length === 0) continue;
			
		for(var j = 0; j < tempArray.length; j++){
			reverseArray.push(tempArray[j]);
		}
	}
	this.reverseArray = reverseArray;
	
	 for(var i =0; i<this.reverseArray.length; i++){
		 this.reverseArray[i].animationChangeType(curType);
	 }
	 
	this.countingChip();
	
	return reverseArray;
	
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

InGame.prototype.countingChip = function(){
	var blackCount = 0;
	var whilteCount = 0;
	
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(this.board[rowIndex][colIndex].getType() == EChipType.BLACK){
				blackCount++;
			}
			else if(this.board[rowIndex][colIndex].getType() == EChipType.WHITE){
				whilteCount++;
			}
			
		}
	}
	this.whilteCount = whilteCount;
	this.blackCount = blackCount;
	
	this.txtWhiteCount.text = this.whilteCount;
	this.txtBlackCount.text = this.blackCount;
};

InGame.prototype.checkEnd = function(){
	var endCount = 0;
	if(this.isTurn === false){
		return;
	}
	
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			if(this.board[rowIndex][colIndex].getType() == EChipType.MINIBLACK
					||this.board[rowIndex][colIndex].getType() == EChipType.MINIWHITE){
				endCount++;
			}
		}
	}
	
	if(endCount === 0) {
		var winerChip = (this.whilteCount >= this.blackCount)?ETurn.WHITE:ETurn.BLACK;
		var count = (this.myColor === ETurn.BLACK)?this.blackCount:this.whilteCount;
		
		this.popupResult.setData(this.myColor, winerChip, count);
		this.popupResult.popupOpen();

		window.peerConn.send("END");
	}
};

/**
 * 데이터를 상대 플레이어에게 전달
 */
InGame.prototype.onSendData = function(rowIndex, colIndex, type, turn){
	var sendJson = JSON.stringify({
		"rowIndex" : rowIndex, 
		"colIndex" : colIndex, 
		"type" : type,
		"turn" : turn
	});
	
	this.popupWating.popupOpen();
	window.peerConn.send(sendJson);
};


