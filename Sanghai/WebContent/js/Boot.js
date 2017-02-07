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
	// 한번에 한개의 터치만 입력 받음
	this.input.maxPointers = 1;

	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	// 가로 모드만 지원
	this.scale.forceOrientation(true, false);
	
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
};

Boot.prototype.preload = function() {
	
	// 한 스테이트에서 load.start는 한번만 발생해야 한다.
	this.game.load.onLoadStart.add(Boot.OnLoadStart, this);
	this.game.load.onFileComplete.add(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.add(Boot.OnLoadComplete, this);
	
	// boot 스테이트에서 사용할 리소스 로드 
	this.load.pack("boot", "assets/assets-pack.json");
	this.load.pack("preload", "assets/assets-pack.json");
};

Boot.prototype.create = function() {
	// 로고 alpha 블렌딩으로 나타남
	var logo = this.game.add.image(this.game.width / 2, this.game.height / 2, 'stz_logo').anchor.set(0.5, 0.5);
	logo.alpha = 0;

	this.game.add.tween(logo).to({alpha: 1}, 2000, "Linear", true).onComplete.add(Boot.OnTweenComplete, this);
};

Boot.prototype.StartLoadPreloadResources = function() {
	this.load.pack("preload", "assets/assets-pack.json");
	this.load.start();
};

Boot.OnLoadStart = function() {
	console.log("[Boot] OnLoadStart");
};

Boot.OnFileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	console.log("[Boot] OnLoadFileComplete (" + cacheKey + ") - " + progress + "%, " + totalLoaded + " / " + totalFiles);
};

Boot.OnLoadComplete = function() {
	console.log("[Boot] OnLoadComplete");
	this.game.load.onLoadStart.remove(Boot.OnLoadStart);
	this.game.load.onFileComplete.remove(Boot.OnFileComplete, this);
	this.game.load.onLoadComplete.remove(Boot.OnLoadComplete, this);
};

Boot.OnTweenComplete = function() {
	this.game.state.start("Preload");
}