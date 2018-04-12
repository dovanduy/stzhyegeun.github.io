
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * WorldUserProfile.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.
    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function WorldUserProfile(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _sprUserFrame = this.game.add.sprite(0, 0, 'MenuScene', 'default_thumb.png', this);
	_sprUserFrame.anchor.setTo(0.5, 0.5);
	
	var _sprFrameStroke = this.game.add.sprite(0, 0, 'MenuScene', 'img_userFrameStroke.png', this);
	_sprFrameStroke.anchor.setTo(0.5, 0.5);
	
	
	
	// public fields
	
	this.fSprUserFrame = _sprUserFrame;
	/* --- post-init-begin --- */
	var maskProfile = this.game.add.graphics(0, 0, this);
	maskProfile.beginFill(0x000000);
	maskProfile.drawCircle(0, 0, _sprUserFrame.width);
	maskProfile.endFill();
	
	this.fSprUserFrame.mask = maskProfile;
	
	this.game.cache.addNinePatch("nineStageBG", "MenuScene", "img_userStageBG.png", 15, 15, 13, 13);
	var _ninepatch_stageBG = new Phaser.NinePatchImage(this.game, 0, 0, "nineStageBG");
	_ninepatch_stageBG.targetWidth = parseInt(_sprFrameStroke.width) - 10;
	_ninepatch_stageBG.targetHeight = 25;
	_ninepatch_stageBG.position.setTo(-_sprUserFrame.width*0.5, 30);
	_ninepatch_stageBG.anchor.setTo(0.5);
	_ninepatch_stageBG.UpdateImageSizes();
	
	this.addChild(_ninepatch_stageBG);
	_ninepatch_stageBG.position.setTo(0, 42);
	
	this.txtStageNum = this.game.add.text(0, 2.5, "999", {font:"bold 22px Blogger Sans", fill:"#ffffff"}, this);
	this.txtStageNum.anchor.setTo(0.5);
	
	_ninepatch_stageBG.addChild(this.txtStageNum);
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var WorldUserProfile_proto = Object.create(Phaser.Group.prototype);
WorldUserProfile.prototype = WorldUserProfile_proto;
WorldUserProfile.prototype.constructor = WorldUserProfile;

/* --- end generated code --- */
// -- user code here --

WorldUserProfile.prototype.setProfile = function(inStage, userProfileInfo) {
	this.txtStageNum.text = inStage + "";

	userProfileInfo.loadProfileImage(this.game, function() {
		this.fSprUserFrame.loadTexture(userProfileInfo.getImageKey());

		if(this.fSprUserFrame !== 65) {
			this.fSprUserFrame.width = 65;
			this.fSprUserFrame.height = 65;
		}
	}, this);
};