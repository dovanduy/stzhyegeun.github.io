/**
 * Menu state.
 */
function Menu() {
	Phaser.State.call(this);
	
	this.currentEpisode = 1;
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Menu.prototype = proto;

Menu.prototype.preload = function() {
	
	this.scene = new MainMenu(this.game);
	
};

Menu.prototype.create = function() {

	// 백그라운드 이미지 설정
	/*
	var background = this.add.sprite(this.world.centerX, this.world.centerY, "ingame_bg1");
	background.anchor.set(0.5, 0.5);
	background.scale.set(this.world.width / background.width, this.world.height / background.height);
	
	this.scene.fBackground.add(background);
	this.scene.bringToTop(this.scene.fButtons);
	*/
	
	this.MakeBackground(this.currentEpisode, this.scene);
	this.MakeStageTextOnButton(this.currentEpisode, this.scene);
	
	this.scene.fBtn_left.events.onInputDown.add(Menu.OnBtnLeftSelected, this);
	this.scene.fBtn_right.events.onInputDown.add(Menu.OnBtnRightSelected, this);
};


Menu.prototype.MakeBackground = function(inEpisodeNumber, inParent) {
	var background = this.add.sprite(this.world.centerX, this.world.centerY, "ingame_bg" + inEpisodeNumber);
	background.anchor.set(0.5, 0.5);
	background.scale.set(this.world.width / background.width, this.world.height / background.height);
	
	inParent.fBackground.add(background);
	inParent.bringToTop(inParent.fButtons);
};

Menu.prototype.MakeStageTextOnButton = function(inEpisodeNumber, inParent) {
	
	for (var i = 1; i <= StzCommon.StzConfig.stage_per_episode; i++) {
		var stageNumber = ((inEpisodeNumber - 1) * StzCommon.StzConfig.stage_per_episode) + i;
		inParent['fTxt_stage_' + i] = this.add.text(inParent['fBtn_stage_'+i].x, inParent['fBtn_stage_'+i].y, ""+stageNumber);
		inParent['fTxt_stage_' + i].anchor.set(0.5, 0.5);
		inParent.fButtons.add(inParent['fTxt_stage_' + i]);
	}
};

Menu.OnBtnLeftSelected = function(sprite, pointer) {
	
	if (this.currentEpisode <= 1) {
		return;
	}
	// Update episode number
	this.currentEpisode = this.currentEpisode - 1;
	
	// make new scene
	var tempScene = new MainMenu(this.game);
	this.MakeBackground(this.currentEpisode, tempScene);
	this.MakeStageTextOnButton(this.currentEpisode, tempScene);
	
	// Tween
	tempScene.fBackground.position.x = -1 * this.game.world.width;
	tempScene.fButtons.position.x = -1 * this.game.world.width;
	
	this.game.add.tween(this.scene.fBackground).to({x: this.game.world.width}, 1000, "Linear", true);
	this.game.add.tween(this.scene.fButtons).to({x: this.game.world.width}, 1000, "Linear", true);
	this.game.add.tween(tempScene.fBackground).to({x: 0}, 1000, "Linear", true);
	this.game.add.tween(tempScene.fButtons).to({x: 0}, 1000, "Linear", true);
	
	this.scene = tempScene;
	
	this.scene.fBtn_left.events.onInputDown.add(Menu.OnBtnLeftSelected, this);
	this.scene.fBtn_right.events.onInputDown.add(Menu.OnBtnRightSelected, this);
	
};

Menu.OnBtnRightSelected = function(sprite, pointer) {
	
	if (this.currentEpisode >= StzCommon.StzConfig.episode_count) {
		return;
	}
	// Update episode number
	this.currentEpisode = this.currentEpisode + 1;
	
	// make new menu scene
	var tempScene = new MainMenu(this.game);
	this.MakeBackground(this.currentEpisode, tempScene);
	this.MakeStageTextOnButton(this.currentEpisode, tempScene);

	// Tween
	tempScene.fBackground.position.x = this.game.world.width;
	tempScene.fButtons.position.x = this.game.world.width;
	
	this.game.add.tween(this.scene.fBackground).to({x: -1 * this.game.world.width}, 1000, "Linear", true);
	this.game.add.tween(this.scene.fButtons).to({x: -1 * this.game.world.width}, 1000, "Linear", true);
	this.game.add.tween(tempScene.fBackground).to({x: 0}, 1000, "Linear", true);
	this.game.add.tween(tempScene.fButtons).to({x: 0}, 1000, "Linear", true);
	
	this.scene = tempScene;
	
	this.scene.fBtn_left.events.onInputDown.add(Menu.OnBtnLeftSelected, this);
	this.scene.fBtn_right.events.onInputDown.add(Menu.OnBtnRightSelected, this);

};


Menu.prototype.startGame = function() {
	this.game.state.start("Level");
};