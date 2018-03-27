window.onload = function() {
	if(window.location.href.indexOf("instant-bundle") == -1 && window.location.href.indexOf("https://localhost") == -1) {
	    window.FBInstant = null;
	}
	
	// leaderboard setting
	if (leaderboard) {
		leaderboard.onSelectBtnClose = function() {
			leaderboard.closeLeaderboard();
		};
		leaderboard.onInviteFriendCallback = function() {
			if (!window.FBInstant) {
				 return;
			 }
				
			 FBInstant.updateAsync({
				 action: "CUSTOM", 
				 template: "invite", 
				 cta: "플레이하기!!",
				 image: TITLE_IMAGE, 
				 text: "다이노 쏜즈!!", 
				 data: {}, 
				 strategy: "IMMEDIATE", 
				 notification: "PUSH"
			 }).then(function() {
				 StzLog.print("invite message sent.");
			 }).catch(function(e) {
				 StzLog.print("updateAsync error: " + JSON.stringify(e));
			 });
		};
		leaderboard.onClickPlayGameButton = function() {
			leaderboard.closeLeaderboard();
		}
	}
	
	$(document).ajaxError(function(event, xhr, options, exc) {
		 if (xhr.readyState == 0 || xhr.status == 0) {
		    return; //Skip this error
		  }
	});

	$.getJSON('assets/pack.json', function(inJson) {
		// NOTE (2) 사운드 에셋 키로 사운드 매니저 초기화
		window.sounds = new Sounds(inJson);
		// NOTE (3) FB 초기화 및 게임 실행
		if (window.FBInstant) {
			FBInstant.initializeAsync().then(function() {
				startGame();
			});
			return;
		}
		startGame();
	});
};

function startGame() {
	var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.CANVAS, 'gameContainer');
	game.state.add("Boot", Boot);
	game.state.add("Preload", Preload);
	game.state.add("InGame", InGame);
	game.state.start("Boot");
}
