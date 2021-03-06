
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * PopupError.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function PopupError(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _blindContainer = this.game.add.group(this);
	_blindContainer.position.setTo(577, 382);
	
	var _popupBg = new PopupBg(this.game, this);
	_popupBg.position.setTo(361, 661);
	
	var _adPCFailContainer = this.game.add.group(this);
	
	var _ad_icon_large_png = this.game.add.sprite(210, 383, 'mainAtlas', 'ad_icon_large.png', _adPCFailContainer);
	_ad_icon_large_png.angle = -20.0;
	_ad_icon_large_png.scale.setTo(1.5, 1.5);
	_ad_icon_large_png.tint = 0xc1d9e0;
	
	var _textAdPCFail = this.game.add.text(360, 730, 'This is a feature\nonly available on mobile.\nPlease try on mobile.', {"font":"bold 52px Lilita One","fill":"#a3c6d3","align":"center"}, _adPCFailContainer);
	_textAdPCFail.anchor.setTo(0.5, 0.5);
	
	var _btnAdPCFailVideo = this.game.add.sprite(366, 978, 'mainAtlas', 'common_middle_btn.png', _adPCFailContainer);
	_btnAdPCFailVideo.scale.setTo(1.0, 1.1);
	_btnAdPCFailVideo.anchor.setTo(0.5, 0.5);
	_btnAdPCFailVideo.tint = 0x51aaee;
	
	var _textAdPCFailOK = this.game.add.text(360, 978, 'OK', {"font":"bold 72px Lilita One","fill":"#ffffff"}, _adPCFailContainer);
	_textAdPCFailOK.anchor.setTo(0.5, 0.5);
	
	var _adFailContainer = this.game.add.group(this);
	
	var _ad_icon_large_png1 = this.game.add.sprite(210, 390, 'mainAtlas', 'ad_icon_large.png', _adFailContainer);
	_ad_icon_large_png1.angle = -20.0;
	_ad_icon_large_png1.scale.setTo(1.5, 1.5);
	_ad_icon_large_png1.tint = 0xc1d9e0;
	
	var _textAdFail = this.game.add.text(360, 725, 'Failed to load ad.\nPlease try again\nin a few minutes.', {"font":"bold 57px Lilita One","fill":"#a3c6d3","align":"center"}, _adFailContainer);
	_textAdFail.anchor.setTo(0.5, 0.5);
	
	var _btnAdFailVideo = this.game.add.sprite(366, 978, 'mainAtlas', 'common_middle_btn.png', _adFailContainer);
	_btnAdFailVideo.scale.setTo(1.0, 1.1);
	_btnAdFailVideo.anchor.setTo(0.5, 0.5);
	_btnAdFailVideo.tint = 0x51aaee;
	
	var _textAdFailOK = this.game.add.text(360, 978, 'OK', {"font":"bold 72px Lilita One","fill":"#ffffff"}, _adFailContainer);
	_textAdFailOK.anchor.setTo(0.5, 0.5);
	
	
	
	// public fields
	
	this.fBlindContainer = _blindContainer;
	this.fPopupBg = _popupBg;
	this.fAdPCFailContainer = _adPCFailContainer;
	this.fTextAdPCFail = _textAdPCFail;
	this.fBtnAdPCFailVideo = _btnAdPCFailVideo;
	this.fTextAdPCFailOK = _textAdPCFailOK;
	this.fAdFailContainer = _adFailContainer;
	this.fTextAdFail = _textAdFail;
	this.fBtnAdFailVideo = _btnAdFailVideo;
	this.fTextAdFailOK = _textAdFailOK;
	/* --- post-init-begin --- */
	this.fPopupBg.setData(StzTrans.translate(ELocale.NOTICE_TITLE), function(){
		PopupBg.destroyAlphaTween(this.game, this);
	}.bind(this));
	
	this.visible = false;
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var PopupError_proto = Object.create(Phaser.Group.prototype);
PopupError.prototype = PopupError_proto;
PopupError.prototype.constructor = PopupError;

/* --- end generated code --- */
// -- user code here --
var EErorrType = {
	AD_PC_FAIL 			:  	'AD_PC_FAIL',
	AD_LOAD_FAIL		:	'AD_LOAD_FAIL'
};

PopupError.prototype.setData = function(type){
	this.visible = true;
	
	this.fAdFailContainer.visible = false;
	this.fAdPCFailContainer.visible = false;
	
	if(type === EErorrType.AD_PC_FAIL){
		this.fAdPCFailContainer.visible = true;
		
		this.fBtnAdPCFailVideo.inputEnabled = true;
		this.fBtnAdPCFailVideo.events.onInputUp.add(function(){
			PopupBg.destroyAlphaTween(this.game, this);
		}.bind(this));
	}
	else if(type === EErorrType.AD_LOAD_FAIL){
		this.fAdFailContainer.visible = true;
		
		this.fBtnAdFailVideo.inputEnabled = true;
		this.fBtnAdFailVideo.events.onInputUp.add(function(){
			PopupBg.destroyAlphaTween(this.game, this)
		}.bind(this));
	}
	
};

PopupError.prototype.superDestroy = PopupError.prototype.destroy;
PopupError.prototype.destroy = function(destroyChildren, soft) {
	this.superDestroy(destroyChildren, soft);
};
