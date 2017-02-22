PopupStoryMapInfo.prototype.game;

function PopupStoryMapInfo(ingame) {
	this.game = ingame;
	this.scene = new StoryMapInfo(ingame);
	
	this.scene.visible = false;
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputDown.add(this.onClose, this);
}

PopupStoryMapInfo.prototype.init = function(name){
	
};

PopupStoryMapInfo.prototype.onShow= function(){
	this.scene.visible = true;
};

PopupStoryMapInfo.prototype.onClose = function(){
	this.scene.visible = false;
};