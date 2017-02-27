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
	
	this.makeBlind();
}

PopupPauseGame.prototype.makeBlind = function(){
	this.blind = this.game.add.graphics(0,0);
	this.blind.beginFill(0x000000, 1);
	this.blind.drawRect(0, 0, this.game.world.width, this.game.world.height);
	this.blind.alpha  = 0.7;
	this.blind.inputEnabled = true;
	
	this.scene.add(this.blind);
	this.scene.sendToBack(this.blind);
};

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