var EAdPopupType = {
    skip: 0,
    slow: 1
};

function PopupManager(aGame, aParent) {
	//popup용 나인패치 추가.
	aGame.cache.addNinePatch("popupBG", "PopupAtlas", "popup_BG.png", 40, 40, 40, 40);
	aGame.cache.addNinePatch("popupTitleLine", "PopupAtlas", "img_lineSkyblue.png", 5, 5, 2, 2);
	aGame.cache.addNinePatch("blueBtn", "PopupAtlas", "btn_settingSky.png", 28, 28, 50, 50);
	aGame.cache.addNinePatch("blueBtnDisable", "PopupAtlas", "img_disableSky.png", 28, 28, 45, 45);

	//popup 추가.
    this.dinoInfoPopup = new DinoInfoPopup(this, aGame, aParent);
	this.adPopup = new AdPopup(this, aGame, aParent);
	this.optionPopup = new OptionPopup(this, aGame, aParent);
	this.getDinoPopup = new GetDinoPopup(this, aGame, aParent);
	this.loadFailPopup = new LoadFailPop(this, aGame, aParent);
}

PopupManager.prototype.showPopup = function (inGame, inBG, inBlackLayer, inCallback, inContext) {
	inBlackLayer.visible = true;
	inBG.scale.setTo(0.4);
	var tweenBG = inGame.add.tween(inBG.scale).to({x: 1, y: 1}, 300, Phaser.Easing.Back.Out, true);
	tweenBG.onComplete.add(function () {
		inGame.tweens.remove(tweenBG);
		if(inCallback) {
			if(inContext)
				inCallback.call(inContext);
			else
				inCallback();
		}
	});
};

PopupManager.prototype.closePopup = function (inGame, inBG, inBlackLayer, inCallback, inContext) {
	var tweenBG = inGame.add.tween(inBG.scale).to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None, true);
	tweenBG.onComplete.add(function () {
		inGame.tweens.remove(tweenBG);
		inBlackLayer.visible = false;
		if(inCallback) {
			if(inContext)
				inCallback.call(inContext);
			else
				inCallback();
		}
	});
};

function DinoInfoPopup(manager, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	this.manager = manager;

    Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
    
    this.blackLayer = aGame.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

	this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 520;
	this.BG.targetHeight = 600;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.UpdateImageSizes();

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -195, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();

	this.txtTitle = this.game.add.text(0, -240, StzTrans.translate(StaticManager.ELocale.info_text_b), {"font":"bold 42px Blogger Sans","fill":"#1a8aa8"});
	this.txtTitle.anchor.setTo(0.5);
	this.txtDesc = this.game.add.text(0, 65, "Description", {"font":"bold 30px Blogger Sans","fill":"#4bacc6", "align":"center"});
	this.txtDesc.anchor.setTo(0.5);

	this.sprCharacter = this.game.add.sprite(0, -80, "titleAtlas", "01.png");
	this.sprCharacter.anchor.setTo(0.5);
	this.sprCharacter.scale.setTo(0.7);

	this.btnOK = this.game.add.sprite(0, 200, "PopupAtlas", "btn_popupSkyblue.png");
	this.btnOK.anchor.setTo(0.5);

	this.btnOK.inputEnabled = true;
	this.btnOK.events.onInputUp.add(this.btnCallback, this);

	this.txtOK = this.game.add.text(0, 0, "OK", {"font":"bold 55px Blogger Sans","fill":"#1a8aa8"});
	this.txtOK.anchor.setTo(0.5);
	
	this.sprIcon = this.game.add.sprite(-50, -2, "PopupAtlas", "icon_purplePlay.png");
	this.sprIcon.anchor.setTo(0.5);

    this.add(this.blackLayer);
	this.add(this.BG);
	this.BG.addChild(titleLine);
	this.BG.addChild(this.txtTitle);
	this.BG.addChild(this.txtDesc);
	this.BG.addChild(this.sprCharacter);
	this.BG.addChild(this.btnOK);
	this.btnOK.addChild(this.txtOK);
	this.btnOK.addChild(this.sprIcon);

	this.btnClose = this.game.add.sprite(170, -280, "PopupAtlas", "btn_close.png", this);
	this.btnClose.inputEnabled = true;
	this.btnClose.events.onInputUp.add(function () {
		window.sounds.sound('sfx_button').play();
		this.closePopup(this.game, this.BG, this.blackLayer);
	}, this);

	this.BG.addChild(this.btnClose);

	this.charId = null;
	this.lockType = null;

	this.visible = false;
}

DinoInfoPopup.prototype = Object.create(Phaser.Group.prototype);
DinoInfoPopup.prototype.constructor = DinoInfoPopup;

DinoInfoPopup.prototype.showPopup = function(charId, lockType, curValue) {
	var spriteKey = (charId < 10) ? "0" + charId + ".png" : charId + ".png";
    this.sprCharacter.loadTexture("titleAtlas", spriteKey);
	this.visible = true;
	this.charId = charId;
	this.lockType = lockType;

	var condition = null;
    
    if(lockType===ESlotLockType.video) {
    	this.btnOK.loadTexture("PopupAtlas", "btn_purple.png");
    	this.txtOK.text = StzTrans.translate(StaticManager.ELocale.free_text_b);
    	this.txtOK.fill = "#6a3d8a"; 
    	this.txtOK.fontSize = 42;
    	this.txtOK.position.x = 40;
    	
		this.sprIcon.visible = true;
		this.btnClose.visible = true;

		condition = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.condition_watch_video), 
				{N : StaticManager.dino_runz_character.get(charId).unlock_value - curValue});
    }
    else {
    	this.btnOK.loadTexture("PopupAtlas", "btn_popupSkyblue.png");
    	this.txtOK.text = StzTrans.translate(StaticManager.ELocale.ok_text_b);
    	this.txtOK.fill = "#1a8aa8";
    	this.txtOK.fontSize = 55;
    	this.txtOK.position.x = 0;
    	
		this.sprIcon.visible = false;
		this.btnClose.visible = false;
		this.btnClose.visible = (lockType===ESlotLockType.share);

		if (this.lockType === ESlotLockType.level) {
			condition = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.condition_stage_clear), 
				{N : StaticManager.dino_runz_character.get(charId).unlock_value});
			
		}
		else if (this.lockType === ESlotLockType.share) {
			condition = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.condition_invite_friend), 
				{N : StaticManager.dino_runz_character.get(charId).unlock_value});
		}
	}

	this.txtDesc.text = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.info_character_unlock_info),
			{condition: condition, character_name: StaticManager.dino_runz_character.get(charId).name});

	StzUtil.setLimitTextWidth(this.txtDesc, 422);

	this.manager.showPopup(this.game, this.BG, this.blackLayer);
};

DinoInfoPopup.prototype.closePopup = function() {
	this.manager.closePopup(this.game, this.BG, this.blackLayer, function () {
		this.visible = false;
	}, this);
};

DinoInfoPopup.prototype.btnCallback = function() {
	window.sounds.sound('sfx_button').play();

	var callback = function () {
		var i, characterData = StaticManager.dino_runz_character.data; length = characterData.length;
		var unlock_value = null;
		for(i = 0 ; i < length ; ++i) {
			if(this.charId===characterData[i].id){
				unlock_value = characterData[i].unlock_value;
				break;
				}
			}

		var curValue = null;
		var unlockData = DinoRunz.Storage.UserData.lockDinoData;
		length = unlockData.length;
		for(i = 0 ; i < length ; ++i){
			if(this.charId===unlockData[i].charId){
				++unlockData[i].curValue;
					break;
				}
			}

		var renewCharacterGetValueData = [];
				
		for(i = 0 ; i < length ; ++i) {
			renewCharacterGetValueData.push(unlockData[i].charId + "|" + unlockData[i].curValue);
		}

		DinoRunz.Storage.UserData.isCurGetValueList = renewCharacterGetValueData;
		DinoRunz.Storage.setUserData();

		this.game.state.getCurrentState().menuScene.updateCharacterSlots();
				
		this.closePopup(this.game, this.BG, this.blackLayer);
	}.bind(this);

	if(this.lockType===ESlotLockType.video) {
		if(!FBInstant) {
			callback();
			return;
		}

		var adModel = GGManager.getAdModelByPlacementID(EAdType.REWARDED, EAdName.REWARD_GET_CHARACTER);
		if(adModel) {
			GGManager.setCallbackByPlacementID(EAdName.REWARD_GET_CHARACTER, callback, function() {
				//load success
			}.bind(this), function() {
				//load fail
				var inGameState = this.game.state.getCurrentState();
				inGameState.menuScene.popupManager.loadFailPopup.showPopup();
			}.bind(this));
			GGManager.show(EAdName.REWARD_GET_CHARACTER);
		}
	}	
	else {
		this.closePopup(this.game, this.BG, this.blackLayer);
	}
};

function AdPopup(manager, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	this.manager = manager;

    Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);

	this.type = -1;

    this.blackLayer = aGame.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

    this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 520;
	this.BG.targetHeight = 600;
	this.BG.anchor.setTo(0.5, 0.5);
    this.BG.UpdateImageSizes();
    
    var titleLine = new Phaser.NinePatchImage(this.game, 0, -200, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
    titleLine.UpdateImageSizes();
    
    this.txtTitle = this.game.add.text(0, -240, "TOO DIFFICULT?", {"font":"bold 44px Blogger Sans","fill":"#1a8aa8"});
	this.txtTitle.anchor.setTo(0.5);
	this.txtDesc = this.game.add.text(0, 84, "Description", {"font":"bold 32px Blogger Sans","fill":"#4bacc6", "align":"center"});
    this.txtDesc.anchor.setTo(0.5);

    this.sprIcon = this.game.add.sprite(0, -80, "PopupAtlas", "img_skip.png");
	this.sprIcon.anchor.setTo(0.5);
    
    this.btnFree = this.game.add.sprite(0, 217, "PopupAtlas", "btn_purple.png");
	this.btnFree.anchor.setTo(0.5);

	this.btnFree.inputEnabled = true;
	this.btnFree.events.onInputUp.add(function() {
		window.sounds.sound('sfx_button').play();
		
		var inGameState = this.game.state.getCurrentState();

		switch(this.type){
			case EAdPopupType.skip:
				inGameState.setSkip();
				if(this.openStage !== -1) {
					var skipStage = this.openStage + 1;
					if(DinoRunz.InGame.MAPS.hasOwnProperty(skipStage) === false) break;
					
					Server.setLog(EServerLogMsg.RESOURCE, {'p1' : "use", "p2" : "skip", "p3" : this.openStage, "p4": (this.clickOpen) ? "result_menu" : "recommend"});
				}
				break;
			case EAdPopupType.slow:
				inGameState.setSlow();
				if(this.openStage !== -1) {
					Server.setLog(EServerLogMsg.RESOURCE, {'p1' : "use", "p2" : "slow", "p3" : this.openStage, "p4": (this.clickOpen) ? "result_menu" : "recommend"});
				}
				break;
		}
    }, this);

    var sprAdIcon = this.game.add.sprite(-50, this.btnFree.position.y - 6, "PopupAtlas", "icon_purplePlay.png");
	sprAdIcon.anchor.setTo(0.5);
    
	this.txtFree = this.game.add.text(40, this.btnFree.position.y - 4, "FREE", {"font":"bold 42px Blogger Sans","fill":"#6a3d8a"});
	this.txtFree.anchor.setTo(0.5);

    this.btnClose = this.game.add.sprite(210, -250, "PopupAtlas", "btn_close.png");
    this.btnClose.anchor.setTo(0.5);

    this.btnClose.inputEnabled = true;
    this.btnClose.events.onInputUp.add(function () {
		window.sounds.sound('sfx_button').play();
		this.closePopup(this.game, this.BG, this.blackLayer);
	}, this);
    
    this.add(this.blackLayer);
    this.add(this.BG);
	this.BG.addChild(titleLine);
	this.BG.addChild(this.txtTitle);
	this.BG.addChild(this.txtDesc);
	this.BG.addChild(this.sprIcon);
	this.BG.addChild(this.btnFree);
    this.BG.addChild(this.txtFree);
    this.BG.addChild(this.btnClose);
	this.BG.addChild(sprAdIcon);
	
	this.clickOpen = false;
	this.openStage = -1;

	this.visible = false;
}

AdPopup.prototype = Object.create(Phaser.Group.prototype);
AdPopup.prototype.constructor = AdPopup;

AdPopup.prototype.showPopup = function(eType, InClickOpen, InCurrentStage) {
	this.clickOpen = InClickOpen;
	if(this.clickOpen === undefined) this.clickOpen = false;

	this.openStage = -1;
	if(InCurrentStage !== undefined) this.openStage = InCurrentStage;

	this.type = eType;

	this.txtTitle.scale.setTo(1);
	this.txtDesc.scale.setTo(1);

    switch(eType){
        case EAdPopupType.slow:
			this.sprIcon.loadTexture("PopupAtlas", "img_slow.png");
			this.txtTitle.text = StzTrans.translate(StaticManager.ELocale.slow_item_title);
			this.txtDesc.text = StzTrans.translate(StaticManager.ELocale.slow_item_desc);

			StzUtil.setLimitTextHeight(this.txtDesc, 86);
            break;
        case EAdPopupType.skip:
			this.sprIcon.loadTexture("PopupAtlas", "img_skip.png");
			this.txtTitle.text = StzTrans.translate(StaticManager.ELocale.skip_item_title);
			this.txtDesc.text = StzTrans.translate(StaticManager.ELocale.skip_item_desc);
            break;
	}

	StzUtil.setLimitTextWidth(this.txtTitle, 299);

	this.visible = true;
	
	leaderboard.closeLeaderboard();

	this.manager.showPopup(this.game, this.BG, this.blackLayer);
};

AdPopup.prototype.closePopup = function() {
	this.manager.closePopup(this.game, this.BG, this.blackLayer, function () {
		leaderboard.openLeaderboard(ELeaderboardType.FRIEND_LIST, this.game.canvas.style, "restartScene");
		this.visible = false;
	}, this);
};

function OptionPopup(manager, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	this.manager = manager;

	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);

	this.blackLayer = this.game.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

    this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 516;
	this.BG.targetHeight = 650;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.position.y -= 50;
	this.BG.UpdateImageSizes();

	var txtTitle = this.game.add.text(0, -270, StzTrans.translate(StaticManager.ELocale.option_text_b), {"font":"bold 48px Blogger Sans","fill":"#1a8aa8"});
	txtTitle.anchor.setTo(0.5);

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -220, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();

	function OptionButton(aGame, icon, text, bgKey) {
		if(bgKey===undefined) bgKey = "blueBtn";
		this.btn = new Phaser.NinePatchImage(aGame, 0, 0, bgKey);
		this.btn.targetWidth = 286;
		this.btn.targetHeight = 105;
	
		if(icon!==undefined){
			this.icon = aGame.add.sprite(50, this.btn.targetHeight*0.5-5, "PopupAtlas", icon);
			this.icon.anchor.setTo(0.5);
			this.btn.addChild(this.icon);
		}
		
		this.text = aGame.add.text(180, this.btn.targetHeight*0.5-2, text, {"font":"bold 44px Blogger Sans","fill":"#1a8aa8"});
		this.text.anchor.setTo(0.5);
		this.btn.addChild(this.text);
	}
	
	this.btnSound = new OptionButton(this.game, "icon_sound01On.png", StzTrans.translate(StaticManager.ELocale.sound_text_b));
	this.btnMusic = new OptionButton(this.game, "icon_bgm02On.png", StzTrans.translate(StaticManager.ELocale.music_text_b));
	// this.btnFanPage = new OptionButton(this.game, "icon_fanpage.png", StzTrans.translate(StaticManager.ELocale.fan_page_text_b));
	this.btnLanguage = new OptionButton(this.game, undefined, StzTrans.translate(StaticManager.ELocale.language_english), "blueBtnDisable");
	this.btnLanguage.text.fill = "#68acb5";
	this.btnLanguage.text.position.x = 286*0.5;
	this.btnLanguage.text.position.y +=3;

	this.btnSound.btn.position.x = this.btnMusic.btn.position.x = /*this.btnFanPage.btn.position.x =*/ this.btnLanguage.btn.position.x = -286*0.5;
	
	var offsetY = 20, i = 0, startY= -175, height = 105; 
	this.btnSound.btn.position.y = startY+(height+offsetY) * i++;
	this.btnMusic.btn.position.y = startY+(height+offsetY) * i++;
	// this.btnFanPage.btn.position.y = startY+(height+offsetY) * i++;
	this.btnLanguage.btn.position.y = startY+(height+offsetY) * i++;

	this.btnSound.btn.inputEnabled = true;
	this.btnMusic.btn.inputEnabled = true;
	// this.btnFanPage.btn.inputEnabled = true;

	this.btnSound.btn.events.onInputUp.add(function() {
		window.sounds.sound('sfx_button').play();
		DinoRunz.InGame.isSound = !DinoRunz.InGame.isSound;
		this.btnSound.icon.loadTexture("PopupAtlas", DinoRunz.InGame.isSound?"icon_sound01On.png":"icon_sound02Off.png");
		window.sounds.toggleSound(DinoRunz.InGame.isSound);
	}, this);

	this.btnMusic.btn.events.onInputUp.add(function() {
		window.sounds.sound('sfx_button').play();
		DinoRunz.InGame.isMusic = !DinoRunz.InGame.isMusic;
		this.btnMusic.icon.loadTexture("PopupAtlas", DinoRunz.InGame.isMusic?"icon_bgm02On.png":"icon_bgm01Off.png");
		window.sounds.toggleMusic(DinoRunz.InGame.isMusic);
	}, this);

	// this.btnFanPage.btn.events.onInputUp.add(function() {
	// 	window.sounds.sound('sfx_button').play();
	// 	/**
	// 	 * todo : link fanpage
	// 	 */
	// }, this);

	this.btnClose = this.game.add.sprite(200, -270, "PopupAtlas", "btn_close.png");
	this.btnClose.anchor.setTo(0.5);
	this.btnClose.inputEnabled = true;
	this.btnClose.events.onInputUp.add(function() {
		window.sounds.sound('sfx_button').play();
		this.closePopup();
	}, this);

	this.txtDesc = this.game.add.text(0, 260, "INFORMATION", {"font":"bold 20px Blogger Sans", "fill":"#8cccd4", "align":"center"});
	this.txtDesc.anchor.setTo(0.5);

	this.add(this.blackLayer);
	this.add(this.BG);
	this.BG.addChild(txtTitle);
	this.BG.addChild(titleLine);
	this.BG.addChild(this.btnSound.btn);
	this.BG.addChild(this.btnMusic.btn);
	// this.BG.addChild(this.btnFanPage.btn);
	this.BG.addChild(this.btnLanguage.btn);
	this.BG.addChild(this.btnClose);
	this.BG.addChild(this.txtDesc);

	this.visible = false;
}

OptionPopup.prototype = Object.create(Phaser.Group.prototype);
OptionPopup.prototype.constructor = OptionPopup;

OptionPopup.prototype.showPopup = function() {
	Server.setLog(EServerLogMsg.MENU, {'p1' : EMenuName.SETTING});
	
	this.visible = true;

	this.txtDesc.text = StzTrans.translate(StaticManager.ELocale.latest_update_text_b) + " " + StzBuildConfig.LAST_UPDATE + "\n" + 
		StzTrans.translate(StaticManager.ELocale.version_text_b) + " " + StzBuildConfig.VERSION + "\n"+ 
		StzTrans.translate(StaticManager.ELocale.pid_text_b) + " " + PlayerDataManager.getPlatformId() + "(" + Server.serverId + ")";

	this.manager.showPopup(this.game, this.BG, this.blackLayer);
};

OptionPopup.prototype.closePopup = function() {
	this.manager.closePopup(this.game, this.BG, this.blackLayer, function () {
		var curState = this.game.state.getCurrentState();
		curState.menuScene.showOptionPopAddProcess(true);
		this.visible = false;
	}, this);
};

function GetDinoPopup(manager, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType){
	this.manager = manager;

	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	
	this.blackLayer = this.game.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

    this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
    this.BG.targetWidth = 520;
	this.BG.targetHeight = 600;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.UpdateImageSizes();
	
	var txtTitle = this.game.add.text(0, -240, "GET CHARACTER", {"font":"bold 44px Blogger Sans","fill":"#1a8aa8"});
	txtTitle.anchor.setTo(0.5);
	StzUtil.setLimitTextWidth(txtTitle, 312);

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -200, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();
	
	this.txtDesc = this.game.add.text(0, 85, "Description", {"font":"bold 32px Blogger Sans","fill":"#4bacc6", "align":"center"});
    this.txtDesc.anchor.setTo(0.5);
    
    this.sprCharacter = this.game.add.sprite(0, -80, "titleAtlas", "01.png");
	this.sprCharacter.anchor.setTo(0.5);
	this.sprCharacter.scale.setTo(0.7);
    
    this.btnOK = this.game.add.sprite(0, 200, "PopupAtlas", "btn_popupSkyblue.png");
	this.btnOK.anchor.setTo(0.5);
    
    this.btnOK.inputEnabled = true;
	this.btnOK.events.onInputUp.add(this.closePopup, this);
	
	this.btnClose = this.game.add.sprite(210, -250, "PopupAtlas", "btn_close.png");
    this.btnClose.anchor.setTo(0.5);
    
    this.btnClose.inputEnabled = true;
	this.btnClose.events.onInputUp.add(this.closePopup, this);
    
    this.txtOK = this.game.add.text(0, 200, "OK", {"font":"bold 42px Blogger Sans","fill":"#1a8aa8"});
    this.txtOK.anchor.setTo(0.5);
    
    this.add(this.blackLayer);
    this.add(this.BG);
	this.BG.addChild(titleLine);
	this.BG.addChild(txtTitle);
	this.BG.addChild(this.txtDesc);
	this.BG.addChild(this.sprCharacter);
	this.BG.addChild(this.btnOK);
    this.BG.addChild(this.txtOK);
    this.BG.addChild(this.btnClose);
    
    this.visible = false;
}

GetDinoPopup.prototype = Object.create(Phaser.Group.prototype);
GetDinoPopup.prototype.constructor = GetDinoPopup;

GetDinoPopup.prototype.showPopup = function(charId) {
	if(DinoRunz.InGame.getNewCharacterList.length==0) return;
	
	if(!charId) charId = DinoRunz.InGame.getNewCharacterList.shift();
	
	this.visible = true;

	var spriteKey = (charId < 10) ? "0" + charId + ".png" : charId + ".png";
	this.sprCharacter.loadTexture("titleAtlas", spriteKey);
	this.txtDesc.text = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.get_character_text), {character_name : StaticManager.dino_runz_character.get(charId).name});

	this.manager.showPopup(this.game, this.BG, this.blackLayer);
};

GetDinoPopup.prototype.closePopup = function(charId) {
	window.sounds.sound('sfx_button').play();
	if(DinoRunz.InGame.getNewCharacterList.length!==0) this.showPopup();
	else this.manager.closePopup(this.game, this.BG, this.blackLayer, function () {
		this.visible = false;
	}, this);
};

function LoadFailPop(manager, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType){
	this.manager = manager;

	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);

	this.blackLayer = this.game.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

	this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 520;
	this.BG.targetHeight = 600;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.UpdateImageSizes();

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -210, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();

	this.txtTitle = this.game.add.text(0, -240, StzTrans.translate(StaticManager.ELocale.info_text_b), {"font":"bold 42px Blogger Sans","fill":"#1a8aa8"});
	this.txtTitle.anchor.setTo(0.5);
	this.txtDesc = this.game.add.text(0, 60, StzTrans.translate(StaticManager.ELocale.ad_fail), {"font":"bold 34px Blogger Sans","fill":"#4bacc6", "align":"center"});
	this.txtDesc.anchor.setTo(0.5);

	this.btnOK = this.game.add.sprite(0, 200, "PopupAtlas", "btn_popupSkyblue.png");
	this.btnOK.anchor.setTo(0.5);

	this.btnOK.inputEnabled = true;
	this.btnOK.events.onInputUp.add(this.closePopup, this);

	this.txtOK = this.game.add.text(0, 0, "OK", {"font":"bold 55px Blogger Sans","fill":"#1a8aa8"});
	this.txtOK.anchor.setTo(0.5);

	this.sprIcon = this.game.add.sprite(0, -90, "PopupAtlas", "img_error.png");
	this.sprIcon.anchor.setTo(0.5);

	this.add(this.blackLayer);
	this.add(this.BG);
	this.BG.addChild(titleLine);
	this.BG.addChild(this.txtTitle);
	this.BG.addChild(this.txtDesc);
	this.BG.addChild(this.btnOK);
	this.BG.addChild(this.sprIcon);
	this.btnOK.addChild(this.txtOK);

	this.btnOK.inputEnabled = true;
	this.btnOK.events.onInputUp.add(this.closePopup, this);

	this.visible = false;
}

LoadFailPop.prototype = Object.create(Phaser.Group.prototype);
LoadFailPop.prototype.constructor = LoadFailPop;

LoadFailPop.prototype.showPopup = function () {
	this.visible = true;
	this.manager.showPopup(this.game, this.BG, this.blackLayer);
};

LoadFailPop.prototype.closePopup = function() {
	this.manager.closePopup(this.game, this.BG, this.blackLayer, function () {
		this.visible = false;
	}, this);
};