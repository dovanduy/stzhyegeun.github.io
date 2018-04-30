
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * TutorialCrown.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.
    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function TutorialCrown(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _img_tutoCrown_png = this.game.add.sprite(0, 0, 'TutorialAtlas', 'img_tutoCrown.png', this);
	_img_tutoCrown_png.anchor.setTo(0.5, 0.5);
	
	var _txtGray = this.game.add.text(-82, -86, 'Stage clear!', {"font":"bold 30px Blogger Sans","fill":"#1a8aa8", "align": "center"}, this);
	_txtGray.anchor.setTo(0.0, 0.5);
	
	var _txtSilver = this.game.add.text(-82, -25, 'Get all the jewels!', {"font":"bold 30px Blogger Sans","fill":"#1a8aa8", "align": "center"}, this);
	_txtSilver.anchor.setTo(0.0, 0.5);
	
	var _txtGold = this.game.add.text(-82, 36, 'Use all markers!', {"font":"bold 30px Blogger Sans","fill":"#1a8aa8", "align": "center"}, this);
	_txtGold.anchor.setTo(0.0, 0.5);
	
	
	
	// public fields
	_img_tutoCrown_png.visible = false;
	
	this.fTxtGray = _txtGray;
	this.fTxtSilver = _txtSilver;
	this.fTxtGold = _txtGold;

	this.fTxtGray.text = StzTrans.translate(StaticManager.ELocale.tutorial_non);
	this.fTxtSilver.text = StzTrans.translate(StaticManager.ELocale.tutorial_silver);
	this.fTxtGold.text = StzTrans.translate(StaticManager.ELocale.tutorial_gold);
	
	
	/* --- post-init-begin --- */
	this.blackLayer = aGame.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

	this.addChild(this.blackLayer);

	this.bg = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "tutorialMsgBG");
	this.bg.targetWidth = 520;
	this.bg.targetHeight = 600;
	this.bg.anchor.setTo(0.5, 0.5);
    this.bg.UpdateImageSizes();
	
	this.addChild(this.bg);

	this.fTxtTouchAlert = this.game.add.text(360, 1020, "- Tap to start game -", {"font":"bold 44px Blogger Sans","fill":"#ffffff"}, this);//todo : staticData 적용.
	this.fTxtTouchAlert.anchor.setTo(0.5);
	this.fTxtTouchAlert.visible = false;


	this.visible = false;
	this.alphaTween = null;


	this.callback = null;
	this.bg.events.onInputUp.add(function () {
		if(this.callback !== null)
			this.callback();
	}, this);

	this.blackLayer.events.onInputUp.add(function () {
		if(this.callback !== null)
			this.callback();
	}, this);
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var TutorialCrown_proto = Object.create(Phaser.Group.prototype);
TutorialCrown.prototype = TutorialCrown_proto;
TutorialCrown.prototype.constructor = TutorialCrown;

/* --- end generated code --- */
// -- user code here --
TutorialCrown.prototype.showCrownTuto = function (inCallback) {
	this.visible = true;

	this.bg.scale.setTo(0.4);
	this.alphaTween = null;
	this.callback = null;

	this.fTxtTouchAlert.visible = false;

	var popTween = this.game.add.tween(this.bg.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
	popTween.onComplete.addOnce(function() {
		this.game.tweens.remove(popTween);

		setTimeout(function () {
			this.fTxtTouchAlert.visible = true;
			this.fTxtTouchAlert.alpha = 0;
			this.alphaTween = this.game.add.tween(this.fTxtTouchAlert).to({alpha : 1}, 300, Phaser.Easing.Linear.None, true, 0, 100, true);

			if(inCallback !== undefined) {
				this.callback = function () {
					inCallback();
					this.hideCrownTuto();
				};
			}
			else {
				this.callback = this.hideCrownTuto;
			}
			
		}.bind(this), 300);
	}, this);
};	

TutorialCrown.prototype.hideCrownTuto = function () {
	this.game.tweens.remove(this.alphaTween);
	this.visible = false;
};