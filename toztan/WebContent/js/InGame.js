function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;
InGame.prototype.init = function() {
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.stage.backgroundColor = '#000071';
};

InGame.prototype.preload = function() {
	this.player = this.game.add.image(this.game.world.centerX, this.game.world.height - 100, 'ball');
	this.player.anchor.set(0.5, 0.5);
};

InGame.prototype.create = function() {
	// init Controller
	this.controller = InGameController(this);
	
	// init UserInteraction
	this.game.input.onDown.add(this.controller.clickMouse, this.controller);
	this.game.input.addMoveCallback(this.controller.moveMouse, this.controller);
	this.game.input.onUp.add(this.controller.unClickMouse, this.controller);
	
};

InGame.prototype.update = function() {
	this.controller.updateView();
};