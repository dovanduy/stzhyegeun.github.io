
/**
* 
* @class Phaser.Plugin.PopupManager
*/
var EPopupCloseState = {
		NONE:'None',
		CONFIRM:'Confirm'
};

Phaser.Plugin.PopupManager = function(inGame, aParent, options) {
	Phaser.Plugin.call(this, inGame, aParent);
	
	this.inGame = inGame;
	this.aParent = aParent;
	this.scene.visible = false;
	this.updateEnable = false;
	this.closeState = EPopupCloseState.NONE;
	this.callbackFunc = null;
	
	this.scene.x = this.inGame.world.centerX;
	this.scene.y = this.inGame.world.centerY;
	
	this.scene.pivot.set(this.scene.width/2, this.scene.height/2);
	
	if(options.blind === true){
		this.makeBlind();
	}
	
	if(options.offsetX !== undefined){
		this.scene.x += options.offsetX;
	}
	
	if(options.offsetY !== undefined){
		this.scene.y += options.offsetY;
	}
	
	if(options.callbackFunc !== undefined){
		this.callbackFunc = options.callbackFunc.bind(this.aParent);
	}
};

Phaser.Plugin.PopupManager.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.PopupManager.prototype.constructor = Phaser.Plugin.PopupManager;

Phaser.Plugin.PopupManager.prototype.update = function(){
	if(this.upDateEnable === false ){
		return;
	}
	StzCommon.StzLog.print("[PopupManager] update");
};

Phaser.Plugin.PopupManager.prototype.makeBlind = function(){
	this.blind = this.inGame.add.graphics(0,0);
	this.blind.beginFill(0x000000, 1);
	this.blind.drawRect(-(this.scene.x - this.scene.width/2), -(this.scene.y  - this.scene.height/2), this.inGame.world.width, this.inGame.world.height);
	this.blind.alpha  = 0.7;
	this.blind.inputEnabled = true;
	
	this.scene.add(this.blind);
	this.scene.sendToBack(this.blind);
}

Phaser.Plugin.PopupManager.prototype.popupOpen= function(){
	this.prePopupOpen();
	
	var tween = this.inGame.add.tween(this.scene.scale).to({ x:1, y:1}, 500, Phaser.Easing.Back.Out, true, 0); // nope  
	tween.onComplete.addOnce(function(){
		this.postPopupOpen();
	}.bind(this));
};

Phaser.Plugin.PopupManager.prototype.prePopupOpen= function(){
	StzCommon.StzLog.print("[PopupManager] prePopupOpen");
	if(this.isOpen === true){
		return;
	}
	
	this.closeState = EPopupCloseState.NONE;
	this.scene.visible = true;
	
	this.scene.scale.set(0,0);
	
	this.isOpen = true;
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
	this.isOpen = false;
	if(this.callbackFunc !== null){
		this.callbackFunc();
	}
};

Phaser.Plugin.PopupManager.prototype.onDestory = function(){
	StzCommon.StzLog.print("[PopupManager] onDestory");
};
