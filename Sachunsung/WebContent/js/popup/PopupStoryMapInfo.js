
PopupStoryMapInfo.prototype = {
		game:null,
		stageData:null,
		txtStageName:null,
		txtInGameTime:null,
		aParent:null,
		blind:null
};

function PopupStoryMapInfo(ingame, aParent) {
	this.game = ingame;
	this.aParent = aParent;
	
	this.scene = new StoryMapInfo(ingame);
	
	this.scene.visible = false;
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputUp.add(this.onClose, this);
	
	this.scene.fBtnStart.inputEnabled = true;
	this.scene.fBtnStart.events.onInputUp.add(this.onStart, this);
	
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
	
	this.makeBlind();
}

PopupStoryMapInfo.prototype.makeBlind = function(){
	this.blind = this.game.add.graphics(0,0);
	this.blind.beginFill(0x000000, 1);
	this.blind.drawRect(0, 0, this.game.world.width, this.game.world.height);
	this.blind.alpha  = 0.7;
	this.blind.inputEnabled = true;
	
	this.scene.add(this.blind);
	this.scene.sendToBack(this.blind);
};

PopupStoryMapInfo.prototype.init = function(stageData){
	this.txtStageName.text = stageData.name;
	this.txtInGameTime.text = secondToMS(stageData.stageInGameData.limitTime);
	
	this.stageData = stageData;
};

PopupStoryMapInfo.prototype.onShow= function(){
	this.scene.visible = true;
};

PopupStoryMapInfo.prototype.onClose = function(){
	this.scene.visible = false;
};

PopupStoryMapInfo.prototype.onStart = function(){
	StzCommon.StzLog.print("[PopupStoryMapInfo] onStart");
	
	this.aParent.onDestory();
	
	this.game.state.start("InGame", true, false, this.stageData);
};

PopupStoryMapInfo.prototype.onDestory = function(){
	StzCommon.StzLog.print("[PopupStoryMapInfo] onDestory");
	this.scene.destroy(true);
};

/**
 * TODO 나중에 시간 관련 함수 만들어서 정리
 * @param s
 * @returns {String}
 */
function secondToMS(s){
	var second = s%60;
	var minutes = Math.floor(s/60);
	
	var finalTime = strPadLeft(minutes,'0',2)+':'+strPadLeft(second,'0',2);
	
	return finalTime;
}

function strPadLeft(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}