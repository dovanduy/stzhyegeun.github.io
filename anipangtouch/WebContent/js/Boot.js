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
	this.game.input.maxPointers = 1;
	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	
	//this.game.scale.forceOrientation(false, true);
	this.game.scale.pageAlignHorizontally = true;
	//this.game.scale.pageAlignVertically = true;
};

Boot.prototype.preload = function() {
	this.game.load.onLoadStart.add(Boot.OnLoadStart, this);
	this.game.load.onFileComplete.add(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Boot.OnLoadComplete, this);
	
	this.game.load.image('stz_logo', 'assets/images/stz_logo.png');
	this.load.pack("preload", "assets/assets-pack.json");
};

Boot.prototype.create = function() {
	
	this.game.stage.backgroundColor = "#ffffff";
	
	var logo = this.game.add.image(this.game.width / 2, this.game.height / 2, 'stz_logo').anchor.set(0.5, 0.5);
	logo.alpha = 0;
	
	this.game.add.tween(logo).to({alpha: 1}, 2000, "Linear", true).onComplete.add(Boot.OnTweenComplete, this);
};


Boot.OnTweenComplete = function() {
	this.game.state.start("Preload");
}

Boot.OnLoadStart = function() {
	StzCommon.StzLog.print("[Boot] OnLoadStart");
};


Boot.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	StzCommon.StzLog.print("[Boot] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
}


Boot.OnLoadComplete = function() {
	StzCommon.StzLog.print("[Boot] OnLoadComplete");
	this.game.load.onLoadStart.remove(Boot.OnLoadStart);
	this.game.load.onFileComplete.remove(Boot.OnFileComplete);
	this.game.load.onLoadComplete.remove(Boot.OnLoadComplete);
};

