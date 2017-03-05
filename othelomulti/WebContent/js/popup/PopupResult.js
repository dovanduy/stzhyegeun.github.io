
PopupResult.prototype = {
		txtChipCount:null,
};

function PopupResult(inGame, aParent, options) {
	if(!(this instanceof PopupResult)){
		return new PopupResult(inGame, aParent, options);
	}
	
	this.scene = new resultPopup(inGame);
	Phaser.Plugin.PopupManager.apply(this, arguments);
	
	this.txtChipCount = this.inGame.add.bitmapText(this.scene.fTxtCountPos.x + 25, this.scene.fTxtCountPos.y + 5, 
			'textScoreFont', '0', 20);
	
	this.txtChipCount.anchor.set(0.5,0);
	
	this.scene.fBtnReturn.inputEnabled = true;
	this.scene.fBtnReturn.events.onInputUp.add(this.onClose, this);
	
	this.scene.add(this.txtChipCount);
}

PopupResult.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupResult.prototype.constructor = PopupResult;

PopupResult.prototype.setData = function(turn, result, count){
	this.txtChipCount.text = count;
	
	if(turn === ETurn.BLACK){
		this.scene.fIconResult.frameName = 'blackChipBig.png';
		
	}
	else{
		this.scene.fIconResult.frameName = 'whiteChipBig.png';
	}
	
	if(turn === result){
		this.scene.fIconLose.visible = false;
		this.scene.fIconWin.visible = true;
		
		this.scene.fTxtResult.frameName = 'txtGameWin.png';
		this.scene.fTxtDecResult.frameName = 'txtWin.png';
	}
	else{
		this.scene.fIconLose.visible = true;
		this.scene.fIconWin.visible = false;
		
		this.scene.fTxtResult.frameName = 'txtGameLose.png';
		this.scene.fTxtDecResult.frameName = 'txtLose.png';
	}
};

PopupResult.prototype.update = function(){
	//Phaser.Plugin.PopupManager.prototype.update();
	if(this.updateEnable === false ){
		return;
	}
	
	StzCommon.StzLog.print("[PopupResult] update");
	
};

PopupResult.prototype.onClose = function(){
	this.popupClose();
	
	this.game.state.start("Lobby");
};
