
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * BgBackLayer.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function BgBackLayer(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	this.game.add.sprite(0, 0, 'bg2', null, this);
	
	this.game.add.sprite(-720, 0, 'bg2', null, this);
	
	this.game.add.sprite(0, -1280, 'bg2', null, this);
	
	this.game.add.sprite(-720, -1280, 'bg2', null, this);
	
	
	this.position.setTo(360, 640);
	
}

/** @type Phaser.Group */
var BgBackLayer_proto = Object.create(Phaser.Group.prototype);
BgBackLayer.prototype = BgBackLayer_proto;
BgBackLayer.prototype.constructor = BgBackLayer;

/* --- end generated code --- */
// -- user code here --
BgBackLayer.prototype.kill = function() {
	this.visible = false;
	this.alive = false;
	this.exists = false;
};

BgBackLayer.prototype.reset = function(inX, inY) {
	this.visible = true;
	this.alive = true;
	this.exists = true;
	
	var x = inX || DinoRunz.GameConfig.centerX;
	var y = inY || DinoRunz.GameConfig.centerY;
	
	this.position.setTo(x, y);
};

BgBackLayer.prototype.nextPosition = function(inDirection) {
	var resultPosition = new Phaser.Point(this.x, this.y);
	switch (inDirection) {
	case EDirection.RIGHT:
		resultPosition.x += (720 * 2);
		break;
	case EDirection.DOWN:
		resultPosition.y += (1280 * 2);
		break;
	case EDirection.LEFT:
		resultPosition.x -= (720 * 2);
		break;
	case EDirection.UP:
		resultPosition.y -= (1280 * 2);
		break;
	}
	return resultPosition;
};