// Generated by Phaser Editor v1.2.1

/**
 * InterruptIceScene.
 * @param {Phaser.Game} aGame The game.
 * @param {Phaser.Group} aParent The parent group. If not given the game world will be used instead.
 */
function InterruptIceScene(aGame, aParent) {
	Phaser.Group.call(this, aGame, aParent);

	/* --- pre-init-begin --- */

	// you can insert code here

	/* --- pre-init-end --- */

	var bgIceCounter = this.game.add.sprite(0, 0, 'interruptIce', 'counter_thumb.png', this);

	var countTimer = this.game.add.sprite(95, 22, 'interruptIce', 'ice_05.png', this);

	var iceProfile = this.game.add.group(this);
	iceProfile.position.setTo(64, 65);

	 // public fields

	this.fBgIceCounter = bgIceCounter;
	this.fCountTimer = countTimer;
	this.fIceProfile = iceProfile;

	/* --- post-init-begin --- */
	// you can insert code here

	//setting maskImage;
	this.fProfileMaskImage = this.game.add.sprite(0, 0, 'interruptIce', 'ice_thumb.png');
	this.fProfileMaskImage.visible = false;
	
	// thumbnail setting - 'rivalProfileImage'
	if (this.game.cache.checkImageKey('rivalProfileImage') === true) {

		var rivalImage = this.game.add.image(0, 0, 'rivalProfileImage');
		ratio = this.fProfileMaskImage.width / rivalImage.width;
		rivalImage.scale.setTo(ratio, ratio);
		
		var rivalProfileBMD = this.game.make.bitmapData(this.fProfileMaskImage.width, this.fProfileMaskImage.height);
		rivalProfileBMD.alphaMask(rivalImage, this.fProfileMaskImage);
		this.rivalProfileImage = this.game.add.image(0,0, rivalProfileBMD);
		this.rivalProfileImage.anchor.setTo(0.5, 0.5);
		rivalImage.kill();
	}

	/* --- post-init-end --- */
}

/** @type Phaser.Group */
var InterruptIceScene_proto = Object.create(Phaser.Group.prototype);
InterruptIceScene.prototype = InterruptIceScene_proto;
InterruptIceScene.prototype.constructor = Phaser.Group;
/* --- end generated code --- */

// you can insert code here
InterruptIceScene.prototype.superDestroy = InterruptIceScene.prototype.destroy;
InterruptIceScene.prototype.destroy = function() {
	this.superDestroy();
	
	if (this.fRivalProfileImage) {
		this.fRivalProfileImage.kill();
	}
};

InterruptIceScene.prototype.setIceTimerCount = function(inCount) {
	if (inCount < 1 || inCount > 5) {
		return;
	}
	
	this.fCountTimer.frameName = 'ice_0' + inCount + '.png';	
};

InterruptIceScene.prototype.setCenterPosition = function(inX, inY) {
	var resultX = inX - this.fBgIceCounter.width;
	var resultY = inY - this.fBgIceCounter.height;
	
	this.position.setTo(resultX, resultY);
	
	if (this.rivalProfileImage) {
		this.fIceProfile.add(this.rivalProfileImage);
	}
};
