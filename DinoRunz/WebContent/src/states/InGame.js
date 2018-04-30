DinoRunz.GameConfig = {
	width: 720, height: 1280,
	
	centerX: 360, centerY: 640,
	
	rect: new Phaser.Rectangle(0, 0, 720, 1280),
	
	min_speed: 5, max_speed: 10, 
	
	min_angle: 0, max_angle: 60, angle_time: 300, 
	
	min_scale: 1, max_scale: 1, scale_time: 300, end_scale : 0.5,
	
	showSlowPopCount : 5, showSkipPopCount : 10,
	
	recallAdSeconds : 60,
	
	basicTile_WH : 98
};

DinoRunz.InGame = function () {
	Phaser.State.call(this);
};

DinoRunz.ERotatePattern = {
    NONE: 0, 
    CLOCK_WISE: 1,  
    COUNTER_CLOCK_WISE: 2, 
    ZIGZAG: 3
};

DinoRunz.InGame.restartCount = 0;
DinoRunz.InGame.showInterstitialCount = 0;
DinoRunz.InGame.prevStageNum = 0;
DinoRunz.InGame.overCount = 0;
DinoRunz.InGame.getNewCharacterList = [];
DinoRunz.InGame.isSound = true;
DinoRunz.InGame.isMusic = true;
DinoRunz.InGame.isFirstGame = false;
DinoRunz.InGame.showSlowEffect = false;



var InGame_proto = Object.create(Phaser.State.prototype);
DinoRunz.InGame.prototype = InGame_proto;
DinoRunz.InGame.prototype.constructor = DinoRunz.InGame;



DinoRunz.InGame.STAGE_SETTING = {
	scale: 1, 
	angle: 60,
	rotatePattern: 3,
	isBgImage: true
};

DinoRunz.InGame.EGameState = {
	MENU: 0, 
	READY: 1, 
	RUN: 2, 
	END: 3, 
	GOAL: 4,
	EDIT: 5,
	TUTORIAL: 6,
	ALLSTAGECLEAR: 7
};

DinoRunz.InGame.EGameMode = {
	RUN: 0,
	EDIT: 1, 
	TEST: 2, 
};

DinoRunz.InGame.prototype.setState = function(inState) {
	this._gameState = inState;
};

DinoRunz.InGame.prototype.getState = function() {
	return this._gameState;
};

DinoRunz.InGame.prototype.init = function (inGameMode, inLastClearedStage) {
	this._gameMode = inGameMode || 0;
	this.currentStage = inLastClearedStage || 1;
	this.currentStageMaxJewel = this.getMaxJewelCount(this.currentStage);
	this.currentStageMaxPath = this.getMaxPathCount(this.currentStage);
	this.score = 0;
	this.pathCount = 0;

	this.game.input.onDown.add(this.onTouchScreen, this);
	if (this._gameMode === DinoRunz.InGame.EGameMode.EDIT) {
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.deleteKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DELETE);
		this.goalKey = this.game.input.keyboard.addKey(Phaser.Keyboard.END);
		this.slimKey = this.game.input.keyboard.addKey(Phaser.Keyboard.HOME);
		this.runKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.printKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		this.cursors.up.onUp.add(this.onKeysUp, this, null, this.cursors.up);
		this.cursors.down.onUp.add(this.onKeysUp, this, this.cursors.down);
		this.cursors.right.onUp.add(this.onKeysUp, this, this.cursors.right);
		this.cursors.left.onUp.add(this.onKeysUp, this, this.cursors.left);
		
		this.jumpKey.onUp.add(this.onKeysUp, this, this.jumpKey);
		this.deleteKey.onUp.add(this.onKeysUp, this, this.deleteKey);
		this.goalKey.onUp.add(this.onKeysUp, this, this.goalKey);
		this.slimKey.onUp.add(this.onKeysUp, this, this.slimKey);
		this.runKey.onUp.add(this.onKeysUp, this, this.runKey);
		this.printKey.onUp.add(this.onKeysUp, this, this.printKey);
	}

	this.score = 0;
	this.pathCount = 0;
	this.targetRadian = 0;
	this.radianOffset = 0;
	this.bgRadianOffset = 0;
	this.targetScale = 1;
	this.scaleOffset = 0;

	//set tutorial
	this.tutorialCommandCount = 0;
	this.isShowingTuto = false;
	
	this._gameState = (this._gameMode === DinoRunz.InGame.EGameMode.EDIT ? DinoRunz.InGame.EGameState.EDIT : DinoRunz.InGame.EGameState.MENU);
	
	this.getNewDinoInfo = [];

	//set ending
	this.isStageEnd = false;
	this.endTile = null;
	this.tweenLight01 = null;
	this.tweenLight02 = null;
	this.endingCover = null;
	this.endingCurtain = null;
};

DinoRunz.InGame.prototype.create = function () {
	if (this._gameMode === DinoRunz.InGame.EGameMode.EDIT) {
		this.game.camera.scale.setTo(0.5, 0.5);
		this.path.setRotation(0);
	} else {
		this.fBgImage = new BackgroundView(this.game);
		this.fBgImage.fBaseLayer.pivot.setTo(DinoRunz.GameConfig.centerX, DinoRunz.GameConfig.centerY);
		this.fBgImage.fBaseLayer.position.setTo(DinoRunz.GameConfig.centerX, DinoRunz.GameConfig.centerY);
	}

	// set ending depth 정렬...
	this.endingCurtain = this.game.add.sprite(360, 0, "endingCurtain", this.game);
	this.endingCurtain.scale.setTo(180, 1);
	this.endingCurtain.anchor.setTo(0.5, 0);
	this.endingCurtain.visible = false;

	// set hard stage effect
	this.fHardStageGroup = this.game.add.group();
	this.fHardStageGroup.classType = SkullHard;
	this.fHardStageGroup.createMultiple(8);
	this.fHardStageGroup.visible = false;
	
	this.fInGameGroup = this.game.add.group();
	// tiles pool
	this.path = this.game.add.path(this.game);
	this.path.createTiles(this.fInGameGroup);
	// DeadPositionViews pool
	this.fInGamePositionGroup = this.game.add.group();
	this.path.createDeadViews(this.fInGamePositionGroup);
	
	this.path.onChangePath.add(function(inPlayer, inCurrentPathIndex, inNextPath) {

		if (this.currentStage === 1) {
			this.setStageTutorial(inNextPath);
		}

	    if (inNextPath.tileType === ETileType.START) {
	        var firstCommandPath = this.path.getFrontCommandPath();
	        if (firstCommandPath) {
	            firstCommandPath.setCommandEnable(true);
			}
			
			if(this.path.isHardStage) {
				inNextPath.showHardEffect(this.currentStage);
				this.showHardStageEffect();
			}
	    }
		this.pathCount += 1;
		
		inNextPath.checkDeadPositionView(inPlayer);
		
	}, this);

	this.path.onGetJewel.add(function(inPlayer, inPath) {
		window.sounds.sound('sfx_get_jewelry').play();
		this.score += 1;
	}, this);

	this.path.onScreenOut.add(function(inItem) {
		if (!inItem) {
			return;
		}
		
		if (inItem.getIndex() < this.player.getIndex()) {
			inItem.kill();
		}
	}, this);

	this.path.onEnterGoal.add(function(player, goalPath) {
		if (this._gameMode === DinoRunz.InGame.EGameMode.EDIT) {
			return;
		}

		this.player.hideSlowEffect();
		this.hideHardStageEffect();

		var clearedStage = this.currentStage;
		this.checkUnlockDino(clearedStage);

		var crownNum = 0;
		var isAllJewel = (this.score >= this.currentStageMaxJewel);
		var isAllPathClear = (this.pathCount >= this.currentStageMaxPath);
		
		if (isAllJewel) ++crownNum;
		if (isAllPathClear) ++crownNum;

		var clearData = DinoRunz.Storage.UserData.isAllClearList;
		var i, length = clearData.length;

		this.tutorialCommandCount = 0;
		if(clearedStage !== 1) {
			if(crownNum!==0) {
				this.player.showGetCrownEffect(crownNum);
				FbManager.updateAsyncByInviteUpdateView(EShareType.CROWN, {crown: crownNum, stage: clearedStage});
			}
			
		}
		else {
			this.setState(DinoRunz.InGame.EGameState.TUTORIAL);
			this.isShowingTuto = true;

			this.fTutorialCrown.showCrownTuto(function () {
				this.player.showGetCrownEffect(crownNum);
				this.setState(DinoRunz.InGame.EGameState.RUN);
				this.isShowingTuto = false;
				FbManager.updateAsyncByInviteUpdateView(EShareType.CROWN, {crown: crownNum, stage: clearedStage});
			}.bind(this));
		}

		DinoRunz.Storage.updateIsAllClear(clearedStage, isAllJewel, isAllPathClear);
		
		Server.setLog(EServerLogMsg.END, {'p1' : this.path.mode, "p2" : clearedStage, "p3": EStageResult.CLEAR});

		switch(crownNum) {
			case 0://don't get crown
				window.sounds.sound("sfx_goal_2").play();
				break;
			case 1://get silver crown
				window.sounds.sound("sfx_goal_1").play();
				break;
			case 2://get gold crown
				window.sounds.sound("sfx_goal_3").play();
				break;
		}
		
		// add stage
		var nextStage = this.getNextStage(this.path.lastAddedStage);
		if (nextStage > 0) {
			this.path.addPathList(nextStage, DinoRunz.InGame.MAPS[nextStage-1].path);
			this.path.drawPath(null, null, true, nextStage);
			DinoRunz.Storage.UserData.lastFallenBlockId = 0;
		}

		if(this.currentStage === 1) {
			Server.setLog(EServerLogMsg.TUTORIAL, {'p1' : 'clear'});
		}

		FbManager.updateAsyncByInviteUpdateView(EShareType.CLEAR, {charId: DinoRunz.Storage.UserData.lastCharacterId, stage: this.currentStage});

		// set currentStage
		this.currentStage = this.getNextStage(this.currentStage);
		this.currentStageMaxJewel = this.getMaxJewelCount(this.currentStage);
		this.currentStageMaxPath = this.getMaxPathCount(this.currentStage);
		this.score = 0;
		this.pathCount = 0;

		Server.setLog(EServerLogMsg.START, {'p1' : this.path.mode, "p2" : this.currentStage});

		if(this.currentStage === 0) {
			//last stage clear
			this.endingCover.visible = true;
			this.endingCurtain.visible = true;
			this.endTile = this.path.drawPath(null, null, null, null, true);
			this.endTile.fGroupEnding.alpha = 1;
			this.tweenLight01 = this.game.add.tween(this.endTile.fSprLight01).to({alpha : 0}, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
			this.tweenLight02 = this.game.add.tween(this.endTile.fSprLight02).to({alpha : 0}, 500, Phaser.Easing.Linear.None, true, 0, -1, true);
			this.path.alignPositionToCenter(goalPath);
			DinoRunz.Storage.UserData.lastFallenBlockId = 0;
			this.isStageEnd = true;

			this.hideHardStageEffect();
			return;
		}

		// if (this._gameMode === DinoRunz.InGame.EGameMode.TEST || this.currentStage === 0) {
		// 	// this.setState(DinoRunz.InGame.EGameState.GOAL);
		// 	// this.menuScene.openMenu(this.currentStage, MenuScene.EMenuType.LIST, true);
		// 	return;
		// }

		DinoRunz.InGame.prevStageNum = this.currentStage;
		
		// Speed Setting
		var speed = null;
		if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).speed) {
			speed = StaticManager.dino_runz_level_design.get(this.currentStage - 1).speed;
		    this.player.setSpeed(speed);
		} else if (DinoRunz.InGame.MAPS[this.currentStage] && DinoRunz.InGame.MAPS[this.currentStage].speed) {
			speed = DinoRunz.InGame.MAPS[this.currentStage].speed;
			this.player.setSpeed(DinoRunz.InGame.MAPS[this.currentStage].speed);
		} else {
			speed = this.game.rnd.integerInRange(DinoRunz.GameConfig.min_speed, DinoRunz.GameConfig.max_speed);
			this.player.setSpeed(speed);	
		}
		
		// Rotation Angle Setting
		var angle = null;
		if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_angle >= 0) {
			angle = StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_angle; 
            DinoRunz.InGame.STAGE_SETTING.angle = angle;
        } else {
            angle = this.game.rnd.integerInRange(DinoRunz.GameConfig.min_angle, DinoRunz.GameConfig.max_angle);
            DinoRunz.InGame.STAGE_SETTING.angle = angle;
        }
		
		// Rotation Pattern Setting
		if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_pattern) {
		    DinoRunz.InGame.STAGE_SETTING.rotatePattern = StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_pattern;    
		}

		var scale = this.game.rnd.realInRange(DinoRunz.GameConfig.min_scale, DinoRunz.GameConfig.max_scale);
		DinoRunz.InGame.STAGE_SETTING.scale = scale;
		
		this.path.alignPositionToCenter(goalPath);
		
		if (this.fBgImage) {
			this.fBgImage.changeColor(this.currentStage);	
		}
		
		DinoRunz.InGame.overCount = 0;

		++DinoRunz.InGame.showInterstitialCount;

		
		this.showStageInfo(this.currentStage, speed, angle);

		this.player.currentIndexInStage = 0;
	}, this);
	
	// 플레이어 생성
	this.player = new PlayerView(this.game, this.fInGameGroup);
	DinoRunz.InGame.player = this.player;
	this.fInGameGroup.bringToTop(this.player);
	this.player.position.setTo(DinoRunz.GameConfig.width / 2, DinoRunz.GameConfig.height / 2);
	
	// if (this.path.pathList === null || this.path.pathList.length === 0) {
	// 	this.path.addPathEditMode(ETileType.START, this.player);
	// }
	
	this.fUIGroup = this.game.add.group();
	this.score = 0;
	this.pathCount = 0;
	
	this.fMenuGroup = this.game.add.group();
	this.menuScene = new MenuScene(this.game, this.fMenuGroup);
	DinoRunz.InGame.menuScene = this.menuScene;
	this.menuScene.closeMenu();

	this.fFader = this.game.add.graphics(0, 0);
	this.fFader.beginFill(0x000000);
	this.fFader.drawRect(0, 0, this.game.world.width, this.game.world.height);
	
	this.fFader.alpha = 0.7;
	this.fFader.visible = false;

	this.faderTween = null;
	
	if (this._gameMode !== DinoRunz.InGame.EGameMode.EDIT) {
		DinoRunz.titleScene.destroy();
		this.menuScene.openMenu(this.currentStage, MenuScene.EMenuType.LIST);
		this.fadeOut(2000);
	} else {
		this.fBlind = this.game.add.graphics(0, 0);
		this.fBlind.beginFill(0x000000);
		this.fBlind.drawRect(-1 * this.game.world.width, -1 * this.game.world.height, 2 * this.game.world.width, 2 * this.game.world.height);
		this.fBlind.alpha = 0.7;
		this.fBlind.visible = false;
	}

	this.deathEffect = new DinoDeath(this.game, this.fUIGroup);
	this.deathEffect.position.x = DinoRunz.GameConfig.centerX;
	this.deathEffect.position.y = DinoRunz.GameConfig.centerY;

	this.getNewCharacterEffect = new GetNewCharacterEffect(this.game, this.fUIGroup);
	this.getNewCharacterEffect.position.x = DinoRunz.GameConfig.centerX;
	this.getNewCharacterEffect.position.y = -100;
	
	this.getNextUnlockDinoInfo();
	
	//tutorial
	this.callsTutorialStartLog = false;

	this.game.cache.addNinePatch("tutorialMsgBG", "TutorialAtlas", "img_tutoInfo.png", 40, 40, 40, 40);
	this.fTutorialMsg = new Phaser.NinePatchImage(this.game, DinoRunz.GameConfig.centerX, 1100, "tutorialMsgBG");
	this.fTutorialMsg.targetWidth = 700;
	this.fTutorialMsg.targetHeight = 131;
	this.fTutorialMsg.anchor.setTo(0.5);
	this.fTutorialMsg.UpdateImageSizes();
	this.fTutorialMsg.visible = false;
	
	this.fTxtTutorialMsg = this.game.add.text(0, 0, StzTrans.translate(StaticManager.ELocale.tutorial_play_text), {"font":"bold 38px Blogger Sans","fill":"#1a8aa8", "align" : "center"});
	StzUtil.setLimitTextWidth(this.fTxtTutorialMsg, 660);
	this.fTxtTutorialMsg.anchor.setTo(0.5);
	
	this.fTutorialMsg.addChild(this.fTxtTutorialMsg);
	
	this.fTutorialBlind = this.game.add.graphics(0, 0);
	this.fTutorialBlind.beginFill(0x000000);
	this.fTutorialBlind.drawRect(0, 0, this.game.world.width, this.game.world.height);
	
	this.fTutorialBlind.alpha = 0.7;
	this.fTutorialBlind.visible = false;

	this.fTutorialHand = new TutorialHand(this.game, this.fUIGroup);
	this.fTutorialHand.position.setTo(500, 300);
	this.fTutorialHand.visible = false;

	this.fTutorialCrown = new TutorialCrown(this.game, this.fUIGroup);
	this.fTutorialCrown.visible = false;
	
	this.fUIGroup.addChild(this.fTutorialMsg);
	this.fInGameGroup.addChildAt(this.fTutorialBlind, 0);

	//slow effect
	this.fSlowIconEffect = this.game.add.sprite(DinoRunz.GameConfig.centerX, DinoRunz.GameConfig.centerY, 'slowIconAnim', 0);
	this.fSlowIconEffect.anchor.setTo(0.5, 0.5);
	this.fSlowIconAnim = this.fSlowIconEffect.animations.add('slowIcon', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 15, false);
	this.fSlowIconEffect.visible = false;

	// set stage info
	this.fGroupStageInfo = this.game.add.group(this.fUIGroup);
	this.fTxtStageNumber = this.game.add.text(50, 50, "number: ", {"font":"bold 26px Blogger Sans","fill":"#ffffff"}, this.fGroupStageInfo);
	this.fTxtStageSpeed = this.game.add.text(50, 90, "speed: ", {"font":"bold 26px Blogger Sans","fill":"#ffffff"}, this.fGroupStageInfo);
	this.fTxtStageAngle = this.game.add.text(50, 130, "angle: ", {"font":"bold 26px Blogger Sans","fill":"#ffffff"}, this.fGroupStageInfo);

	// set ending
	this.fGroupStageInfo.visible = false;
	this.endingCover = new EndingCover(this.game, this.fUIGroup);
	this.endingCover.visible = false;
	
	// this.setLastUnlockDinoStageNum();
};

DinoRunz.InGame.prototype.getNextStage = function (inStage) {
	var curStageIndex = DinoRunz.InGame.STAGE_LIST.indexOf(inStage-1);
	var nextStageIndex = curStageIndex + 1;
	if (curStageIndex < 0 || nextStageIndex >= DinoRunz.InGame.STAGE_LIST.length) {
		return 0;
	}
	return DinoRunz.InGame.STAGE_LIST[nextStageIndex] + 1;
};

DinoRunz.InGame.prototype.newGame = function(inStartStage, slowSpeed) {
	window.sounds.allStop();
	window.sounds.sound('bgm_ingame').play("", 0, DinoRunz.InGame.isMusic, true);
	
	this.path.tiles.visible = true;
	this.path.initPath();

	this.currentStage = inStartStage;

	if(DinoRunz.InGame.prevStageNum !== this.currentStage) {
		DinoRunz.InGame.prevStageNum = this.currentStage;
		DinoRunz.InGame.overCount = 0;
	}

	this.currentStageMaxJewel = this.getMaxJewelCount(this.currentStage);
	this.currentStageMaxPath = this.getMaxPathCount(this.currentStage);
	if (DinoRunz.InGame.MAPS.hasOwnProperty(this.currentStage - 1)) {
		this.path.addPathList(this.currentStage, DinoRunz.InGame.MAPS[this.currentStage-1].path);
	}
	this.path.drawPath(null, null, true, this.currentStage);
	this.fBgImage.setEnable(DinoRunz.InGame.STAGE_SETTING.isBgImage);
	this.fBgImage.changeColor(this.currentStage);

	if(!DinoRunz.InGame.isFirstGame) {
		DinoRunz.InGame.isFirstGame = true;
		Server.setLog(EServerLogMsg.INIT_STEP, {'p1' : EInitStep.GAME_START});
	}

	Server.setLog(EServerLogMsg.START, {'p1' : this.path.mode, "p2" : this.currentStage});
	
	// 플레이어 생성
	if (!this.player) {
		this.player = new PlayerView(this.game, this.fInGameGroup);
		DinoRunz.InGame.player = this.player;
	}

	this.player.reset();
	this.player.position.setTo(DinoRunz.GameConfig.width / 2, DinoRunz.GameConfig.height / 2);
	this.player.currentIndex = 0;
	this.player.currentTileType = -1;
	this.player.currentTile = null;
	this.player.setDirection(EDirection.UP);
	this.player.alpha = 1;
	
	// Rotate angle setting
	var angle = null;
    if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_angle >= 0) {
		angle = StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_angle;
        DinoRunz.InGame.STAGE_SETTING.angle = angle;
    } else {
        angle = this.game.rnd.integerInRange(DinoRunz.GameConfig.min_angle, DinoRunz.GameConfig.max_angle);
        DinoRunz.InGame.STAGE_SETTING.angle = angle;
    }
    
    // Rotation Pattern Setting
    if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_pattern) {
        DinoRunz.InGame.STAGE_SETTING.rotatePattern = StaticManager.dino_runz_level_design.get(this.currentStage - 1).rotation_pattern;    
    }
    
    var scale = this.game.rnd.realInRange(DinoRunz.GameConfig.min_scale, DinoRunz.GameConfig.max_scale);
    DinoRunz.InGame.STAGE_SETTING.scale = scale;
	
	// this.game.world.pivot.setTo(this.player.x, this.player.y);
	this.fInGameGroup.pivot.setTo(this.player.x, this.player.y);
	this.fInGameGroup.position.setTo(360, 640);

	this.fInGamePositionGroup.pivot.setTo(this.player.x, this.player.y);
	this.fInGamePositionGroup.position.setTo(360, 640);

	this.fBgImage.setRotation(0);

	this.game.camera.follow(this.player.getView());
	
	this.score = 0;
	this.pathCount = 0;
	this.targetRadian = 0;
	this.radianOffset = 0;
	this.bgRadianOffset = 0;
	this.targetScale = 1;
	this.scaleOffset = 0;
	this.tutorialCommandCount = 0;
	
	var firstCommandPath = this.path.getFrontCommandPath();
	if (firstCommandPath) {
		firstCommandPath.setCommandEnable(true);
	}
	
	this.menuScene.closeMenu();
	
	this.path.setRotation(0);
	this.path.setScale(1);
	
	
	this.player.changeCharacter(DinoRunz.Storage.UserData.lastCharacterId);

	// Speed Setting
	var speed = null;
	this.fInGameGroup.scale.setTo(0.9);
	if(!slowSpeed) {
	    if (StaticManager.dino_runz_level_design.get(this.currentStage - 1) && StaticManager.dino_runz_level_design.get(this.currentStage - 1).speed) {
			speed = StaticManager.dino_runz_level_design.get(this.currentStage - 1).speed;
            this.player.setSpeed(speed);
	    } else if (DinoRunz.InGame.MAPS[this.currentStage] && DinoRunz.InGame.MAPS[this.currentStage].speed) {
			speed = DinoRunz.InGame.MAPS[this.currentStage].speed;
			this.player.setSpeed(speed);
		} else {
			speed = this.game.rnd.integerInRange(DinoRunz.GameConfig.min_speed, DinoRunz.GameConfig.max_speed);
			this.player.setSpeed(speed);	
		}

		this.startGame(true, function() {
			if(this.path.isHardStage) {
				this.path.startPath.showHardEffect(this.currentStage);
				this.showHardStageEffect();
			}
		}.bind(this));
	}
	else {
		speed = slowSpeed;
		this.player.setSpeed(slowSpeed);
		this.player.showSlowEffect();
	}

	// tutorial log
	if(this.currentStage === 1) this.callsTutorialStartLog = false;

	this.showStageInfo(this.currentStage, speed, angle);
	this.endingCover.visible = false;
};

DinoRunz.InGame.prototype.getMaxJewelCount = function(inStage) {
	if (DinoRunz.InGame.MAPS.hasOwnProperty(inStage-1) === false) {
		return 0;
	}
	return DinoRunz.InGame.MAPS[inStage-1].path.filter(function(inItem) {
		return (inItem === ETileType.NORMAL);
	}).length;
};

DinoRunz.InGame.prototype.getMaxPathCount = function(inStage) {
	if (DinoRunz.InGame.MAPS.hasOwnProperty(inStage-1) === false) {
		return 0;
	}
	return DinoRunz.InGame.MAPS[inStage-1].path.filter(function(inItem) {
	    return (inItem !== ETileType.NONE) && (inItem !== ETileType.START);
	}).length;
};

DinoRunz.InGame.prototype.onKeysUp = function(inKey) {
	
	if (this.game.input.enabled === false) {
		return;
	}
	
	if (inKey === this.cursors.up) {
		this.player.setDirection(EDirection.UP);
		this.path.addPathEditMode(ETileType.DIRECTION_UP, this.player);
	} else if (inKey === this.cursors.down) {
		this.player.setDirection(EDirection.DOWN);
		this.path.addPathEditMode(ETileType.DIRECTION_DOWN, this.player);
	} else if (inKey === this.cursors.right) {
		this.player.setDirection(EDirection.RIGHT);
		this.path.addPathEditMode(ETileType.DIRECTION_RIGHT, this.player);
	} else if (inKey === this.cursors.left) {
		this.player.setDirection(EDirection.LEFT);
		this.path.addPathEditMode(ETileType.DIRECTION_LEFT, this.player);
	} else if (inKey === this.jumpKey) {
		this.path.addPathEditMode(ETileType.EDITMODE_JUMP, this.player);
		this.path.addPathEditMode(ETileType.NONE, this.player);
	} else if (inKey === this.slimKey) {
		this.path.addPathEditMode(ETileType.SLIM, this.player);
	} else if (inKey === this.deleteKey) {
		var lastTileType = this.path.deleteLastPathEditMode(this.player.direction);
		if (lastTileType !== null) {
			this.player.setDirection(this.path.getDirectionByTileType(lastTileType));
		}
	} else if (inKey === this.goalKey) {
		this.player.setDirection(EDirection.UP);
		this.path.addPathEditMode(ETileType.GOAL, this.player);
		// 저장 로직
		var newSpeed = prompt("Please enter speed: (" + DinoRunz.GameConfig.min_speed + " ~ " + DinoRunz.GameConfig.max_speed + ")", DinoRunz.GameConfig.min_speed);
		var newStage = prompt("Pleaser enter stage:");
		
		this.game.input.enabled = false;
		this.fBlind.visible = true;
		$.ajax({
			type: "POST", 
			url: "/save/map", 
			data: {
				stage: Number(newStage),
				speed: Number(newSpeed),
				path: this.path.pathList
			}, 
			success: function(data) {
				if (data) {	
					DinoRunz.InGame.MAPS = {};
					var maxStage = 0;
					for (var i = 0; i < data.length; i++) {
						var currentData = data[i];
						DinoRunz.InGame.MAPS[currentData.stage] = {
							speed: currentData.speed,
							path: currentData.path
						};
						if (maxStage < currentData.stage) {
							maxStage = currentData.stage;
						}
					}
					DinoRunz.InGame.MAPS.length = maxStage;
				}
				this.game.input.enabled = true;
				this.fBlind.visible = false;
				this.menuScene.openMenu(this.currentStage);	
			}.bind(this)
		});
		
	} else if (inKey === this.runKey) {
		this.player = null;
		DinoRunz.InGame.player = this.player;
		this.menuScene.openMenu(this.currentStage);
		//this.game.state.start("InGame", true, false, DinoRunz.InGame.EGameMode.TEST);
	} else if (inKey === this.printKey) {
		var stringMapData = JSON.stringify(DinoRunz.InGame.MAPS);
		var a = new Blob([stringMapData], {type: "application/json"});
		var url = URL.createObjectURL(a);
		
		var aTag = document.createElement("a");
		var timeStamp = new Date().toISOString().substring(0, 19);
		aTag.download = "maps_" + timeStamp + ".json";
		aTag.href = url;
		aTag.click();
	}
};

DinoRunz.InGame.prototype.onTouchScreen = function() {
	if (this.getState() === DinoRunz.InGame.EGameState.EDIT) {
		return;
	}
	
	if (this.getState() !== DinoRunz.InGame.EGameState.RUN 
			&& this.getState() !== DinoRunz.InGame.EGameState.TUTORIAL) {
		return;
	}

	if (this.player.currentTile === null) return;

	if (this.player.currentTile.tileType === ETileType.GOAL || this.player.currentTile.tileType === ETileType.START || this.istageEnd) {
		return;
	}
	
	if (this.getState() === DinoRunz.InGame.EGameState.TUTORIAL) {
		this.setState(DinoRunz.InGame.EGameState.RUN);
		this.player.animPlay();
		this.hideTutorial();

		this.isShowingTuto = false;
		++this.tutorialCommandCount;
	}
	
	var objCommand = this.path.popFrontCommand();
	var nextCommandPath = this.path.getFrontCommandPath();
	if (nextCommandPath) {
		nextCommandPath.setCommandEnable(true);
	}
	if (!objCommand) {
		return;
	}
	
	var index = Number(objCommand.index);
	var command = Number(objCommand.command);
	var nextPathType = this.path.pathList[index + 1];
	
	if (this.player.getIndex() > index) {
		return;
	}
	
	var rightOffset = 1;
	var leftOffset = -1;
	if (DinoRunz.InGame.STAGE_SETTING.rotatePattern === DinoRunz.ERotatePattern.NONE) {
	    rightOffset = leftOffset = 0;
	} else if (DinoRunz.InGame.STAGE_SETTING.rotatePattern === DinoRunz.ERotatePattern.CLOCK_WISE) {
	    rightOffset = leftOffset = 1;
	} else if (DinoRunz.InGame.STAGE_SETTING.rotatePattern === DinoRunz.ERotatePattern.COUNTER_CLOCK_WISE) {
	    rightOffset = leftOffset = -1;
	}

	if (command === EDirection.UP || command === EDirection.DOWN) {
		this.targetRadian = 0;
	} else if (command === EDirection.RIGHT) {
		this.targetRadian = Phaser.Math.degToRad(rightOffset * DinoRunz.InGame.STAGE_SETTING.angle);
	} else if (command = EDirection.LEFT) {
		this.targetRadian = Phaser.Math.degToRad(leftOffset * DinoRunz.InGame.STAGE_SETTING.angle);
	}
	this.radianOffset = (this.targetRadian - this.path.getRotation()) / DinoRunz.GameConfig.angle_time;
	
	if (this.targetScale === 1) {
		this.targetScale = DinoRunz.InGame.STAGE_SETTING.scale;
	} else {
		this.targetScale = 1;
	}
	this.scaleOffset = (this.targetScale - this.path.getScale()) / DinoRunz.GameConfig.scale_time;
	this.player.applyCommand(command, (nextPathType === ETileType.NONE));
};

DinoRunz.InGame.prototype.update = function() {
	
	if (this.getState() === DinoRunz.InGame.EGameState.EDIT) {
		return;
	}

	if (this.isStageEnd) {
		if(this.player.position.y <= this.endTile.position.y) {
			this.setState(DinoRunz.InGame.EGameState.ALLSTAGECLEAR);
			this.showEndStageEffect();
			this.isStageEnd = false;
			return;
		}
	}

	if (DinoRunz.InGame.showSlowEffect) {
		DinoRunz.InGame.showSlowEffect = false;
		this.showSlowIconEffect();
	}
	
	if (this.getState() !== DinoRunz.InGame.EGameState.RUN && this.getState() !== DinoRunz.InGame.EGameState.TUTORIAL) {
		return;
	}

	if (this.getState() === DinoRunz.InGame.EGameState.TUTORIAL) {
		if(!this.isShowingTuto) {
			if (this.tutorialCommandCount < 2) {
				switch(this.player.direction) {
					case EDirection.UP:
					if(this.player.position.y <= this.player.currentTile.position.y) {
						this.player.animStop();
						this.showTutorial();		
						return;
					}
					break;
					case EDirection.RIGHT:
					if(this.player.position.x >= this.player.currentTile.position.x) {
						this.player.animStop();
						this.showTutorial();
						return;
					}
					break;
					case EDirection.LEFT:
					if(this.player.position.x <= this.player.currentTile.position.x) {
						this.player.animStop();
						this.showTutorial();
						return;
					}
					break;
				}
			}
			else {
				this.showTutorial();
			}
		}
		else {
			if (this.tutorialCommandCount < 2) return;
		}
	} 

	this.player.updateJump(this.player.getSpeed());
	this.path.updatePosition(this.player.direction, (this.getState() !== DinoRunz.InGame.EGameState.TUTORIAL) ? this.player.getSpeed() : 1.5);//default
	// this.player.move(this.player.direction, (this.getState() !== DinoRunz.InGame.EGameState.TUTORIAL) ? this.player.getSpeed() : 1.5);//test
	
	if (/*Math.abs(this.targetScale - this.path.getScale())*/(this.targetScale - this.path.getScale()) !== 0) {
		if (this.scaleOffset === 0) {
		    this.path.setScale(this.targetScale);
		} else if (this.scaleOffset > 0) {
		    this.path.setScale((this.path.getScale() + this.scaleOffset * this.game.time.elapsed > this.targetScale ? this.targetScale : this.path.getScale() + this.scaleOffset * this.game.time.elapsed));
		} else if (this.scaleOffset < 0) {
		    this.path.setScale((this.path.getScale() + this.scaleOffset * this.game.time.elapsed < this.targetScale ? this.targetScale : this.path.getScale() + this.scaleOffset * this.game.time.elapsed));
		}
	} else if (this.targetScale !== 1) {
		this.targetScale = 1;
		this.scaleOffset = (this.targetScale - this.path.getScale()) / DinoRunz.GameConfig.scale_time;
	}
	
	if (/*Math.abs(this.targetRadian - this.path.getRotation())*/(this.targetRadian - this.path.getRotation()) !== 0) {
		if (this.radianOffset === 0) {
		    this.path.setRotation(this.targetRadian);
		} else if (this.radianOffset > 0) {
		    this.path.setRotation((this.path.getRotation() + this.radianOffset * this.game.time.elapsed > this.targetRadian ? this.targetRadian : this.path.getRotation() + this.radianOffset * this.game.time.elapsed));
		} else {
		    this.path.setRotation(this.path.getRotation() + this.radianOffset * this.game.time.elapsed < this.targetRadian ? this.targetRadian : this.path.getRotation() + this.radianOffset * this.game.time.elapsed);
		}
	}
	
	if (this.fBgImage) {
		this.fBgImage.setRotation(this.path.getRotation());
	}
	
	if (this.path.checkPlayerOnPath(this.player) === false) {
		this.setState(DinoRunz.InGame.EGameState.END);
		
		var fallenBlockId = this.path.getPathByIndex(this.player.getIndex()).getIndexInStage(); 
		
		if(DinoRunz.Storage.UserData.lastFallenBlockId < fallenBlockId) {
		    DinoRunz.Storage.UserData.lastFallenBlockId = fallenBlockId;
		}
		
		if(DinoRunz.InGame.prevStageNum === this.currentStage) ++DinoRunz.InGame.overCount;
		++DinoRunz.InGame.showInterstitialCount;
		
		this.player.kill(function() {
			this.deathEffect.showDeathEffect(this.game.time.elapsed);
			this.hideHardStageEffect();
		}, this);

		this.hideTutorial();
		this.player.hideSlowEffect();
	}
};

DinoRunz.InGame.prototype.setSlow = function() {
	var callback = function () {
		var inGameState = this.game.state.getCurrentState();

		inGameState.menuScene.closeMenu();	
		inGameState.menuScene.popupManager.adPopup.visible = false;
		
		var slowSpeed = DinoRunz.GameConfig.min_speed;
		inGameState.newGame(this.currentStage, slowSpeed);

		DinoRunz.InGame.showSlowEffect = true;
	}.bind(this);

	if(!FBInstant) {
		callback();
		return;
	}

	var adModel = GGManager.getAdModelByPlacementID(EAdType.REWARDED, EAdName.REWARD_SLOW);
	if(adModel) {
		GGManager.setCallbackByPlacementID(EAdName.REWARD_SLOW, callback, function() {
			//load success
		}.bind(this), function() {
			//load fail
			var inGameState = this.game.state.getCurrentState();
			inGameState.menuScene.popupManager.loadFailPopup.showPopup();
		}.bind(this));

		GGManager.show(EAdName.REWARD_SLOW);
		GGManager.adLogSend(adModel.getType(), adModel.getName(), EAdUserAction.ACTION_SHOW);
	}
};

DinoRunz.InGame.prototype.setSkip = function() {
	var skipStage = this.currentStage + 1;
	if(DinoRunz.InGame.MAPS.hasOwnProperty(skipStage) === false) return;

	this.checkUnlockDino(skipStage);

	var callback = function () {
		var inGameState = this.game.state.getCurrentState();
		
		inGameState.menuScene.closeMenu();	
		inGameState.menuScene.popupManager.adPopup.visible = false;

		if(this.currentStage+1>DinoRunz.Storage.UserData.lastClearedStage){
			DinoRunz.Storage.UserData.lastClearedStage = this.currentStage+1;
		}

		inGameState.newGame(this.currentStage+1);
	}.bind(this);

	if(!FBInstant){
		callback();
		return;
	}
	
	var adModel = GGManager.getAdModelByPlacementID(EAdType.REWARDED, EAdName.REWARD_SKIP);
	
	if(adModel) {
		GGManager.setCallbackByPlacementID(EAdName.REWARD_SKIP, callback, function() {
			//load success
		}.bind(this), function() {
			//load fail
			var inGameState = this.game.state.getCurrentState();
			inGameState.menuScene.popupManager.loadFailPopup.showPopup();
		}.bind(this));

		GGManager.show(EAdName.REWARD_SKIP);
		GGManager.adLogSend(adModel.getType(), adModel.getName(), EAdUserAction.ACTION_SHOW);
	}
};

// DinoRunz.InGame.prototype.setLastUnlockDinoStageNum = function () {
// 	var i, length = StaticManager.dino_runz_character.length;
// 	var stageNum = 0;
// 	for(i = 0 ; i < length ; ++i){
// 		var curData = StaticManager.dino_runz_character.get(i+1);
// 		if(curData.unlock_condition === 2){
// 			stageNum = curData.unlock_value;
// 		}
// 	}

// 	this.lastUnlockDinoStage = stageNum;
// 	// console.log("lastUnlockDinoStage: " + this.lastUnlockDinoStage);
// };

DinoRunz.InGame.prototype.getNextUnlockDinoInfo = function(checkedStageNum) {
	var i, length = StaticManager.dino_runz_character.length;
	
	this.nextUnlockStage = -1;
	this.nextUnlockDinoId = -1;
	
	if(!checkedStageNum) checkedStageNum = DinoRunz.Storage.UserData.lastClearedStage;
	for(i = 0 ; i < length ; ++i){
		var curData = StaticManager.dino_runz_character.get(i+1);
		if(curData.unlock_condition === 2){
			if(curData.unlock_value >= checkedStageNum){
				this.nextUnlockStage = curData.unlock_value;
				this.nextUnlockDinoId = curData.id;
				break;
			}
		}
	}
};

DinoRunz.InGame.prototype.checkUnlockDino = function(cleardStage) {
	if(this.nextUnlockStage < 0) return;

	if(cleardStage>=this.nextUnlockStage){
		var getCharId = this.nextUnlockDinoId;

		/*if(cleardStage <= this.lastUnlockDinoStage)*/ this.getNewCharacterEffect.showGetNewCharacter(getCharId);
		var characterName = StaticManager.dino_runz_character.get(getCharId).name;
		FbManager.updateAsyncByInviteUpdateView(EShareType.CHARACTER, {charId : getCharId, name : characterName});
		DinoRunz.InGame.getNewCharacterList.push(getCharId);

		this.getNextUnlockDinoInfo(cleardStage);
	}
};

DinoRunz.InGame.prototype.interstitialRestartShowAd = function(inCallBack){
	if(DinoRunz.InGame.showInterstitialCount >= 5 && GGManager.getAdModelByPlacementID(EAdType.INTERSTITIAL, EAdName.INTERSTITIAL_INGAME_RESTART)){

		GGManager.setCallbackByPlacementID(EAdName.INTERSTITIAL_INGAME_RESTART, function() {
			//showComplete
			DinoRunz.InGame.showInterstitialCount = 0;
			
			if(inCallBack){
				inCallBack();
			}
		}.bind(this), function(){
			//loadSuccse
		}.bind(this), function(){
			//loadFail
			if(inCallBack){
				inCallBack();
			}
		}.bind(this));
		GGManager.show(EAdName.INTERSTITIAL_INGAME_RESTART);
	}
	else{
		if(inCallBack){
			inCallBack();
		}
	}
};

DinoRunz.InGame.prototype.setStageTutorial = function (inNextPath) {
	if(inNextPath.tileType === ETileType.DIRECTION_RIGHT
		|| inNextPath.tileType === ETileType.DIRECTION_DOWN
		|| inNextPath.tileType === ETileType.DIRECTION_LEFT
		|| inNextPath.tileType === ETileType.DIRECTION_UP) {
	
		if(!this.callsTutorialStartLog) {
			Server.setLog(EServerLogMsg.TUTORIAL, {'p1' : 'start'});
			this.callsTutorialStartLog = true;
		}

		this.setState(DinoRunz.InGame.EGameState.TUTORIAL);
		this.game.input.enabled = (this.tutorialCommandCount >= 2);

		this.fTutorialBlind.visible = true;
		this.fTutorialBlind.alpha = 0;
		var tweenTutoBlind = this.game.add.tween(this.fTutorialBlind).to({alpha: 0.8}, 500, Phaser.Easing.Linear.None, true);
		tweenTutoBlind.onComplete.add(function () {
			this.game.tweens.remove(tweenTutoBlind);
		}, this);
	}
};

DinoRunz.InGame.prototype.showTutorial = function () {
	this.isShowingTuto = true;
	
	if((this.tutorialCommandCount >= 2)) {
		//slow 구간
		this.fTutorialHand.showHand();
		return;
	}

	this.fTutorialMsg.visible = true;
	this.fTutorialMsg.position.y = -220;
	var tweenTutoMsg = this.game.add.tween(this.fTutorialMsg).to({y:140}, 1000, Phaser.Easing.Elastic.Out, true);
	tweenTutoMsg.onComplete.add(function () {
		this.game.tweens.remove(tweenTutoMsg);

		setTimeout(function () {
			this.fTutorialHand.showHand();
			this.game.input.enabled = true;
		}.bind(this), 300);
	}, this);
};

DinoRunz.InGame.prototype.hideTutorial = function () {
	this.fTutorialBlind.visible = false;
	this.fTutorialMsg.visible = false;
	this.fTutorialHand.hideHand();
};

DinoRunz.InGame.prototype.showSlowIconEffect = function () {
	this.fFader.visible = true;
	this.fFader.alpha = 0.7;

	this.fSlowIconEffect.visible = true;
	this.fSlowIconEffect.animations.play("slowIcon", 15);

	this.fSlowIconAnim.onComplete.addOnce(function () {
		this.hideSlowIconEffect(function() {
			if(this.path.isHardStage) {
				this.path.startPath.showHardEffect(this.currentStage);
				this.showHardStageEffect();
			}
			
			this.startGame(true);
		}.bind(this));
	}, this);
};

DinoRunz.InGame.prototype.hideSlowIconEffect = function (callback) {
	this.fadeOut(1000, callback, 0.7);
	this.fSlowIconEffect.visible = false;
};

DinoRunz.InGame.prototype.fadeIn = function (destAlpha, milliSecond, callback) {
	this.fFader.visible = true;
	this.fFader.alpha = 0;
	this.faderTween = this.game.add.tween(this.fFader).to({alpha: destAlpha}, milliSecond, Phaser.Easing.Linear.None, true);
	this.faderTween.onComplete.addOnce(function() {
		if(callback) callback();
		this.game.tweens.remove(this.faderTween);
	}, this);
};

DinoRunz.InGame.prototype.fadeOut = function (milliSecond, callback, inAlpha) {
	this.fFader.visible = true;
	this.fFader.tint = 0x000000;
	this.fFader.alpha = (inAlpha) ? inAlpha : 1;
	this.faderTween = this.game.add.tween(this.fFader).to({alpha: 0}, milliSecond, Phaser.Easing.Linear.None, true);
	this.faderTween.onComplete.addOnce(function() {
		if(callback) callback();
		this.game.tweens.remove(this.faderTween);
		this.fFader.visible = false;
	}, this);
};

DinoRunz.InGame.prototype.showHardStageEffect = function () {
	this.fHardStageGroup.visible = true;
	
	var skulls = this.fHardStageGroup.children;
	var i, length = skulls.length;

	for(i = 0 ; i < length ; ++i) {
		var flagX = (i % 2 === 0) ? 100 : 500;
		var posX = this.game.rnd.integerInRange(flagX, flagX + 200);

		var posY = this.game.rnd.integerInRange((i+1) * 100, 100 + (i+1) * 200);

		var delay = i * 300;
		
		skulls[i].play(delay, {x: posX, y: posY});
	}
};

DinoRunz.InGame.prototype.hideHardStageEffect = function () {
	var skulls = this.fHardStageGroup.children;
	var i, length = skulls.length;

	for(i = 0 ; i < length ; ++i) {	
		skulls[i].deleteTweens();
	}

	this.fHardStageGroup.visible = false;
};

DinoRunz.InGame.prototype.setEndLog = function () {
	var inVar = {};

	inVar.p1 = this.path.mode;
	inVar.p2 = this.currentStage;
	inVar.p3 = EStageResult.FAIL;

	Server.setLog(EServerLogMsg.END, inVar);
};

DinoRunz.InGame.prototype.showStageInfo = function (inStageNumber, inStageSpeed, inStageAngle) {
	this.fGroupStageInfo.visible = false;
	return; //홍보영상 제작 지원.	

	if(StzBuildConfig.SERVER_MODE !== EServerMode.DEV) {
		this.fGroupStageInfo.visible = false;
		return;	
	}

	this.fGroupStageInfo.visible = true;

	this.fTxtStageNumber.text = "Stage: " + inStageNumber;
	this.fTxtStageSpeed.text = "Speed: " + inStageSpeed;
	this.fTxtStageAngle.text = "Angle: " + inStageAngle;
};

DinoRunz.InGame.prototype.unlockStage = function (unlockStage) {
	if(unlockStage === undefined) unlockStage = DinoRunz.InGame.MAPS.length;
	DinoRunz.Storage.UserData.lastClearedStage = unlockStage;
	DinoRunz.Storage.UserData.lastFallenBlockId = 0;

	this.getNextUnlockDinoInfo();

	this.menuScene.updateBtnPage();
	this.menuScene.updateBtnStage();
};

DinoRunz.InGame.prototype.rndChangePlayerCharacter = function () {
	var isSelected = false;

	var rndNum = 0;
	while(!isSelected) {
		rndNum = this.game.rnd.integerInRange(1, 10);

		if(DinoRunz.Storage.UserData.isGetDinoList[rndNum-1]) {
			isSelected = true;
		}
	}

	DinoRunz.Storage.UserData.lastCharacterId = rndNum;

	if(this.player!==null) {
		this.player.changeCharacter(rndNum);
	}
	
	this.menuScene.setCharacterIcon(rndNum);
};

DinoRunz.InGame.prototype.showEndStageEffect = function () {
	this.game.camera.fade(0xffffff, 1000, false);
	this.game.camera.onFadeComplete.addOnce(function () {
		this.menuScene.openMenu(320, MenuScene.EMenuType.LIST, true);
		this.game.tweens.remove(this.tweenLight01);
		this.game.tweens.remove(this.tweenLight02);
		
		this.tweenLight01 = null;
		this.tweenLight02 = null;

		this.game.camera.flash(0xffffff, 1000, false);
		this.endingCover.visible = false;
		this.endingCurtain.visible = false;
	}.bind(this));
};

DinoRunz.InGame.prototype.startGame = function (InZoomGameScene, InCallback) {
	var scaleTween = null;

	if(InZoomGameScene) {
		scaleTween = this.game.add.tween(this.fInGameGroup.scale).to({x: 1, y: 1}, 400, Phaser.Easing.Linear.NONE, true);
		scaleTween.onComplete.addOnce(function() {
			this.setState(DinoRunz.InGame.EGameState.RUN);
			this.game.tweens.remove(scaleTween);

			if(InCallback) InCallback();
		}, this);

		return;
	}

	this.setState(DinoRunz.InGame.EGameState.RUN);
};

DinoRunz.InGame.prototype.render = function () {
	// this.game.debug.cameraInfo(this.game.camera, 32, 32);
	// this.game.debug.text('FPS: ' + this.game.time.fps || 'FPS: --', 40, 40, "#00ff00");//홍보영상 지원으로 주석처리.
};