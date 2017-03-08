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
	var logo = this.game.add.image(this.game.width / 2, this.game.height / 2, 'stz_logo').anchor.set(0.5, 0.5);

	this.game.state.add("Lobby", Lobby);
	this.game.state.add("InGame", InGame);
	
	this.game.load.onLoadStart.add(Boot.OnLoadStart, this);
	this.game.load.onFileComplete.add(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Boot.OnLoadComplete, this);
	
	this.game.load.pack("lobby", "assets/assets-pack.json");
	this.game.load.pack("ingame", "assets/assets-pack.json");
	
	this.game.load.start();
};

Boot.OnLoadStart = function() {
	StzCommon.StzLog.print("[Boot] OnLoadStart");
};


Boot.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Boot] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
};

Boot.OnLoadComplete = function() {
	StzCommon.StzLog.print("[Boot] OnLoadComplete");
	this.game.load.onLoadStart.remove(Boot.OnLoadStart);
	this.game.load.onFileComplete.remove(Boot.OnFileComplete);
	this.game.load.onLoadComplete.remove(Boot.OnLoadComplete);
	
	this.game.state.start("Lobby");
};
