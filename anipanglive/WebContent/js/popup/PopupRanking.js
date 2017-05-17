
function PopupRanking (inGame, aParent, options) {
	if(!(this instanceof PopupRanking)){
		return new PopupRanking(inGame, aParent, options);
	}
	
	this.viewContext = aParent;
	this.scene = new PopupRankingScene(options.isWin, inGame);
	
	Phaser.Plugin.PopupManager.apply(this, arguments);
	
	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputUp.add(this.onClose, this);
	
	this.prePopupOpenCallback = this.onPreOpenCallback.bind(this);
}

PopupRanking.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupRanking.prototype.constructor = PopupRanking;

PopupRanking.prototype.onPreOpenCallback = function(){
};


PopupRanking.prototype.onClose = function(){
		this.popupClose();
};