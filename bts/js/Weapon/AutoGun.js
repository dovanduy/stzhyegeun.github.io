/**
 *
 */
function AutoGun (inGame, inBulletCount, inBulletKey, inBulletFrame, inBulletContainer) {
	
	this._bulletList = [];
	for (var i = 0; i < inBulletCount; i++) {
		this._bulletList.push(new GunBullet(inGame, inBulletKey, inBulletContainer));
	}

	this.game = inGame;
	
	// public property
	this.bulletSpeed = 800;
	this.fireRate = 200;
	
	// internal property
	this._nextFire = 0;
}

var AutoGun_proto = Object.create(null);
AutoGun.prototype = AutoGun_proto;
AutoGun.prototype.constructor = AutoGun;

AutoGun.prototype.trackSprite = function(inBody, inOffsetX, inOffsetY, inIsTrackRotation) {
	this.trackTarget = inBody;
	this.trackTargetOffsetX = inOffsetX || 0;
	this.trackTargetOffsetY = inOffsetY || 0;
	this.isTrackRotation = inIsTrackRotation || false;
};

AutoGun.prototype.fire = function(inFromBody) {
	var bullet = null;
	
	if (this.game.time.now < this._nextFire) {
		return null;
	}
	for (var i = 0; i < this._bulletList.length; i++) {
		if (this._bulletList[i].alive === true) {
			continue;
		}
		
		bullet = this._bulletList[i];
		
		var offsetX = this.trackTargetOffsetX;
		var offsetY = this.trackTargetOffsetY;
		var angle = 0;
		if (this.trackTarget) {
			offsetX += this.trackTarget.x;
			offsetY += this.trackTarget.y;
			
			if (this.isTrackRotation) {
				angle = this.trackTarget.angle;
			}
		}
		
		var rotatedPosition = new Phaser.Point(offsetX, offsetY);
		rotatedPosition.rotate(this.trackTarget.x, this.trackTarget.y, angle, true);
		
		bullet.fire(rotatedPosition.x, rotatedPosition.y, angle, this.bulletSpeed);
		this._nextFire = this.game.time.now + this.fireRate;
		return bullet;
	}
	return bullet;
};

Phaser.GameObjectFactory.prototype.autoGun = function(quantity, key, frame, group) {
	var autoGunInstance = new AutoGun(this.game, quantity, key, frame, group);
	return autoGunInstance;
};