PopupPauseGame.prototype = {
		game:null,
		aParent:null
};

function PopupPauseGame(ingame, aParent) {
	this.game = ingame;
	this.aParent = aParent;
	
	this.scene = new PauseGame(ingame);
	
	this.scene.visible = false;
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputUp.add(this.onMainMenu, this);
}

PopupPauseGame.prototype.init = function(stageData){
	
};

PopupPauseGame.prototype.onShow= function(){
	this.scene.visible = true;
};

PopupPauseGame.prototype.onClose = function(){
	this.scene.visible = false;
};

PopupPauseGame.prototype.onStart = function(){
	StzCommon.StzLog.print("[PopupPauseGame] onStart");
};

PopupPauseGame.prototype.onMainMenu = function(){
	this.aParent.onDestory();
	
	this.game.state.start("Worldmap");
};

PopupPauseGame.prototype.onDestory = function(){
	StzCommon.StzLog.print("[PopupPauseGame] onDestory");
	
};