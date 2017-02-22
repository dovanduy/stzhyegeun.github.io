
PopupStoryMapInfo.prototype = {
		game:null,
		txtStageName:null,
		txtInGameTime:null
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
	
	this.txtInGameTime = this.game.add.text(this.scene.fTxtTimePos.x, this.scene.fTxtTimePos.y, " ");
	this.txtInGameTime.anchor.set(0.5, 0.5);
	
	this.txtInGameTime.font = 'Revalia';
	this.txtInGameTime.fontSize = 45;
    
    var grd = this.txtInGameTime.context.createLinearGradient(0, 0, 0, this.txtInGameTime.canvas.height);
    grd.addColorStop(0, '#FF8A00');   
    grd.addColorStop(1, '#CC6600');
    this.txtInGameTime.fill = grd;
	this.scene.add(this.txtInGameTime);
}

PopupStoryMapInfo.prototype.init = function(stageData){
	this.txtStageName.text = stageData.name;
	this.txtInGameTime.text = secondToMS(stageData.stageInGameData.limitTime);
};

PopupStoryMapInfo.prototype.onShow= function(){
	this.scene.visible = true;
};

PopupStoryMapInfo.prototype.onClose = function(){
	this.scene.visible = false;
};

function secondToMS(s){
	var second = s%60;
	var minutes = Math.floor(s/60);
	
	var finalTime = strPadLeft(minutes,'0',2)+':'+strPadLeft(second,'0',2);
	
	return finalTime;
}

function strPadLeft(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}