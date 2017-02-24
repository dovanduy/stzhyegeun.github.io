InGame.prototype = {
		pauseGame:null,
		stageData:null
};

function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.init = function(stageData){
	this.stageData = stageData;
};

InGame.prototype.create = function() {
	this.scene.fRedBlind_png.visible = false;
	
	this.scene.fBtnPause.inputEnabled = true;
	this.scene.fBtnPause.events.onInputDown.add(this.onPause, this);
	
	this.storyMapInfoPopup = new PopupPauseGame(this.game, this);
};

InGame.prototype.onPause = function() {
	this.storyMapInfoPopup.onShow();
};

InGame.prototype.onDestory = function() {
	this.storyMapInfoPopup.onDestory();
};