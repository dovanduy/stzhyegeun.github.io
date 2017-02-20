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
	var background = this.add.sprite(this.world.centerX, this.world.centerY, "preload_bg");
	background.anchor.set(0.5, 0.5);
	
	this.scene = new MainMenu(this.game);
};


Menu.prototype.create = function() {
	
	this.SetClickEventsOnMainMenuButtons(this.scene);
	this.MakeStageTextOnButton(this.currentEpisode, this.scene);
};


Menu.prototype.GetStageNumber = function(inEpisodeNumber, inButtonNumber) {
	
	var episodeNumber = Number(inEpisodeNumber);
	var buttonNumber = Number(inButtonNumber);
	
	StzCommon.StzLog.assert(typeof(episodeNumber) === "number", "[Menu (GetStageNumber)] episodeNumber is not numeric value.");
	StzCommon.StzLog.assert(typeof(buttonNumber) === "number", "[Menu (GetStageNumber)] buttonNumber is not numeric value.");
	
	var result = ((episodeNumber - 1) * StzGameConfig.STAGE_PER_EPISODE) + buttonNumber;
	return result;
}


Menu.prototype.MakeStageTextOnButton = function(inEpisodeNumber, inParent) {
	for (var i = 1; i <= StzGameConfig.STAGE_PER_EPISODE; i++) {
		var stageNumber = this.GetStageNumber(inEpisodeNumber, i);
		inParent['fTxt_stage_' + i] = this.add.text(inParent['fBtn_stage_' + i].x, inParent['fBtn_stage_' + i].y, "" + stageNumber);
		inParent['fTxt_stage_' + i].anchor.set(0.5, 0.5);
		inParent.fButtons.add(inParent['fTxt_stage_' + i]);
	}
};


/**
 * 메인 메뉴의 모든 버튼에 대한 이벤트
 * 
 * @param sprite
 * @param pointer
 */
Menu.OnClickMainMenuButtons = function(sprite, pointer) {
	StzCommon.StzLog.print("[Menu] OnClickMainMenuButtons - sprite: " + sprite.name);
	
	var btnStageRegExp = /fBtn_stage_[\d]/;
	var btnArrowRegExp = /fBtn_[left|right]/;
	
	if (btnStageRegExp.test(sprite.name)) {
		// 스테이지 버튼인 경우
		var buttonNumber = sprite.name.match(/fBtn_stage_(.*)/m)[1];
		var stageNumber = this.GetStageNumber(this.currentEpisode, buttonNumber); 
		StzCommon.StzLog.print("[Menu] OnClickMainMenuButtons - click: " + stageNumber);
		
	} else if (btnArrowRegExp.test(sprite.name)) {
		// 방향 버튼인 경우
		switch (sprite.name) {
		case "fBtn_left":
			Menu.OnBtnLeftSelected.apply(this, [sprite, pointer]);
			break;
		case "fBtn_right":
			Menu.OnBtnRightSelected.apply(this, [sprite, pointer]);
			break;
		}
	}
};


/**
 * 메인 메뉴에서 왼쪽 화살표를 눌렀을 때 실행할 함수
 * 
 * @param sprite
 * @param pointer
 */
Menu.OnBtnLeftSelected = function(sprite, pointer) {
	if (this.currentEpisode <= 1) {
		return;
	}
	
	this.currentEpisode = this.currentEpisode - 1;
	
	var tempScene = new MainMenu(this.game);
	this.MakeStageTextOnButton(this.currentEpisode, tempScene);
	
	tempScene.fBackground.position.x = -1 * this.game.world.width;
	tempScene.fButtons.position.x = -1 * this.game.world.width;
	
	this.game.add.tween(this.scene).to({x: this.game.world.width}, 1000, "Quart.easeOut", true).onComplete.addOnce(function() {
		this.scene.destroy(true);
		this.scene = tempScene;
		this.SetClickEventsOnMainMenuButtons(this.scene);
	}, this);
	
	this.game.add.tween(tempScene.fBackground).to({x: 0}, 1000, "Quart.easeOut", true);
	this.game.add.tween(tempScene.fButtons).to({x: 0}, 1000, "Quart.easeOut", true);
};


/**
 * 오른쪽 화살표 눌렀을 때 실행할 함수
 * 
 * @param sprite
 * @param pointer
 */
Menu.OnBtnRightSelected = function(sprite, pointer) {
	if (this.currentEpisode >= StzGameConfig.TOTAL_EPISODE_COUNT) {
		return;
	}
	
	this.currentEpisode = this.currentEpisode + 1;
	
	var tempScene = new MainMenu(this.game);
	this.MakeStageTextOnButton(this.currentEpisode, tempScene);
	
	tempScene.fBackground.position.x = this.game.world.width;
	tempScene.fButtons.position.x = this.game.world.width;
	
	this.game.add.tween(this.scene).to({x: -1 * this.game.world.width}, 1000, "Quart.easeOut", true).onComplete.addOnce(function() {
		this.scene.destroy(true);
		this.scene = tempScene;
		this.SetClickEventsOnMainMenuButtons(this.scene);
	}, this);
	
	this.game.add.tween(tempScene.fBackground).to({x: 0}, 1000, "Quart.easeOut", true);
	this.game.add.tween(tempScene.fButtons).to({x: 0}, 1000, "Quart.easeOut", true);
};


/**
 * 메인 메뉴의 모든 버튼들에 이벤트를 거는 함수 
 * 새로운 MainMenu 객체를 생성할 때마다 실행해줘야 한다.
 * 
 * @param inButtonContext
 */
Menu.prototype.SetClickEventsOnMainMenuButtons = function(inButtonContext) {
	
	var buttonContext = inButtonContext;
	if (buttonContext === null || buttonContext === undefined) {
		buttonContext = this.scene;
	}

	buttonContext.fButtons.forEach(function(item, index) {
		item.events.onInputDown.add(Menu.OnClickMainMenuButtons, this);
	}, this);
};
