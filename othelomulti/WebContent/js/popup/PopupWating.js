function PopupWating(inGame, aParent, options) {
	if(!(this instanceof PopupWating)){
		return new PopupWating(inGame, aParent, options);
	}
	this.scene = new watingPopup(inGame);
	Phaser.Plugin.PopupManager.apply(this, arguments);
	this.scene.alpha = 0.5;
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
