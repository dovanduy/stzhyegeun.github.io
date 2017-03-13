/**
 * Preload state.
 */
function Preload() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Preload.prototype = proto;

Preload.prototype.preload = function() {
	
	this.scene = new PreloadScene(this.game);
	
};

Preload.prototype.create = function() {
	
	this.game.load.onLoadStart.add(Preload.OnLoadStart, this);
	this.game.load.onFileComplete.add(Preload.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Preload.OnLoadComplete, this);
	
	this.game.load.pack("mainUI", "assets/assets-pack.json");
	this.game.load.pack("ingame", "assets/assets-pack.json");
	
	this.game.load.start();
};

Preload.OnLoadStart = function() {
	StzCommon.StzLog.print("[Preload] OnLoadStart");
};

Preload.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Preload] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
	
	// Calculate loadingbar width
	var currentBarWidth = (progress / 100) * this.scene.fImgLoadingBar.MAX_TARGET_WIDTH;
	this.scene.fImgLoadingBar.targetWidth = currentBarWidth;
};

Preload.OnLoadComplete = function() {
	StzCommon.StzLog.print("[Preload] OnLoadComplete");
	
	this.game.load.onLoadStart.removeAll();
	this.game.load.onFileComplete.removeAll();
	this.game.load.onLoadComplete.removeAll();
	
	//this.game.state.add("InGame", InGame);
	//this.game.state.start("InGame");
	
	this.game.state.start("Lobby");
};
