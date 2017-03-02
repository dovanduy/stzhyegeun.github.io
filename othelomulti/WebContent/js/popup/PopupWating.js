function PopupWating(ingame, aParent, options) {
	this.scene = new watingPopup(ingame);
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
