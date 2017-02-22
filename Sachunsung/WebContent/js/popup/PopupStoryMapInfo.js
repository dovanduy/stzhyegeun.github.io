
PopupStoryMapInfo.prototype = {
		game:null,
		txtStageName:null
};

function PopupStoryMapInfo(ingame, aParent) {
	this.game = ingame;
	this.scene = new StoryMapInfo(ingame);
	
	this.scene.visible = false;
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputDown.add(this.onClose, this);
	
	this.txtStageName = this.game.add.bitmapText(this.scene.fTxtNamePos.x, this.scene.fTxtNamePos.y, 'textScoreFont', name, 35, this.group);
	this.txtStageName.anchor.set(0.5);
	this.scene.add(this.txtStageName);
}

PopupStoryMapInfo.prototype.init = function(name){
	this.txtStageName.text = name;
	
};

PopupStoryMapInfo.prototype.onShow= function(){
	this.scene.visible = true;
};

PopupStoryMapInfo.prototype.onClose = function(){
	this.scene.visible = false;
};