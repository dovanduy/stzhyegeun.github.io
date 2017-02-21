// Generated by Phaser Editor v1.2.1

/**
 * PreloadScene.
 * @param {Phaser.Game} aGame The game.
 * @param {Phaser.Group} aParent The parent group. If not given the game world will be used instead.
 */
function PreloadScene(aGame, aParent) {
	Phaser.Group.call(this, aGame, aParent);

	/* --- pre-init-begin --- */

	// you can insert code here

	/* --- pre-init-end --- */

	this.game.add.sprite(0, 0, 'preload_bg', null, this);

	var preload_title = this.game.add.sprite(480, 640, 'preload_title', null, this);
	preload_title.anchor.setTo(0.5, 0.5);

	var loadingBg = this.game.add.group(this);
	loadingBg.position.setTo(300, 995);

	var loadingBar = this.game.add.group(this);
	loadingBar.position.setTo(321, 1016);

	 // public fields

	this.fLoadingBg = loadingBg;
	this.fLoadingBar = loadingBar;

	/* --- post-init-begin --- */

	// you can insert code here
	this.game.cache.addNinePatch('ImageLoadingBg', 'preload_loading_base', null, 49, 49, 0, 66);
	this.game.cache.addNinePatch('ImageLoadingBar', 'preload_loading_bar', null, 10, 10, 0, 28);
	
	var imgLoadingBg = new Phaser.NinePatchImage(this.game, 0, 0, 'ImageLoadingBg');
	imgLoadingBg.targetWidth = 355;
	imgLoadingBg.UpdateImageSizes();
	this.fLoadingBg.add(imgLoadingBg);
	
	var imgLoadingBar = new Phaser.NinePatchImage(this.game, 0, 0, 'ImageLoadingBar');
	imgLoadingBar.targetWidth = StzGameConfig.PRELOAD_BAR_MIN_WIDTH;
	imgLoadingBar.UpdateImageSizes();
	this.fLoadingBar.add(imgLoadingBar);
	
	

	/* --- post-init-end --- */
}

/** @type Phaser.Group */
var PreloadScene_proto = Object.create(Phaser.Group.prototype);
PreloadScene.prototype = PreloadScene_proto;
PreloadScene.prototype.constructor = Phaser.Group;

/* --- end generated code --- */

// you can insert code here
