/**
 * Boot state.
 */
function Boot() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Boot.prototype = proto;

Boot.prototype.init = function() {
	this.input.maxPointers = 1;

	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
};

Boot.prototype.preload = function() {};

Boot.prototype.create = function() {
	this.game.stage.backgroundColor = '#ffffff';
	this.game.add.image(this.game.width / 2, this.game.height / 2, 'stz_logo').anchor.setTo(0.5);
	
	this.game.state.add('Lobby', Lobby);
	
	this.game.load.onLoadStart.add(this.OnBootLoadStart, this);
	this.game.load.onFileComplete.add(this.OnBootFileComplete, this);
	this.game.load.onLoadComplete.add(this.OnBootLoadComplete, this);
	
	this.game.load.pack('level', 'assets/assets-pack.json');
	
	this.game.load.start();
};

Boot.prototype.OnBootLoadStart = function() {
	StzCommon.StzLog.print("[Boot] OnBootLoadStart");
};

Boot.prototype.OnBootFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Boot] OnBootLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
};

Boot.prototype.OnBootLoadComplete = function() {
	StzCommon.StzLog.print("[Boot] OnBootLoadComplete");
	
	this.game.load.onLoadStart.remove(this.OnBootLoadStart);
	this.game.load.onFileComplete.remove(this.OnBootFileComplete);
	this.game.load.onLoadComplete.remove(this.OnBootLoadComplete);
	
	this.game.state.start("Lobby");
};