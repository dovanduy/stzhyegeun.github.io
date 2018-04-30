var DinoRunz = {};

DinoRunz.Boot = function (game) {

};

DinoRunz.Boot.prototype = {

    init: function () {
    	this.game.canvas.id = 'gameCanvas';

    	this.game.stage.backgroundColor = "#4D61B0";
    	
        this.input.maxPointers = 1;
        
        this.stage.disableVisibilityChange = false;

        if (this.game.device.desktop)
        {
        	// console.log("desktop mode");
        }
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
    	this.game.scale.setShowAll();
    	this.game.scale.refresh();

		this.game.time.advancedTiming = true;

		var localPlatformId = localStorage.getItem("localPlatformId");
		if(!localPlatformId) {
			localPlatformId = Date.now().toString();
			localStorage.setItem("localPlatformId", localPlatformId);
		}

		PlayerDataManager.setPlatformId((window.FBInstant ? FBInstant.player.getID() : localPlatformId));
		var playerOsType = (window.FBInstant ? FBInstant.getPlatform() : "DEV");
		var playerLocale = (window.FBInstant ? FBInstant.getLocale() : "en_US");
		StzTrans.setLocale('en_US');
		
		var test = PlayerDataManager.getPlatformId();
		Server.userInit(PlayerDataManager.getPlatformId(), playerOsType, playerLocale, function(res) {
			StaticManager.initWithData(res.data.statics, function() {
				window.StaticManager = StaticManager;
				//매니저 init
				GGManager.init(this.game);
				FbManager.init(this.game);
				CharacterManager.init(this.game, StaticManager.dino_runz_character);

				var length = StaticManager.dino_runz_level_design.length;
				DinoRunz.InGame.MAPS = StaticManager.dino_runz_level_design.data;
				DinoRunz.InGame.MAPS.length = length;

				for(var i = 0 ; i < length ; ++i) {
					DinoRunz.InGame.MAPS[i].path = JSON.parse(DinoRunz.InGame.MAPS[i].path);
				}

				DinoRunz.InGame.STAGE_LIST = Object.keys(DinoRunz.InGame.MAPS).filter(function(inItem) {
					return (inItem !== "length");
				}).sort(function(a, b) {
					return Number(a) - Number(b);
				}).map(function(inItem) {
					return Number(inItem);
				});
				
				StzLog.print("Static load completed.");
				
				this.state.start('Preloader');
			}, this);
		}.bind(this), 
		function(err){
			throw new Error("[Boot] UserInit failed!: " + JSON.stringify(err));
		});
    },

    preload: function () {},

    create: function () {
    	// this.state.start('Preloader');
    }
};

window.onload = function() {
    window.FbManager = new FbManager_proto();
    window.GGManager = new GGManager_proto();
	window.PlayerDataManager = new PlayerDataManager_proto();
    window.Server = new ServerManager_proto();
    window.StaticManager = new StaticManager_proto();
	window.StzTrans = new StzTranslator_proto();
	window.ChatbotManager = new ChatbotManager_proto();
	window.CharacterManager = new CharacterManager_proto();
    
	var game = new Phaser.Game(720, 1280, Phaser.CANVAS, 'gameContainer');

	game.state.add('Boot', DinoRunz.Boot);
	game.state.add('Preloader', DinoRunz.Preloader);
	game.state.add("Title", DinoRunz.Title);
	game.state.add('InGame', DinoRunz.InGame);

	if(window.location.href.indexOf("instant-bundle") == -1 && window.location.href.indexOf("https://localhost") == -1) {
		// console.log("FBInstant is null");
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
				 text: "다이노 런즈!!", 
				 data: {}, 
				 strategy: "IMMEDIATE", 
				 notification: "PUSH"
			 }).then(function() {
				//  console.log("invite message sent.");
			 }).catch(function(e) {
				//  console.log("updateAsync error: " + JSON.stringify(e));
			 });
		};
		leaderboard.onClickPlayGameButton = function() {
			leaderboard.closeLeaderboard();
		};
	}
	
	$.getJSON('assets/assets-pack.json', function(inJson) {
		// NOTE (2) 사운드 에셋 키로 사운드 매니저 초기화
		window.sounds = new Sounds(inJson);
		// NOTE (3) FB 초기화 및 게임 실행
		if (window.FBInstant) {
			FBInstant.initializeAsync().then(function() {
				game.state.start('Boot');
			});
			return;
		}
		game.state.start('Boot');
	});
};