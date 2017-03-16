function Boot() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Boot.prototype = proto;

Boot.prototype.init = function() {
	this.game.input.maxPointers = 1;
	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	
	this.game.scale.pageAlignVertically = true;
	this.game.scale.pageAlignHorizontally = true;
};

Boot.prototype.preload = function() {
};

Boot.prototype.create = function() {
	
	this.game.stage.backgroundColor = "#ffffff";
	this.game.state.start("Preload");
	
};