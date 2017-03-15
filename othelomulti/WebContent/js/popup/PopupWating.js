PopupWating.prototype = {
		txtTime:null,
		timeCount:0,
		startTimeStamp:0,
		remainSecond:0
};

function PopupWating(inGame, aParent, options) {
	if(!(this instanceof PopupWating)){
		return new PopupWating(inGame, aParent, options);
	}
	this.scene = new watingPopup(inGame);
	Phaser.Plugin.PopupManager.apply(this, arguments);
	this.scene.alpha = 0.5;
	
	
	this.txtTime = this.inGame.add.bitmapText(this.scene.fTxtTimePos.x + 25, this.scene.fTxtTimePos.y + 5, 
			'textScoreFont', '0', 25);
	this.txtTime.anchor.set(0.5,0);

	this.scene.add(this.txtTime);
}

PopupWating.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupWating.prototype.constructor = PopupWating;

PopupWating.prototype.setData = function(){
	
};

PopupWating.prototype.popupOpen = function(){
	this.updateEnable = true;
	this.startTimeStamp = (new Date()).getTime();
	this.timeCount = StzGameConfig.TURN_TIME;
	this.txtTime.text = this.timeCount;
	
	Phaser.Plugin.PopupManager.prototype.popupOpen.call(this);
};

PopupWating.prototype.update = function(){
	if(this.updateEnable === false ){
		return;
	}
	
	var currentTimestamp = (new Date()).getTime();
	this.remainSecond = 1 - ((currentTimestamp - this.startTimeStamp) / 1000);
	
	if(this.remainSecond <= 0){
		this.timeCount--;
		this.txtTime.text = this.timeCount;
		
		this.startTimeStamp = (new Date()).getTime();
	}
	
};
