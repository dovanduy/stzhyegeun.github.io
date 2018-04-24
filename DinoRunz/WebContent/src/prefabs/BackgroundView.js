
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * BackgroundView.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function BackgroundView(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _blindLayer = this.game.add.group(this);
	
	var _baseLayer = this.game.add.group(this);
	
	var _backgroundTile2 = this.game.add.sprite(360, 640, 'BGAtlas00', 'q2.jpg', _baseLayer);
	_backgroundTile2.scale.setTo(2.0, 2.0);
	_backgroundTile2.anchor.setTo(0.5, 0.5);
	
	var _backgroundTile1 = this.game.add.sprite(360, 640, 'BGAtlas00', 'q1.jpg', _baseLayer);
	_backgroundTile1.scale.setTo(2.0, 2.0);
	_backgroundTile1.anchor.setTo(0.5, 0.5);
	
	
	
	// public fields
	
	this.fBlindLayer = _blindLayer;
	this.fBaseLayer = _baseLayer;
	this.fBackgroundTile2 = _backgroundTile2;
	this.fBackgroundTile1 = _backgroundTile1;
	/* --- post-init-begin --- */
	
	this.fBgFirst = this.game.add.graphics(0, 0, this);
	this.fBgFirst.beginFill(Phaser.ArrayUtils.getRandomItem(BackgroundView.LayerColors));
	this.fBgFirst.drawRect(0, 0, DinoRunz.GameConfig.width, DinoRunz.GameConfig.height);
	this.fBlindLayer.add(this.fBgFirst);
	
	this.fBgSecond = this.game.add.graphics(0, 0, this);
	this.fBgSecond.beginFill(Phaser.ArrayUtils.getRandomItemWithout(BackgroundView.LayerColors, 0, BackgroundView.LayerColors.length, [this.fBgFirst.fillColor]));
	this.fBgSecond.drawRect(0, 0, DinoRunz.GameConfig.width, DinoRunz.GameConfig.height);
	this.fBgSecond.alpha = 0;
	this.fBlindLayer.add(this.fBgSecond);
	
	this.fBlindLayer.position.setTo(-DinoRunz.GameConfig.centerX, -DinoRunz.GameConfig.centerY);
	
	this.killRect = new Phaser.Rectangle(-1080, -1920, 2880, 5120);
	
	
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var BackgroundView_proto = Object.create(Phaser.Group.prototype);
BackgroundView.prototype = BackgroundView_proto;
BackgroundView.prototype.constructor = BackgroundView;

/* --- end generated code --- */
// -- user code here --

BackgroundView.LayerColors = [0xb0cf64, 0x64cf9c, 0xc14ec8, 0x7a4bc7, 0x4f4bc7, 0x4b82c7, 0x4bb2c7, 0x884bc7];
BackgroundView.SpriteName = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q14", "q15", "q16", "q17", "q18", "q19", "q21", "q22", "q24", "q25", "q26", "q27", "q28", "q29"];
BackgroundView.SpriteIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 21, 22, 24, 25, 26, 27, 28, 29]
BackgroundView.HardStageBG = ["q13", "q20", "q23", "q30"];
BackgroundView.HardBGIndex = [13, 20, 23, 30];

BackgroundView.prototype.changeColor = function(inStageNum) {
	var isHardStage = (StaticManager.dino_runz_level_design.get(inStageNum-1).mode === EStageMode.HARD);

	var targetObject = null;
	if (DinoRunz.InGame.STAGE_SETTING.isBgImage === false) {
		if (this.fBgFirst.alpha > 0) {
			this.fBlindLayer.bringToTop(this.fBgFirst);
			this.fBgSecond.beginFill(Phaser.ArrayUtils.getRandomItemWithout(BackgroundView.LayerColors, 0, BackgroundView.LayerColors.length, [this.fBgFirst.fillColor]));
			this.fBgSecond.drawRect(0, 0, DinoRunz.GameConfig.width, DinoRunz.GameConfig.height);
			this.fBgSecond.alpha = 1;
			targetObject = this.fBgFirst;
		} else {
			this.fBlindLayer.bringToTop(this.fBgSecond);
			this.fBgFirst.beginFill(Phaser.ArrayUtils.getRandomItemWithout(BackgroundView.LayerColors, 0, BackgroundView.LayerColors.length, [this.fBgSecond.fillColor]));
			this.fBgFirst.drawRect(0, 0, DinoRunz.GameConfig.width, DinoRunz.GameConfig.height);
			this.fBgFirst.alpha = 1;
			targetObject = this.fBgSecond;
		}	
	} else {
		var imageIndex = null;
		if(!isHardStage) imageIndex = this.game.rnd.integerInRange(0, BackgroundView.SpriteName.length-1);
		else imageIndex = this.game.rnd.integerInRange(0, BackgroundView.HardStageBG.length-1);

		// var bgKey = (isHardStage) ? "HardStageBG" : "SpriteName";
		var bgKey = (isHardStage) ? "HardBGIndex" : "SpriteIndex";
		var imageKeyValue = BackgroundView[bgKey][(imageIndex >= BackgroundView[bgKey].length ? 0 : imageIndex)];
		var atlasKeyValue = 0;

		if(imageKeyValue <= 4) {
			atlasKeyValue = 0;
		}
		else if(4 < imageKeyValue && imageKeyValue <= 8) {
			atlasKeyValue = 1;
		}
		else if(8 < imageKeyValue && imageKeyValue <= 12) {
			atlasKeyValue = 2;
		}
		else if(12 < imageKeyValue && imageKeyValue <= 16) {
			atlasKeyValue = 3;
		}
		else if(16 < imageKeyValue && imageKeyValue <= 20) {
			atlasKeyValue = 4;
		}
		else if(20 < imageKeyValue && imageKeyValue <= 24) {
			atlasKeyValue = 5;
		}
		else if(24 < imageKeyValue && imageKeyValue <= 28) {
			atlasKeyValue = 6;
		}
		else if(28 < imageKeyValue && imageKeyValue <= 32) {
			atlasKeyValue = 7;
		}
		
		var atlasName = "BGAtlas" + (atlasKeyValue < 10 ? "0" + atlasKeyValue : atlasKeyValue);
		var imageName = "q" + imageKeyValue + ".jpg";
		
		if (this.fBackgroundTile1.alpha > 0) {
			// if (this.fBackgroundTile1.key === BackgroundView[bgKey][imageIndex]) {
			// 	imageIndex = BackgroundView[bgKey].indexOf(this.fBackgroundTile1.key) + 1;
			// }
			this.fBaseLayer.bringToTop(this.fBackgroundTile1);
			// this.fBackgroundTile2.loadTexture(BackgroundView[bgKey][(imageIndex >= BackgroundView[bgKey].length ? 0 : imageIndex)]);
			
			this.fBackgroundTile2.loadTexture(atlasName, imageName);
			this.fBackgroundTile2.alpha = 1;
			targetObject = this.fBackgroundTile1;
			
		} else {
			// if (this.fBackgroundTile2.key === BackgroundView[bgKey][imageIndex]) {
			// 	imageIndex = BackgroundView[bgKey].indexOf(this.fBackgroundTile2.key) + 1;
			// }
			this.fBaseLayer.bringToTop(this.fBackgroundTile2);
			// this.fBackgroundTile1.loadTexture(BackgroundView[bgKey][(imageIndex >= BackgroundView[bgKey].length ? 0 : imageIndex)]);
			
			this.fBackgroundTile1.loadTexture(atlasName, imageName);
			this.fBackgroundTile1.alpha = 1;
			targetObject = this.fBackgroundTile2;
		}

	}
	
	this.alphaTween = this.game.add.tween(targetObject);
	this.alphaTween.to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
	this.alphaTween.onComplete.addOnce(function(inParam) {
		inParam.alpha = 0;
		this.game.tweens.remove(this.alphaTween);
	}, this);
};

BackgroundView.prototype.setEnable = function(inValue) {
	this.fBaseLayer.visible = inValue;
};

BackgroundView.prototype.setRotation = function(inValue) {
	if (DinoRunz.InGame.STAGE_SETTING.isBgImage === false) {
		return;
	}
	
	if (this.fBaseLayer.rotation === inValue) {
		return;
	}
	this.fBaseLayer.rotation = inValue;
};

