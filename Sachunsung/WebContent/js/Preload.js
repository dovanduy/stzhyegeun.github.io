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
	
	this.scene.fLoading_gage.scale.x = 0;
	
	this.scene.fBtnOnWorld.visible = false;
	this.scene.fBtnOnWorld.events.onInputDown.add(this.onTouchedBtnWorld, this);
	
	this.game.load.onLoadStart.add(Preload.OnLoadStart, this);
	this.game.load.onFileComplete.add(Preload.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Preload.OnLoadComplete, this);
	
	this.game.load.pack("worldmap", "assets/assets-pack.json");
	
	this.game.load.start();
};


Preload.OnLoadStart = function() {
	StzCommon.StzLog.print("[Preload] OnLoadStart");
};

Preload.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Preload] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
	this.scene.fLoading_gage.scale.x = (progress / 100);
};

Preload.OnLoadComplete = function() {
	StzCommon.StzLog.print("[Preload] OnLoadComplete");
	this.game.load.onLoadStart.remove(Preload.OnLoadStart);
	this.game.load.onFileComplete.remove(Preload.OnFileComplete);
	this.game.load.onLoadComplete.remove(Preload.OnLoadComplete);
	
	this.scene.fBtnOnWorld.visible = true;
	this.scene.fBtnOnWorld.inputEnalbed = true;	
};

Preload.prototype.onTouchedBtnWorld = function(){
	StzCommon.StzLog.print("[Preload] onTouchedBtnWorld");
	
	this.game.state.start("Worldmap");
};
