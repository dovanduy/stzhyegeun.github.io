
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * RunzLoading.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function RunzLoading(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _blindContainer = this.game.add.group(this);
	
	var _sprLoading = this.game.add.sprite(360, 520, 'loadingSpriteSheet', 0, this);
	_sprLoading.anchor.setTo(0.5, 0.5);
	_sprLoading.animations.add('loading', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41], 13, true);
	
	var _txtProgress = this.game.add.text(360, 600, 'progress', {"font":"bold 20px Arial"}, this);
	_txtProgress.anchor.setTo(0.5, 0.5);
	
	
	
	// public fields
	
	this.fBlindContainer = _blindContainer;
	this.fSprLoading = _sprLoading;
	this.fTxtProgress = _txtProgress;
	/* --- post-init-begin --- */

	this.fBlind = this.game.add.graphics(0, 0);
	this.fBlind.beginFill(0x000000);
	this.fBlind.drawRect(0, 0, this.game.world.width, this.game.world.height);
	this.fBlind.inputEnabled = true;
	this.fBlind.alpha = 0.7;
	_blindContainer.add(this.fBlind);
	
	this.visible = false;
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var RunzLoading_proto = Object.create(Phaser.Group.prototype);
RunzLoading.prototype = RunzLoading_proto;
RunzLoading.prototype.constructor = RunzLoading;

/* --- end generated code --- */
// -- user code here --
RunzLoading.prototype.startLoading = function (inLoadingMessage) {
	var progMessage = inLoadingMessage || null;
	if (progMessage === null) {
		this.fTxtProgress.visible = false;
	} else {
		this.fTxtProgress.visible = true;
		this.fTxtProgress.text = inLoadingMessage;
	}

	this.visible = true;
	this.fSprLoading.animations.play("loading", 10, true);
	return this;
};

RunzLoading.prototype.stopLoading = function() {
	this.fSprLoading.animations.stop("loading");
	this.visible = false;
};