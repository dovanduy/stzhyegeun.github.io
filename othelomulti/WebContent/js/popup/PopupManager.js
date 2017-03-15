
/**
* 
* @class Phaser.Plugin.PopupManager

*/

/**
 * EPopupCloseState 팝업 종료 후 팝업 상태
 * NONE : 아무런 상태가 없음
 * CONFIRM : 확인 상태
 */
var EPopupCloseState = {
		NONE:'None',
		CONFIRM:'Confirm'
};

/**
 * options
 * blind : 블라인드 사용 유무
 * offsetX : 센터에서 x위치로 얼마나 떨어 질것 인지
 * offsetY : 센터에서 y위치로 얼마나 떨어 질것 인지
 * callbackFunc : 팝업 종료 후 콜백 함수 
 */
Phaser.Plugin.PopupManager = function(inGame, aParent, options) {
	if(!(this instanceof Phaser.Plugin.PopupManager)){
		return new Phaser.Plugin.PopupManager(inGame, aParent, options);
	}
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

/**
 * 블라인드를 만드는 함수 
 */
Phaser.Plugin.PopupManager.prototype.makeBlind = function(){
	this.blind = this.inGame.add.graphics(0,0);
	this.blind.beginFill(0x000000, 1);
	this.blind.drawRect(-(this.scene.x - this.scene.width/2), -(this.scene.y  - this.scene.height/2), this.inGame.world.width, this.inGame.world.height);
	this.blind.alpha  = 0.7;
	this.blind.inputEnabled = true;
	
	this.scene.add(this.blind);
	this.scene.sendToBack(this.blind);
}

/**
 * 팝업을 오픈
 */
Phaser.Plugin.PopupManager.prototype.popupOpen= function(){
	this.prePopupOpen();
	
	var tween = this.inGame.add.tween(this.scene.scale).to({ x:1, y:1}, 500, Phaser.Easing.Back.Out, true, 0);    
	tween.onComplete.addOnce(function(){
		this.postPopupOpen();
	}.bind(this));
};

/**
 * 팝업 오픈 전에 시작 동작 하는 함수
 */
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

/**
 * 팝업 오픈이 끝난 후 동작 하는 함수
 */
Phaser.Plugin.PopupManager.prototype.postPopupOpen= function(){
	StzCommon.StzLog.print("[PopupManager] postPopupOpen");
};

/**
 * 팝업 클로즈
 */
Phaser.Plugin.PopupManager.prototype.popupClose = function(){
	this.prePopupClose();
	
	var tween = this.inGame.add.tween(this.scene.scale).to({ x:0, y:0}, 500, Phaser.Easing.Back.Out, true, 0); // nope  
	tween.onComplete.addOnce(function(){
		this.postPopupClose();
	}.bind(this));
};

/**
 * 팝업 클로즈가 동작하기 전에 함수
 */
Phaser.Plugin.PopupManager.prototype.prePopupClose= function(){
	StzCommon.StzLog.print("[PopupManager] prePopupClose");
	
};

/**
 * 팝업 클로즈가 끝난 후 동작 하는 함수 
 */
Phaser.Plugin.PopupManager.prototype.postPopupClose= function(){
	StzCommon.StzLog.print("[PopupManager] postPopupClose");
	this.scene.visible = false;
	this.isOpen = false;
	this.updateEnable = false;
	
	if(this.callbackFunc !== null){
		this.callbackFunc();
	}
};

/**
 * 팝업 제거하는 함수
 */
Phaser.Plugin.PopupManager.prototype.onDestory = function(){
	StzCommon.StzLog.print("[PopupManager] onDestory");
};
