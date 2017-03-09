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

Boot.prototype.create = function() {
	
	this.game.stage.backgroundColor = '#fff';
	
	var logo = this.game.add.image(this.game.width / 2, this.game.height / 2, 'stz_logo').anchor.setTo(0.5, 0.5);
	
	this.game.state.add('Preload', Preload);
	
	this.game.load.pack('preload', 'assets/assets-pack.json');
	
	this.game.load.onLoadStart.add(Boot.OnLoadStart, this);
	this.game.load.onFileComplete.add(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Boot.OnLoadComplete, this);
	
	this.game.load.start();
};

Boot.OnLoadStart = function() {
	StzCommon.StzLog.print('[Boot] onBootLoadStart');
};

Boot.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Boot] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
};

Boot.OnLoadComplete = function() {
	
	StzCommon.StzLog.print("[Boot] OnLoadComplete");
	
	this.game.load.onLoadStart.removeAll();
	this.game.load.onFileComplete.removeAll();
	this.game.load.onLoadComplete.removeAll();
	
	this.game.state.start("Preload");
};
