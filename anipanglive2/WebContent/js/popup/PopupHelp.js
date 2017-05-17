
function PopupHelp (inGame, aParent, options) {
	if(!(this instanceof PopupHelp)){
		return new PopupHelp(inGame, aParent, options);
	}
	
	this.viewContext = aParent;
	this.scene = new PopupHelpScene(inGame);
	
	Phaser.Plugin.PopupManager.apply(this, arguments);
	
	this.scene.initPopup();
	this.tutorialNum = 0;
	
	this.scene.fBtnNext.inputEnabled = true;
	this.scene.fBtnNext.events.onInputUp.add(this.onNext, this);
	
	this.scene.fBtnPre.inputEnabled = true;
	this.scene.fBtnPre.events.onInputUp.add(this.onPre, this);
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputUp.add(this.onClose, this);
	
	this.prePopupOpenCallback = this.onPreOpenCallback.bind(this);
}

PopupHelp.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupHelp.prototype.constructor = PopupHelp;

PopupHelp.prototype.onPreOpenCallback = function(){
	this.tutorialNum = 0;

	this.scene.txtNext.text = 'Next';
	
	this.scene.pageContainerArray[0].visible = true;
	this.scene.pageContainerArray[1].visible = false;
	this.scene.pageContainerArray[2].visible = false;
	this.scene.pageContainerArray[3].visible = false;
	
	this.scene.pagePointArray[0].frameName = 'page_active.png';
	this.scene.pagePointArray[1].frameName = 'page_normal.png';
	this.scene.pagePointArray[2].frameName = 'page_normal.png';
	this.scene.pagePointArray[3].frameName = 'page_normal.png';
	
	this.scene.fBtnPre.alpha = 0.5;
	
	if(window.isFirstUser === true){
		this.scene.fBtnClose.visible = false;
	}
	else{
		this.scene.fBtnClose.visible = true;
	}
};

PopupHelp.prototype.onNext = function(){
	this.scene.pagePointArray[this.tutorialNum].frameName = 'page_normal.png';
	this.scene.pageContainerArray[this.tutorialNum++].visible = false;
	this.scene.fBtnPre.alpha = 1;
	if(this.tutorialNum === StzGameConfig.TUTORIAL_MAX_COUNT - 1){
		this.scene.txtNext.text = "Done";
	}
	
	if(this.tutorialNum === StzGameConfig.TUTORIAL_MAX_COUNT 
			&& window.isFirstUser === true){
		this.popupClose();
		this.viewContext.readyMatched();
		window.isFirstUser = false;
	}
	else if(this.tutorialNum === StzGameConfig.TUTORIAL_MAX_COUNT){
		this.popupClose();
	}
	else{
		this.scene.pagePointArray[this.tutorialNum].frameName = 'page_active.png';
		this.scene.pageContainerArray[this.tutorialNum].visible = true;
	}
};

PopupHelp.prototype.onPre = function(){
	if(this.tutorialNum <= 0){
		this.tutorialNum = 0;
		
		return;
	}
	else if(this.tutorialNum === 1){
		this.scene.fBtnPre.alpha = 0.5;
	}
	else{
		this.scene.fBtnPre.alpha = 1;
	}
	this.scene.txtNext.text = 'Next';
	this.scene.pagePointArray[this.tutorialNum].frameName = 'page_normal.png';
	this.scene.pageContainerArray[this.tutorialNum--].visible = false;
	
	this.scene.pagePointArray[this.tutorialNum].frameName = 'page_active.png';
	this.scene.pageContainerArray[this.tutorialNum].visible = true;
};

PopupHelp.prototype.onClose = function(){
	if(window.isFirstUser === true){
		this.popupClose();
		this.viewContext.readyMatched();
		window.isFirstUser = false;
	}
	else if(window.isFirstUser === false){
		this.popupClose();
	}
};