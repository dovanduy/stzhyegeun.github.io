
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * TutorialHand.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function TutorialHand(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _sprWave = this.game.add.sprite(0, 0, 'TutorialAtlas', 'img_wave.png', this);
	_sprWave.anchor.setTo(0.5, 0.5);
	
	var _sprHand = this.game.add.sprite(0, 0, 'TutorialAtlas', 'img_hands.png', this);
	_sprHand.scale.setTo(0.8, 0.8);
	
	
	
	// public fields
	
	this.fSprWave = _sprWave;
	this.fSprHand = _sprHand;
	/* --- post-init-begin --- */
	this.handTween = null;
	this.waveTween = null;
	this.waveAlphaTween1 = null;
	this.waveAlphaTween2 = null;

	this.fSprWave.visible = false;
	this.repeatCount = 0;
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var TutorialHand_proto = Object.create(Phaser.Group.prototype);
TutorialHand.prototype = TutorialHand_proto;
TutorialHand.prototype.constructor = TutorialHand;

/* --- end generated code --- */
// -- user code here --
TutorialHand.prototype.showHand = function () {
	this.repeatCount = 0;
	this.visible = true;

	this.fSprHand.position.setTo(20, 20);

	this.handTween = this.game.add.tween(this.fSprHand).to({x:0, y:0}, 600, Phaser.Easing.Linear.None, true, 0, 500, true);
	this.handTween.onRepeat.add(function () {
		++this.repeatCount;
		if(this.repeatCount % 2 === 0) return;

		this.fSprWave.scale.setTo(1);
		this.fSprWave.visible = true;

		this.waveTween = this.game.add.tween(this.fSprWave.scale).to({x:2.5, y:2.5}, 300, Phaser.Easing.Linear.None, true);
		this.waveTween.onComplete.add(function () {
			this.fSprWave.visible = false;
			this.game.tweens.remove(this.waveTween);
		}, this);

		this.waveAlphaTween1 = this.game.add.tween(this.fSprWave).to({alpha: 1}, 200, Phaser.Easing.Linear.None, true);
		this.waveAlphaTween1.onComplete.add(function () {
			this.game.tweens.remove(this.waveAlphaTween1);

			this.waveAlphaTween2 = this.game.add.tween(this.fSprWave).to({alpha: 0}, 90, Phaser.Easing.Linear.None, true);
			this.waveAlphaTween2.onComplete.add(function () {
				this.game.tweens.remove(this.waveAlphaTween2);
			}, this);
		}, this);
	}, this);
};

TutorialHand.prototype.hideHand = function () {
	this.visible = false;
	if(this.handTween !== null) this.game.tweens.remove(this.handTween);
	if(this.waveTween !== null) this.game.tweens.remove(this.waveTween);
};