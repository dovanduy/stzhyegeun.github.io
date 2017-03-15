function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype = {
		gameEngine:null,
		whilteCount:0,
		blackCount:0,
		myTurn:0,
		popupResult:null,
		popupWating:null,
		popupEmoticon:null,
		emoticonUP:null,
		emoticonDown:null,
};

/**
 * 먼저 기다리는 사람이 검은색 (먼저 시작)
 * @param data 현재 턴 
 */
InGame.prototype.init = function(data) {
	
	this.board = StzCommon.StzUtil.createArray(StzGameConfig.ROW_COUNT, StzGameConfig.COL_COUNT);
	this.myColor = data;
	StzGameConfig.AUTO_FLAG = true;
	
	this.gameEngine = new GameEngine(this.game, this);
};

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.create = function() {
	this.popupResult = this.game.plugins.add(new PopupResult(this.game, this, {blind:false}));
	this.popupWating = this.game.plugins.add(new PopupWating(this.game, this, {blind:false}));
	this.popupEmoticon = this.game.plugins.add(new PopupEmoticon(this.game, this, {blind:false, offsetY:300, callbackFunc:function(){
		if(this.popupEmoticon.closeState === EPopupCloseState.CONFIRM){
			this.scene.fBtnEmoticon.alpha = 0.5;
			this.scene.fBtnEmoticon.inputEnabled = false;
		}
	}}));
	this.emoticonUP = new EmoticonManager(this.game, this, EEmoticonNames.ALL,{scaleX:0.4, scaleY:0.4});
	this.emoticonUP.setPos(450 , 10);
	
	this.emoticonDown = new EmoticonManager(this.game, this, EEmoticonNames.ALL,{scaleX:0.4, scaleY:0.4, callBackFunc:this.onEmoticonComplete});
	this.emoticonDown.setPos(450 , 810);
	
	if(StzGameConfig.AUTO_FLAG === true){
		this.emoticonAuto = new EmoticonManager(this.game, this, EEmoticonNames.ALL,{scaleX:0.4, scaleY:0.4});
		this.emoticonAuto.setPos(450 , 10);
		this.game.time.events.add(2000, function(){
			this.emoticonAuto.show(EEmoticonNames.GREET);
		}.bind(this));
	}

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
	
	this.scene.fBtnEmoticon.inputEnabled = true;
	this.scene.fBtnEmoticon.events.onInputUp.add(this.onEmoticon, this);
	
	this.countingChip();
	
	if(StzGameConfig.AUTO_FLAG === true){
		this.emticonStartStamp = (new Date()).getTime();
	}
	
//	window.peerConn.on('data', function(data){
//		 if(data === "END"){
//				this.popupWating.popupClose();
//				var winerChip = (this.whilteCount >= this.blackCount)?ETurn.WHITE:ETurn.BLACK;
//				var count = (this.myColor === ETurn.BLACK)?this.blackCount:this.whilteCount;	
//				this.popupResult.setData(this.myColor, winerChip, count);
//					
//				this.popupResult.popupOpen();
//				 return;
//			 }
//		 
//		 var data = JSON.parse(data);	
//		 
//		 if(data.EmoticonName !== undefined){
//			 this.emoticonUP.show(data.EmoticonName);
//			 return;
//		 }
//		
//		 this.popupWating.popupClose();
//
//		 this.board[data.rowIndex][data.colIndex].changeType(data.type);
//	
//		 this.removeAvailArea();
//		 this.checkAvailTurn(data.rowIndex, data.colIndex, data.type);
//		 
//		 //현재 턴이 내 차례인 경우
//		 this.isTurn = true;
//		 this.currentTurn = (data.turn == ETurn.BLACK)?ETurn.WHITE:ETurn.BLACK;	
//	},this);
};

InGame.prototype.update = function(){
	if(StzGameConfig.AUTO_FLAG === true && this.isTurn() === true){
		this.Autoemoticon();
	}
	else{
		return
	}
};

InGame.prototype.Autoemoticon = function(){
	var currentTimestamp = (new Date()).getTime();
	
	if(5 - ((currentTimestamp - this.emticonStartStamp) / 1000) <= 0){
		this.emoticonAuto.show(EEmoticonNames.FAST);
		this.emticonStartStamp = (new Date()).getTime();
	}
};

InGame.prototype.initBoard = function() {
	for (var rowIndex = 0; rowIndex < StzGameConfig.ROW_COUNT; rowIndex++) {
		for (var colIndex = 0; colIndex < StzGameConfig.COL_COUNT; colIndex++) {
			this.board[rowIndex][colIndex] = new Chip(this.game, this, rowIndex, colIndex);
			this.board[rowIndex][colIndex].changeType(EChipType.NONE);	
		}
	}
	
	this.board[3][3].changeType(EChipType.BLACK);
	this.board[4][3].changeType(EChipType.WHITE);
	this.board[3][4].changeType(EChipType.WHITE);
	this.board[4][4].changeType(EChipType.BLACK);

	//현재 턴이 검은색인 사람 부터 시작 한다
	this.currentTurn = ETurn.BLACK;
	
	if(this.isTurn() === true){
		this.gameEngine.findAvailArea(this.board, this.currentTurn);
	}
};

InGame.prototype.isTurn = function(){
	return (this.myColor === this.currentTurn)? true:false;
};

InGame.prototype.changeTurn = function(){
	this.currentTurn = (this.currentTurn === ETurn.BLACK)?ETurn.WHITE:ETurn.BLACK;
};

InGame.prototype.onChangeComplete = function(){
	
	 for(var i =0;i<this.reverseArray.length;i++){
		 if(this.reverseArray[i].animationFlag == false) return
	 }
	 
	if(this.isTurn() === true){
		this.gameEngine.findAvailArea(this.board, this.currentTurn);
		this.checkEnd();	
		
		if(StzGameConfig.AUTO_FLAG === true){
			this.emticonStartStamp = (new Date()).getTime();
		}
	}
	else{
		 //현재 턴이 내 차례인 경우
		 if(StzGameConfig.AUTO_FLAG === true){
			this.game.time.events.add((Math.random() * 6000 + 500), function(){
				this.reverseArray = this.gameEngine.autoPlay(this.board, this.currentTurn);
				this.changeTurn();
				this.popupWating.popupClose();
				this.emticonStartStamp = (new Date()).getTime();
				
				if(this.reverseArray === null){
					this.game.time.events.add(500, function(){
						this.checkEnd();
					}.bind(this));
				}
				else{
					this.gameEngine.removeAvailArea(this.board);
				}
				
			}.bind(this));
			
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
	if(this.isTurn() === false){
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
		
		if(StzGameConfig.AUTO_FLAG === false){
			window.peerConn.send("END");
		}
		else{
			if(winerChip === this.myColor){
				this.emoticonAuto.show(EEmoticonNames.SORRY);
			}
			else{
				this.emoticonAuto.show(EEmoticonNames.LAUGH);
			}
		}
	}
};

/**
 * 
 * @param rowIndex
 * @param colIndex
 * @param type
 * @param turn
 */
InGame.prototype.nextTurn = function(rowIndex, colIndex, type, turn){
	this.gameEngine.removeAvailArea(this.board);
	this.reverseArray = this.gameEngine.checkReverseChip(this.board, rowIndex, colIndex, type);
	
	 for(var i =0; i<this.reverseArray .length; i++){
		 this.reverseArray[i].animationChangeType(type);
	 }
	 
	this.changeTurn();
	this.countingChip();
	
	if(StzGameConfig.AUTO_FLAG === false){
		var sendJson = JSON.stringify({
			"rowIndex" : rowIndex, 
			"colIndex" : colIndex, 
			"type" : type,
			"turn" : turn
		});
		
	window.peerConn.send(sendJson);
	
	}
	this.popupWating.popupOpen();	
};


