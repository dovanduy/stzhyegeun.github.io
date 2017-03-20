
function PopupResult(inGame, aParent, options) {
	if(!(this instanceof PopupResult)){
		return new PopupResult(inGame, aParent, options);
	}
	
	this.scene = new resultPopup(inGame);
	Phaser.Plugin.PopupManager.apply(this, arguments);
	
	this.scene.fBtnReturn.inputEnabled = true;
	this.scene.fBtnReturn.events.onInputUp.add(this.onClose, this);
}

PopupResult.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupResult.prototype.constructor = PopupResult;

PopupResult.prototype.setData = function(result){
	if(result === ERESULT.WIN){
		this.scene.fIconLose.visible = false;
		this.scene.fIconWin.visible = true;
		
		this.scene.fTxtResult.frameName = 'txtGameWin.png';
	}
	else{
		this.scene.fIconLose.visible = true;
		this.scene.fIconWin.visible = false;
		
		this.scene.fTxtResult.frameName = 'txtGameLose.png';
	}
};

PopupResult.prototype.update = function(){
	//Phaser.Plugin.PopupManager.prototype.update();
	if(this.updateEnable === false ){
		return;
	}
	
	StzLog.print("[PopupResult] update");
};

PopupResult.prototype.onClose = function(){
	this.popupClose();
	
	this.game.state.start("Lobby");
};
