// Generated by Phaser Editor v1.2.1

/**
 * InGameScene.
 * @param {Phaser.Game} aGame The game.
 * @param {Phaser.Group} aParent The parent group. If not given the game world will be used instead.
 */
function InGameScene(aGame, aParent) {
	Phaser.Group.call(this, aGame, aParent);

	/* --- pre-init-begin --- */

	// you can insert code here

	/* --- pre-init-end --- */

	var groupUI = this.game.add.group(this);

	this.game.add.sprite(0, 0, 'inGameUI', 'mainStage.png', groupUI);

	this.game.add.sprite(0, 66, 'inGameUI', 'leftLine.png', groupUI);

	this.game.add.sprite(457, 66, 'inGameUI', 'rightLine.png', groupUI);

	this.game.add.sprite(0, 654, 'inGameUI', 'downLine.png', groupUI);

	this.game.add.sprite(0, 0, 'inGameUI', 'upLine.png', groupUI);

	var redBlind_png = this.game.add.sprite(1, 117, 'inGameUI', 'redBlind.png', groupUI);

	this.game.add.sprite(0, 0, 'inGameUI', 'upLeftPanel.png', groupUI);

	this.game.add.sprite(119, 0, 'inGameUI', 'upPanel.png', groupUI);

	var mainGage_png = this.game.add.sprite(174, 6, 'inGameUI', 'mainGage.png', groupUI);
	mainGage_png.scale.setTo(0.956489194172891, 0.8429090315415085);

	var btnPause = this.game.add.button(437, -2, 'inGameUI', null, this, 'btnPause.png', 'btnPause.png', 'btnStart.png', 'btnPause.png', groupUI);
	btnPause.scale.setTo(1.3054541868894243, 1.5574191410420477);

	var gameGo = this.game.add.sprite(87, 319, 'inGameUI', 'gameReady.png', this);

	 // public fields

	this.fGroupUI = groupUI;
	this.fRedBlind_png = redBlind_png;
	this.fBtnPause = btnPause;
	this.fGameGo = gameGo;

	/* --- post-init-begin --- */

	// you can insert code here

	/* --- post-init-end --- */
}

/** @type Phaser.Group */
var InGameScene_proto = Object.create(Phaser.Group.prototype);
InGameScene.prototype = InGameScene_proto;
InGameScene.prototype.constructor = Phaser.Group;

/* --- end generated code --- */

// you can insert code here
