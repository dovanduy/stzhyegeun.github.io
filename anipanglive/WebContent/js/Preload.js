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
	
	if (window.FBInstant) {
		FBInstant.setLoadingProgress(40);
	}

	game.load.onFileComplete.add(this.fileComplete, this);
	game.load.onLoadComplete.add(this.loadComplete, this);

	game.load.pack("ingame", "assets/assets-pack.json");
	game.load.pack("lobby", "assets/assets-pack.json");

	game.load.start();
};


Preload.prototype.create = function() {
	 this.game.stage.backgroundColor = "#ffffff";
};

Preload.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
    var prog = 50 + 20 * (totalLoaded - 1) / totalFiles;
    if (window.FBInstant) {
    	FBInstant.setLoadingProgress(prog);
    }
};

Preload.prototype.loadComplete = function () {
	// 바인딩을 제거하지 않으면 다른 스테이트의 로딩 완료 시, 여기서 또 처리됨.
	game.load.onLoadStart.removeAll();
	game.load.onFileComplete.removeAll();
	game.load.onLoadComplete.removeAll();

	var userId = "0";
	var userName = "guest";
	var userThumbnail = "ani";
	if (window.FBInstant) {
		FBInstant.setLoadingProgress(100);
		userId = FBInstant.player.getId();
		userName = FBInstant.player.getName();
		userThumbnail = FBInstant.player.getPhoto();
	}
	
	
	if (window.realjs && realjs.realState === realjs.EState.CONNECT) {
		realjs.event.loginListener.add(function(data){
			realjs.realJoinLobby(false);
			if (window.FBInstant) {
				FBInstant.startGameAsync().then(function() {
					this.game.state.start("Lobby");
				});
			} else {
				this.game.state.start("Lobby");
			}
		}, this);
		realjs.realLogin(userId, userName, userThumbnail, '5000', '');
	} else {
		this.game.state.start("Lobby");
	}
};

