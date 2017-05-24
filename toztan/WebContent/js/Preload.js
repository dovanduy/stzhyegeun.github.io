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
	
	this.game.load.onFileComplete.add(this.fileComplete, this);
	this.game.load.onLoadComplete.add(this.loadComplete, this);

	this.game.load.pack("inGame", "assets/assets-pack.json");

	this.game.load.start();
	
};


Preload.prototype.create = function() {

};

Preload.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
   // var prog = 50 + 20 * (totalLoaded - 1) / totalFiles;
};

Preload.prototype.loadComplete = function () {
	// 바인딩을 제거하지 않으면 다른 스테이트의 로딩 완료 시, 여기서 또 처리됨.
	this.game.load.onLoadStart.removeAll();
	this.game.load.onFileComplete.removeAll();
	this.game.load.onLoadComplete.removeAll();
	
	this.game.state.start("InGame", true);
};

