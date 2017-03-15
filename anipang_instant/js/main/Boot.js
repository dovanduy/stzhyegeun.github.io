/**
 * Boot state.
 */
function Boot() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Boot.prototype = proto;

Boot.prototype.preload = function() {

	if (USE_FB_INTEGRATION === true) {
		FBInstant.setLoadingProgress(30);	
	}
};

Boot.prototype.create = function() {

	this.input.maxPointers = 1;
	this.game.stage.disableVisibleityChange = true;
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.game.scale.setShowAll();
	this.game.scale.refresh();
	
	this.game.state.start("Preload");
};
