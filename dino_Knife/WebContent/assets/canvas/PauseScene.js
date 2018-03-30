
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * PauseScene.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function PauseScene(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _blindContainer = this.game.add.group(this);
	
	var _restartContainer = this.game.add.group(this);
	_restartContainer.position.setTo(360, 610);
	
	var _btnReplay = this.game.add.sprite(0, 0, 'mainAtlas', 'play_btn.png', _restartContainer);
	_btnReplay.anchor.setTo(0.5, 0.5);
	
	var _iconReplay = this.game.add.sprite(8, 1, 'mainAtlas', 'play_btn_icon.png', _restartContainer);
	_iconReplay.anchor.setTo(0.5, 0.5);
	
	var _homeContainer = this.game.add.group(this);
	_homeContainer.position.setTo(360, 1100);
	
	var _btnHome = this.game.add.sprite(0, 0, 'mainAtlas', 'common_small_circle.png', _homeContainer);
	_btnHome.scale.setTo(0.9, 0.9);
	_btnHome.anchor.setTo(0.5, 0.5);
	
	var _iconHome = this.game.add.sprite(2, -6, 'mainAtlas', 'home_icon.png', _homeContainer);
	_iconHome.anchor.setTo(0.5, 0.5);
	
	var _textBgHome = this.game.add.sprite(-57, 40, 'mainAtlas', 'btn_label_short.png', _homeContainer);
	
	
	
	// public fields
	
	this.fBlindContainer = _blindContainer;
	this.fRestartContainer = _restartContainer;
	this.fBtnReplay = _btnReplay;
	this.fIconReplay = _iconReplay;
	this.fHomeContainer = _homeContainer;
	this.fBtnHome = _btnHome;
	this.fIconHome = _iconHome;
	this.fTextBgHome = _textBgHome;
	/* --- post-init-begin --- */
	this.fBtnReplay.tint = 0x4dbef0;
	_btnHome.tint = 0x4dbef0;
	_btnHome.alpha = 0.3;
	_textBgHome.tint = 0x007793;

	var titleFontStyle = {fontSize : "142px", fill : '#ffffff', font : 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
	_txtTitle = this.game.add.text(0, 0, 	StzTrans.translate(ELocale.PAUSE_TEXT_B), titleFontStyle, this);
	_txtTitle.setTextBounds(0, this.game.world.height*0.22, this.game.world.width, 0);
	
	var stageFontStyle = {fontSize : "60px", fill : '#96a5aa', font : 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
	this.fTextStage = this.game.add.text(0, 0, StzUtil.strFormatObj(StzTrans.translate(ELocale.STAGE_TEXT_B), {N : PlayerDataManager.saveData.getBestStage()}), stageFontStyle, this);
	this.fTextStage.setTextBounds(0, this.game.world.height*0.14, this.game.world.width, 0);
	
	var iconTitleFontStyle = {fontSize : "24px", fill : '#ffffff', font : 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
	_homeTitle = this.game.add.text(0, 0, StzTrans.translate(ELocale.HOME_TEXT_B), iconTitleFontStyle, this);
	_homeTitle.setTextBounds(0, 3, this.fTextBgHome.width, this.fTextBgHome.height);
	this.fTextBgHome.addChild(_homeTitle);
	
	this.fBtnReplay.inputEnabled = true;
	this.fBtnReplay.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		this.game.state.getCurrentState().togglePauseScene();
	}.bind(this));
	
	this.fBtnHome.inputEnabled = true;
	this.fBtnHome.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		this.game.state.getCurrentState().setEndLog(EResultType.GIVE_UP, InGameController.getRemainCount());
		this.game.state.getCurrentState().destroyInGameScene(ESceneState.GO_LOBBY_SCENE);
	}.bind(this));
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var PauseScene_proto = Object.create(Phaser.Group.prototype);
PauseScene.prototype = PauseScene_proto;
PauseScene.prototype.constructor = PauseScene;

/* --- end generated code --- */
// -- user code here --
PauseScene.prototype.superDestroy = PauseScene.prototype.destroy;
PauseScene.prototype.destroy = function(destroyChildren, soft) {
	this.superDestroy(destroyChildren, soft);
};