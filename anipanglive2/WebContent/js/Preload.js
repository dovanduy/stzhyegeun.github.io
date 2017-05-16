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
	game.load.pack("result", "assets/assets-pack.json");

	game.load.start();
};


Preload.prototype.create = function() {
	 this.game.stage.backgroundColor = "#000000";
	 
	// 보안 저장소 초기화
	if (!window.securityStorage) {
		window.securityStorage = new SecurityStorage();
	}
	window.securityStorage.init();
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

	StzSoundList[ESoundName.BGM_GAME] = game.add.audio(ESoundName.BGM_GAME);
	StzSoundList[ESoundName.SE_BLOCK_CLICK] = game.add.audio(ESoundName.SE_BLOCK_CLICK);
	StzSoundList[ESoundName.SE_BLOCK_MISSMATCH] = game.add.audio(ESoundName.SE_BLOCK_MISSMATCH);
	StzSoundList[ESoundName.SE_BLOCK_SWITCH] = game.add.audio(ESoundName.SE_BLOCK_SWITCH);
	StzSoundList[ESoundName.SE_COMBO3] = game.add.audio(ESoundName.SE_COMBO3);
	StzSoundList[ESoundName.SE_COMBO5] = game.add.audio(ESoundName.SE_COMBO5);
	StzSoundList[ESoundName.SE_COMBO7] = game.add.audio(ESoundName.SE_COMBO7);
	StzSoundList[ESoundName.SE_MATCH1_1] = game.add.audio(ESoundName.SE_MATCH1_1);
	StzSoundList[ESoundName.SE_MATCH1_2] = game.add.audio(ESoundName.SE_MATCH1_2);
	StzSoundList[ESoundName.SE_MATCH2_1] = game.add.audio(ESoundName.SE_MATCH2_1);
	StzSoundList[ESoundName.SE_MATCH2_2] = game.add.audio(ESoundName.SE_MATCH2_2);
	StzSoundList[ESoundName.SE_MATCH3_1] = game.add.audio(ESoundName.SE_MATCH3_1);
	StzSoundList[ESoundName.SE_MATCH3_2] = game.add.audio(ESoundName.SE_MATCH3_2);
	StzSoundList[ESoundName.SE_FEVER_LOOP] = game.add.audio(ESoundName.SE_FEVER_LOOP);
	StzSoundList[ESoundName.SE_READY_VOICE] = game.add.audio(ESoundName.SE_READY_VOICE);
	StzSoundList[ESoundName.SE_RESULT] = game.add.audio(ESoundName.SE_RESULT);
	StzSoundList[ESoundName.SE_START_VOICE] = game.add.audio(ESoundName.SE_START_VOICE);
	StzSoundList[ESoundName.SE_MATCH_SPECIAL] = game.add.audio(ESoundName.SE_MATCH_SPECIAL);
	StzSoundList[ESoundName.SE_SKILL_FULL] = game.add.audio(ESoundName.SE_SKILL_FULL);
	StzSoundList[ESoundName.SE_ICE_ATTACK] = game.add.audio(ESoundName.SE_ICE_ATTACK);
	StzSoundList[ESoundName.SE_RAIN_ATTACK] = game.add.audio(ESoundName.SE_RAIN_ATTACK);
	StzSoundList[ESoundName.SE_SKILL_BUTTON] = game.add.audio(ESoundName.SE_SKILL_BUTTON);
	StzSoundList[ESoundName.SE_COUNTDOWN1] = game.add.audio(ESoundName.SE_COUNTDOWN1);
	StzSoundList[ESoundName.SE_COUNTDOWN2] = game.add.audio(ESoundName.SE_COUNTDOWN2);
	StzSoundList[ESoundName.BGM_FEVER] = game.add.audio(ESoundName.BGM_FEVER);
	StzSoundList[ESoundName.BGM_MATCHING] = game.add.audio(ESoundName.BGM_MATCHING);
	StzSoundList[ESoundName.SE_MATCHING_RATTLE] = game.add.audio(ESoundName.SE_MATCHING_RATTLE);
	StzSoundList[ESoundName.SE_MATCHING_COMPLETE] = game.add.audio(ESoundName.SE_MATCHING_COMPLETE);
	
	if (window.FBInstant) {
		FBInstant.setLoadingProgress(100);
		window.MeInfo.id = FBInstant.player.getID();
		window.MeInfo.name = FBInstant.player.getName();
		window.MeInfo.thumbnail = FBInstant.player.getPhoto();
	}
	else{
		window.MeInfo.badge = new Badge(this.game, StzGameConfig.ME_BADGE_SCORE_DUMY);
	}
	
	if (window.realjs && realjs.realState === realjs.EState.CONNECT) {
		realjs.event.loginListener.removeAll();
		realjs.event.loginListener.add(function(data){
			
			if (data.hasOwnProperty('id')) {
				window.MeInfo.real_id = data.id;
			}
			
			if (data.hasOwnProperty('trophy')) {
				securityStorage.setInt('meTrophy', data.trophy);
				window.MeInfo.badge = new Badge(this.game,  securityStorage.getInt('meTrophy'));
			}
			else{
				securityStorage.setInt('meTrophy', 0);
				window.MeInfo.badge = new Badge(this.game,  securityStorage.getInt('meTrophy'));
			}
			
			this.game.state.start("Lobby");
		}, this);
		realjs.realLogin(window.MeInfo.id, window.MeInfo.name, window.MeInfo.thumbnail);
	} else {
		this.game.state.start("Lobby");
	}
};

