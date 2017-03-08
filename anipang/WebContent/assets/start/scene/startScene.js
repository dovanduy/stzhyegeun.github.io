// Generated by Phaser Editor v1.2.1

/**
 * startScene.
 * @param {Phaser.Game} aGame The game.
 * @param {Phaser.Group} aParent The parent group. If not given the game world will be used instead.
 */
function startScene(aGame, aParent) {
	Phaser.Group.call(this, aGame, aParent);

	/* --- pre-init-begin --- */

	// you can insert code here

	/* --- pre-init-end --- */

	var inGame = this.game.add.group(this);

	this.game.add.sprite(0, 0, 'uiAtlas', 'bg_top.png', inGame);

	this.game.add.sprite(0, 654, 'uiAtlas', 'bg_bottom.png', inGame);

	this.game.add.sprite(0, 181, 'uiAtlas', 'game_board.png', inGame);

	var btn_game_pause = this.game.add.button(390, 27, 'settingImage', this.OnClickBtnPause, this, 'btnPause.png', 'btnPause.png', 'btnPause.png', 'btnPause.png', inGame);

	var btn_game_resume = this.game.add.button(390, 27, 'settingImage', this.OnClickBtnResume, this, 'btnStart.png', 'btnStart.png', 'btnStart.png', 'btnStart.png', inGame);

	var UITimeGauge_body_png = this.game.add.sprite(56, 703, 'uiAtlas', 'UITimeGauge_body.png', inGame);
	UITimeGauge_body_png.scale.setTo(0.8399999712077841, 1.0626088119527406);

	var UITimeGauge_header_png = this.game.add.sprite(47, 703, 'uiAtlas', 'UITimeGauge_header.png', inGame);
	UITimeGauge_header_png.scale.setTo(1.0, 1.06);

	var UITimeGauge_tail_png = this.game.add.sprite(433, 703, 'uiAtlas', 'UITimeGauge_tail.png', inGame);
	UITimeGauge_tail_png.scale.setTo(1.0, 1.06);

	var UICombo_png = this.game.add.sprite(256, 88, 'uiAtlas', 'combo0011.png', inGame);

	var PopupPause = this.game.add.group(this);

	this.game.add.sprite(105, 265, 'settingImage', 'bg.png', PopupPause);

	var btn_popup_resume = this.game.add.button(143, 372, 'settingImage', this.OnClickBtnPauseResume, this, 'btnContinue.png', 'btnContinue.png', 'btnContinue.png', 'btnContinue.png', PopupPause);

	var btn_popup_go_main = this.game.add.button(143, 442, 'settingImage', this.OnClickBtnPauseExit, this, 'btnMainMenu.png', 'btnMainMenu.png', 'btnMainMenu.png', 'btnMainMenu.png', PopupPause);

	var btn_popup_restart = this.game.add.button(143, 302, 'settingImage', this.OnClickBtnPauseRestart, this, 'btnRestart.png', 'btnRestart.png', 'btnRestart.png', 'btnRestart.png', PopupPause);

	var inGameMessagePopup = this.game.add.group(this);

	var messageReady = this.game.add.sprite(90, 244, 'uiAtlas', 'game_message0001.png', inGameMessagePopup);

	var messageGo = this.game.add.sprite(90, 244, 'uiAtlas', 'game_message0002.png', inGameMessagePopup);

	var messageTimeOver = this.game.add.sprite(53, 256, 'uiAtlas', 'game_message0003.png', inGameMessagePopup);

	 // public fields

	this.fBtn_game_pause = btn_game_pause;
	this.fBtn_game_resume = btn_game_resume;
	this.fUICombo_png = UICombo_png;
	this.fPopupPause = PopupPause;
	this.fBtn_popup_resume = btn_popup_resume;
	this.fBtn_popup_go_main = btn_popup_go_main;
	this.fBtn_popup_restart = btn_popup_restart;
	this.fInGameMessagePopup = inGameMessagePopup;
	this.fMessageReady = messageReady;
	this.fMessageGo = messageGo;
	this.fMessageTimeOver = messageTimeOver;

	/* --- post-init-begin --- */

	// you can insert code here
	this.fImg_time_gauge_body = UITimeGauge_body_png;
	this.fImg_time_gauge_tail = UITimeGauge_tail_png;
	this.fImg_time_gauge_head = UITimeGauge_header_png;
	
	this.fImg_Combo = UICombo_png;
	/* --- post-init-end --- */
}

/** @type Phaser.Group */
var startScene_proto = Object.create(Phaser.Group.prototype);
startScene.prototype = startScene_proto;
startScene.prototype.constructor = Phaser.Group;

/* --- end generated code --- */

// you can insert code here

