function Boot() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Boot.prototype = proto;

Boot.prototype.init = function() {
	
};

Boot.prototype.preload = function() {
};

Boot.prototype.create = function() {
	
	this.game.input.maxPointers = 1;
	this.game.stage.disableVisibilityChange = true;
	this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.game.scale.pageAlignVertically = true;
	this.game.scale.pageAlignHorizontally = true;
	this.game.scale.setShowAll();
	this.game.scale.refresh();
	
	if (IS_FB_INSTANT === true) {
		FBInstant.setLoadingProgress(30);
	}
	
	this.game.load.onFileComplete.add(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Boot.OnLoadComplete, this);
	
	this.game.load.pack("ingame", "assets/assets-pack.json");
	this.game.load.pack("lobby", "assets/assets-pack.json");
	
	this.game.load.start();
	
};

Boot.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	
	var prog = 30 + 60 * (totalLoaded - 1) / totalFiles;
	if (IS_FB_INSTANT === true) {
		FBInstant.setLoadingProgress(prog);
	}
	StzLog.print("[Boot] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
};

Boot.OnLoadComplete = function() {
	StzLog.print("[Boot] OnLoadComplete");
	
	this.game.load.onLoadStart.removeAll();
	this.game.load.onFileComplete.removeAll();
	this.game.load.onLoadComplete.removeAll();
	
	if (IS_FB_INSTANT === true) {
		FBInstant.setLoadingProgress(100);
		FBInstant.startGameAsync().then(function() {
			this.game.state.start('Lobby');
		});
	} else {
		this.game.state.start('Lobby');
	}
};
