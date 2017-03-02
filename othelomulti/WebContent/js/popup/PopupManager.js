
/**
* 
* @class Phaser.Plugin.PopupManager
*/

Phaser.Plugin.PopupManager = function(inGame, aParent) {
	Phaser.Plugin.call(this, inGame, aParent);
	
	this.inGame = inGame;
	this.aParent = aParent;
	this.scene.visible = false;
	this.updateEnable = false;
	
	this.scene.x = this.inGame.world.centerX;
	this.scene.y = this.inGame.world.centerY;
	
	this.scene.pivot.set(this.scene.width/2, this.scene.height/2);
};

Phaser.Plugin.PopupManager.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.PopupManager.prototype.constructor = Phaser.Plugin.PopupManager;

Phaser.Plugin.PopupManager.prototype.update = function(){
	if(this.upDateEnable === false ){
		return;
	}
	StzCommon.StzLog.print("[PopupManager] update");
};

Phaser.Plugin.PopupManager.prototype.popupOpen= function(){
	this.scene.visible = true;
	
	
	this.scene.scale.set(0,0);
	
	this.prePopupOpen();
	
	var tween = this.inGame.add.tween(this.scene.scale).to({ x:1, y:1}, 500, Phaser.Easing.Back.Out, true, 0); // nope  
	tween.onComplete.addOnce(function(){
		this.postPopupOpen();
	}.bind(this));
};

Phaser.Plugin.PopupManager.prototype.prePopupOpen= function(){
	StzCommon.StzLog.print("[PopupManager] prePopupOpen");
	
};

Phaser.Plugin.PopupManager.prototype.postPopupOpen= function(){
	StzCommon.StzLog.print("[PopupManager] postPopupOpen");
};


Phaser.Plugin.PopupManager.prototype.popupClose = function(){
	this.prePopupClose();
	
	var tween = this.inGame.add.tween(this.scene.scale).to({ x:0, y:0}, 500, Phaser.Easing.Back.Out, true, 0); // nope  
	tween.onComplete.addOnce(function(){
		this.postPopupClose();
	}.bind(this));
};

Phaser.Plugin.PopupManager.prototype.prePopupClose= function(){
	StzCommon.StzLog.print("[PopupManager] prePopupClose");
	
};

Phaser.Plugin.PopupManager.prototype.postPopupClose= function(){
	StzCommon.StzLog.print("[PopupManager] postPopupClose");
	this.scene.visible = false;
};

Phaser.Plugin.PopupManager.prototype.onDestory = function(){
	StzCommon.StzLog.print("[PopupManager] onDestory");
};
