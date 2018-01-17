/**
 *
 */
function Preload () {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Preload.prototype = proto;

Preload.prototype.init = function() {
	this.input.maxPointers = 1;
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.game.stage.backgroundColor = 0x4488cc;
};

Preload.prototype.preload = function() {
	this.game.load.pack("ingame", "assets/assets-pack.json");
	this.game.load.image('SHIP_MIDDLE_BLUE', 'assets/images/battleship/B_middle_ship_0.png');
	this.game.load.image("SHIP_MIDDLE_RED", "assets/images/battleship/R_middle_ship_0.png");
	this.game.load.image("SHIP_MIDDLE_YELLOW", "assets/images/battleship/Y_middle_ship_0.png");
	
	this.game.load.image("SHIP_SMALL_BLUE", "assets/images/battleship/B_small_ship_1.png");
	this.game.load.image("SHIP_SMALL_RED", "assets/images/battleship/R_small_ship_1.png");
	this.game.load.image("SHIP_SMALL_YELLOW", "assets/images/battleship/Y_small_ship_1.png");
	
	this.game.load.image("SHIP_BIG_BLUE", "assets/images/battleship/B_big_ship_1.png");
	this.game.load.image("SHIP_BIG_RED", "assets/images/battleship/R_big_ship_1.png");
	this.game.load.image("SHIP_BIG_YELLOW", "assets/images/battleship/Y_big_ship_1.png");
	
	this.game.load.image("BULLET_BLUE", "assets/images/battleship/B_bullet.png");
	this.game.load.image("BULLET_RED", "assets/images/battleship/R_bullet.png");
	this.game.load.image("BULLET_YELLOW", "assets/images/battleship/Y_bullet.png");
	
	this.game.load.image("LASER_BLUE", "assets/images/battleship/B_laser.png");
	this.game.load.image("LASER_RED", "assets/images/battleship/R_laser.png");
	this.game.load.image("LASER_YELLOW", "assets/images/battleship/Y_laser.png");
	
	this.game.load.image("bgSpace", "assets/images/starfield.jpg");
};

Preload.prototype.create = function() {
	this.game.state.start("Level");
};