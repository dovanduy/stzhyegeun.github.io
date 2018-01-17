/**
 *
 */
function GunBullet (inGame, inKey, inContainer) {
	
	Phaser.Sprite.call(this, inGame, 0, 0, inKey, null);

	if (inContainer) {
		inContainer.add(this);
	}

	this.game = inGame;
	
	this.scale.set(1);
	this.anchor.set(0.5);
	
	this.visible = false;
	this.alive = false;
	this.exists = false;
	this.checkWorldBounds = false;
	this.outOfBoundsKill = false;
	
	this.game.physics.p2.enable(this, true);
	this.game.add.existing(this);
	this.body.data.shapes[0].name = "bullet";
}

var GunBullet_proto = Object.create(Phaser.Sprite.prototype);
GunBullet.prototype = GunBullet_proto;
GunBullet.prototype.constructor = GunBullet;

GunBullet.prototype.fire = function(inX, inY, inAngle, inSpeed) {
	
	if (this.alive) {
		return;
	}
	
	this.revive();
	this.reset(inX, inY);
	
	this.body.fromX = this.world.x;
	this.body.fromY = this.world.y;
	
	this.body.angle = inAngle;
	
	this.body.velocity.x = Math.cos(this.body.rotation) * inSpeed;
	this.body.velocity.y = Math.sin(this.body.rotation) * inSpeed;
};

GunBullet.prototype.distanceToXY = function(displayObject, x, y, world) {
	if (world === undefined) { world = false; }

    var dx = (world) ? displayObject.world.x - x : displayObject.x - x;
    var dy = (world) ? displayObject.world.y - y : displayObject.y - y;

    return Math.sqrt(dx * dx + dy * dy);
};

GunBullet.prototype.update = function() {
	
	if (this.alive === false) {
		return;
	}
};

GunBullet.prototype.kill = function() {
	this.body.velocity.x = 0;
	this.body.velocity.y = 0;
	
	this.alive = false;
	this.exists = false;
	this.visible = false;
	
	return this;
};

