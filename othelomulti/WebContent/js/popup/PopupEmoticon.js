function PopupEmoticon(inGame, aParent, options) {
	if(!(this instanceof PopupEmoticon)){
		return new PopupEmoticon(inGame, aParent, options);
	}
	this.scene = new emoticonPopup(inGame);
	Phaser.Plugin.PopupManager.apply(this, arguments);
	
	this.scene.fBtnGreet.inputEnabled = true;
	this.scene.fBtnGreet.events.onInputUp.add(this.onSendEmoticon, this);
	
	this.scene.fBtnFast.inputEnabled = true;
	this.scene.fBtnFast.events.onInputUp.add(this.onSendEmoticon, this);
	
	this.scene.fBtnLaugh.inputEnabled = true;
	this.scene.fBtnLaugh.events.onInputUp.add(this.onSendEmoticon, this);
	
	this.scene.fBtnSorry.inputEnabled = true;
	this.scene.fBtnSorry.events.onInputUp.add(this.onSendEmoticon, this);
}

PopupEmoticon.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupEmoticon.prototype.constructor = PopupEmoticon;

PopupEmoticon.prototype.setData = function(){
	
};

PopupEmoticon.prototype.update = function(){
	//Phaser.Plugin.PopupManager.prototype.update();
	if(this.updateEnable === false ){
		return;
	}
	
	StzLog.print("[PopupEmoticon] update");
};

PopupEmoticon.prototype.onSendEmoticon = function(sprite, pointer){

	var emoticonName = null;
	
	if(sprite === this.scene.fBtnGreet){
		emoticonName = EEmoticonNames.GREET;
		
	}
	
	else if(sprite === this.scene.fBtnFast){
		emoticonName = EEmoticonNames.FAST;
	}
	
	else if(sprite === this.scene.fBtnLaugh){
		emoticonName = EEmoticonNames.LAUGH;
	}
	
	else if(sprite === this.scene.fBtnSorry){
		emoticonName = EEmoticonNames.SORRY;
	}
	
	else{
		emoticonName = EEmoticonNames.GREET;
	}
	
	if(StzGameConfig.AUTO_FLAG === false){
//		this.onSendData(emoticonName);
	}
	
	this.aParent.emoticonDown.show(emoticonName);
	
	this.closeState = EPopupCloseState.CONFIRM;
	this.popupClose();
};

PopupEmoticon.prototype.onSendData = function(EmoticonName){
	var sendJson = JSON.stringify({
		"EmoticonName" : EmoticonName,
	});
	window.peerConn.send(sendJson);
};