/**
* Boot state.
 */
function Boot() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Boot.prototype = proto;

Boot.prototype.create = function() {
	// NOTE 게임 스테이지 설정 
	this.input.maxPointers = 1;
	this.game.stage.disableVisibilityChange = true;
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.pageAlignHorizontally = true;
	this.scale.pageAlignVertically = true;
	this.game.scale.setShowAll();
	this.game.scale.refresh();
	
	this.game.time.advancedTiming = true;
	PlayerDataManager.setPlatformId((window.FBInstant ? FBInstant.player.getID() : "103112311"));

	var playerOsType = (window.FBInstant ? FBInstant.getPlatform() : "DEV");
	var playerLocale = (window.FBInstant ? FBInstant.getLocale() : "en_US");
	StzTrans.setLocale('en_US');
	
	Server.userInit(PlayerDataManager.getPlatformId(), playerOsType, playerLocale, function(res) {
		StaticManager.initWithData(res.data.statics, function() {
			window.StaticManager = StaticManager;
			//매니저 init
			StageManager.init();
			GGManager.init(this.game);
			FbManager.init(this.game);
			
			StzLog.print("Static load completed.");
			this.game.state.start("Preload");
		}, this);
	}.bind(this), 
	function(err){
		throw new Error("[Boot] UserInit failed!: " + JSON.stringify(err));
	});

};
