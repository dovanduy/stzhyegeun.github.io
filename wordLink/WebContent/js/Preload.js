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
	
//	if (USE_FB_INTEGRATION === true) {
//        FBInstant.setLoadingProgress(40);    
//    }

    game.load.onFileComplete.add(this.fileComplete, this);
    game.load.onLoadComplete.add(this.loadComplete, this);

    game.load.pack("ingame", "assets/assets-pack.json");
    game.load.pack("lobby", "assets/assets-pack.json");
  
    game.load.start();
};

Preload.prototype.create = function() {};

Preload.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
    var prog = 50 + 20 * (totalLoaded - 1) / totalFiles;
//    if (USE_FB_INTEGRATION === true) {
//	   FBInstant.setLoadingProgress(prog);
//
//    }
    //console.log("File Complete (" + cacheKey + ") : " + progress + "% - " + totalLoaded + " / " + totalFiles);
};

Preload.prototype.loadComplete = function () {
	console.log("Load Complete.");
	// 바인딩을 제거하지 않으면 다른 스테이트의 로딩 완료 시, 여기서 또 처리됨.
	game.load.onLoadStart.removeAll();
	game.load.onFileComplete.removeAll();
	game.load.onLoadComplete.removeAll();
	//FBInstant.setLoadingProgress(70);
	// 혹은 game.state.current에서 현재 스테이트명과 동일한지 체크하는 방법도 있다.
	//FB_DATA.init();

//    if (USE_FB_INTEGRATION === true) {
//        FBInstant.setLoadingProgress(100);
//        FBInstant.startGameAsync().then(function() {
//            this.game.state.start("Lobby");
//        });
//    } else {
//       this.game.state.start("Lobby"); 
//    }
	
	this.game.state.start("Lobby");
};


