function PopupWating(inGame, aParent, options) {
	if(!(this instanceof PopupWating)){
		return new PopupWating(inGame, aParent, options);
	}
	this.scene = new watingPopup(inGame);
	this.scene.alpha = 0.5;
	
	Phaser.Plugin.PopupManager.apply(this, arguments);

}

PopupWating.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupWating.prototype.constructor = PopupWating;

PopupWating.prototype.setData = function(){
	
};

PopupWating.prototype.update = function(){
	//Phaser.Plugin.PopupManager.prototype.update();
	if(this.updateEnable === false ){
		return;
	}
	
	StzCommon.StzLog.print("[PopupResult] update");
	
};

PopupWating.prototype.gameEnd = function(){
	this.closeState = EPopupCloseState.CONFIRM;
	this.popupClose();
};