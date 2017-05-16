// Generated by Phaser Editor v1.2.1

/**
 * interruptCloudScene.
 * @param {Phaser.Game} aGame The game.
 * @param {Phaser.Group} aParent The parent group. If not given the game world will be used instead.
 */
function interruptCloudScene(aGame, aParent) {
	Phaser.Group.call(this, aGame, aParent);

	/* --- pre-init-begin --- */

	// you can insert code here

	/* --- pre-init-end --- */

	var bgCloudCounter = this.game.add.sprite(0, 0, 'interruptCloud', 'attack_cloud_bg.png', this);

	var countTimer = this.game.add.sprite(174, 139, 'interruptCloud', 'attack_cloud_05.png', this);

	var cloudProfile = this.game.add.group(this);
	cloudProfile.position.setTo(96, 140);

	 // public fields

	this.fBgCloudCounter = bgCloudCounter;
	this.fCountTimer = countTimer;
	this.fCloudProfile = cloudProfile;

	/* --- post-init-begin --- */

	// you can insert code here
	//setting maskImage;
	this.fProfileMaskImage = this.game.add.sprite(0, 0, 'interruptCloud', 'attack_cloud_thumbnail_mask.png');
	this.fProfileMaskImage.visible = false;
	
	// thumbnail setting - 'rivalProfileImage'
	if (this.game.cache.checkImageKey('rivalProfileImage') === true) {

		var rivalImage = this.game.add.image(0, 0, 'rivalProfileImage');
		ratio = this.fProfileMaskImage.width / rivalImage.width;
		rivalImage.scale.setTo(ratio, ratio);
		
		var rivalProfileBMD = this.game.make.bitmapData(this.fProfileMaskImage.width, this.fProfileMaskImage.height);
		rivalProfileBMD.alphaMask(rivalImage, this.fProfileMaskImage);
		this.rivalProfileImage = this.game.add.image(0,0, rivalProfileBMD);
		rivalImage.kill();
	}

	/* --- post-init-end --- */
}

/** @type Phaser.Group */
var interruptCloudScene_proto = Object.create(Phaser.Group.prototype);
interruptCloudScene.prototype = interruptCloudScene_proto;
interruptCloudScene.prototype.constructor = Phaser.Group;

/* --- end generated code --- */

// you can insert code here

interruptCloudScene.prototype.setCloudTimerCount = function(inCount) {
	var timer = Math.floor(inCount/1000);  
	
	if (timer < 1 || timer > 5) {
		return;
	}
	
	this.fCountTimer.frameName = 'attack_cloud_0' + timer + '.png';	
};


interruptCloudScene.prototype.setCenterPosition = function(inX, inY) {
	var resultX = inX - this.fBgCloudCounter.width/2;
	var resultY = inY - this.fBgCloudCounter.height/2;
	
	this.position.setTo(resultX, resultY);
	
	
	if (this.rivalProfileImage) {
		this.fCloudProfile.add(this.rivalProfileImage);
	}
};

interruptCloudScene.prototype.setMovePosition = function(inX, inY) {
	var rangeMinX = 0;
	var rangeMaxX = InGameBoardConfig.BOARD_WIDTH - this.fBgCloudCounter.width;
	var rangeMinY = InGameBoardConfig.BOARD_Y_OFFSET;
	var rangeMaxY = InGameBoardConfig.BOARD_Y_OFFSET + InGameBoardConfig.BOARD_HEIGHT - this.fBgCloudCounter.height;
	
	if((this.position.x + inX > rangeMinX) && (this.position.x + inX <= rangeMaxX)){
		this.position.x += inX;
	}
	
	if((this.position.y + inY > rangeMinY) && (this.position.y + inY <= rangeMaxY)){
		this.position.y += inY;
	}
	
};

interruptCloudScene.prototype.superDestroy = interruptCloudScene.prototype.destroy;
interruptCloudScene.prototype.destroy = function() {
	this.superDestroy();
	
	if (this.fRivalProfileImage) {
		this.fRivalProfileImage.kill();
	}
};