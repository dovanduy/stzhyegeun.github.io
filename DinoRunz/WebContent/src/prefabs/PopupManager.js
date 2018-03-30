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
    this.dinoInfoPopup = new DinoInfoPopup(aGame, aParent);
	this.adPopup = new AdPopup(aGame, aParent);
	this.optionPopup = new OptionPopup(aGame, aParent);
	this.getDinoPopup = new GetDinoPopup(aGame, aParent);
}

function DinoInfoPopup(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
    Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
    
    this.blackLayer = aGame.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

	this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 456;
	this.BG.targetHeight = 594;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.UpdateImageSizes();

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -210, "popupTitleLine");
	titleLine.targetWidth = 380;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();

	this.txtTitle = this.game.add.text(0, -240, "INFORMATION", {"font":"bold 42px Blogger Sans","fill":"#1a8aa8"});
	this.txtTitle.anchor.setTo(0.5);
	this.txtDesc = this.game.add.text(0, 50, "Description", {"font":"bold 34px Blogger Sans","fill":"#4bacc6"});
	this.txtDesc.anchor.setTo(0.5);

	this.sprCharacter = this.game.add.sprite(0, -80, "auhaSheet1", 8);
	this.sprCharacter.anchor.setTo(0.5);
	this.sprCharacter.scale.setTo(2.5);

	this.btnOK = this.game.add.sprite(0, 200, "PopupAtlas", "btn_popupSkyblue.png");
	this.btnOK.anchor.setTo(0.5);

	this.btnOK.inputEnabled = true;
	this.btnOK.events.onInputUp.add(this.btnCallback, this);

	this.txtOK = this.game.add.text(0, 0, "OK", {"font":"bold 55px Blogger Sans","fill":"#1a8aa8"});
	this.txtOK.anchor.setTo(0.5);
	
	this.sprIcon = this.game.add.sprite(-50, -5, "PopupAtlas", "icon_purplePlay.png");
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

	this.btnClose = this.game.add.sprite(210, -250, "PopupAtlas", "btn_close.png", this);
	this.btnClose.inputEnabled = true;
	this.btnClose.events.onInputUp.add(this.closePopup, this);

	this.charId = null;
	this.lockType = null;

	this.visible = false;
}

DinoInfoPopup.prototype = Object.create(Phaser.Group.prototype);
DinoInfoPopup.prototype.constructor = DinoInfoPopup;

DinoInfoPopup.prototype.showPopup = function(charId, lockType) {
    this.sprCharacter.loadTexture("auhaSheet"+charId, 8);
	this.visible = true;
	this.charId = charId;
	this.lockType = lockType;
    
    if(lockType===ESlotLockType.video) {
    	this.btnOK.loadTexture("PopupAtlas", "btn_purple.png");
    	this.txtOK.text = "FREE";
    	this.txtOK.fill = "#6a3d8a"; 
    	this.txtOK.fontSize = 42;
    	this.txtOK.position.x = 40;
    	
		this.sprIcon.visible = true;
		this.btnClose.visible = true;
    }
    else {
    	this.btnOK.loadTexture("PopupAtlas", "btn_popupSkyblue.png");
    	this.txtOK.text = "OK";
    	this.txtOK.fill = "#1a8aa8";
    	this.txtOK.fontSize = 55;
    	this.txtOK.position.x = 0;
    	
		this.sprIcon.visible = false;
		this.btnClose.visible = false;
    }
};

DinoInfoPopup.prototype.closePopup = function() {
	window.sounds.sound('sfx_button').play();
	this.visible = false;
};

DinoInfoPopup.prototype.btnCallback = function() {
	window.sounds.sound('sfx_button').play();

	function callback() {
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


				
		this.visible = false;
	}
	
	if(!FBInstant) {
		var callback_bind = callback.bind(this);
		callback_bind();
		return;
	}

	if(this.lockType===ESlotLockType.video) {
		var adModel = GGManager.getAdModelByPlacementID(EAdType.REWARDED, EAdName.REWARD_GET_CHARACTER);
		if(adModel) {
			GGManager.setCallbackByPlacementID(EAdName.REWARD_GET_CHARACTER, callback.bind(this), function() {
				console.log("ad_load_successe");
			}.bind(this), function() {
				//todo : 광고 로드 실패 팝업 띄우기?
				// throw new Error("ad_load_fail");
				console.log("ad_load_fail");
			}.bind(this));
			GGManager.show(EAdName.REWARD_SKIP);
		}
		else {
			// throw new Error("adModel : "+adModel);
			console.log("adModel: "+adModel);
		}
	}	
	else {
		this.visible = true;
	}
};

function AdPopup(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
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
    
    this.txtTitle = this.game.add.text(0, -250, "TOO DIFFICULT?", {"font":"bold 44px Blogger Sans","fill":"#1a8aa8"});
	this.txtTitle.anchor.setTo(0.5);
	this.txtDesc = this.game.add.text(0, 70, "Description", {"font":"bold 32px Blogger Sans","fill":"#4bacc6", "align":"center"});
    this.txtDesc.anchor.setTo(0.5);

    this.sprIcon = this.game.add.sprite(0, -80, "PopupAtlas", "img_skip.png");
	this.sprIcon.anchor.setTo(0.5);
    
    this.btnFree = this.game.add.sprite(0, 200, "PopupAtlas", "btn_purple.png");
	this.btnFree.anchor.setTo(0.5);

	this.btnFree.inputEnabled = true;
	this.btnFree.events.onInputUp.add(function() {
		console.log("click_adPopup_button");
		window.sounds.sound('sfx_button').play();
		console.log("click_adPopup: 2");
		var inGameState = this.game.state.getCurrentState();
		console.log("click_adPopup_playSound&&getCurrentState");
		switch(this.type){
			case EAdPopupType.skip:
				inGameState.setSkip();
				break;
			case EAdPopupType.slow:
				inGameState.setSlow();
				break;
		}
		
//		this.visible = false;
//		leaderboard.closeLeaderboard();
    }, this);

    var sprAdIcon = this.game.add.sprite(-50, 195, "PopupAtlas", "icon_purplePlay.png");
    sprAdIcon.anchor.setTo(0.5);
    
	this.txtFree = this.game.add.text(40, 200, "FREE", {"font":"bold 42px Blogger Sans","fill":"#6a3d8a"});
    this.txtFree.anchor.setTo(0.5);

    this.btnClose = this.game.add.sprite(210, -250, "PopupAtlas", "btn_close.png");
    this.btnClose.anchor.setTo(0.5);

    this.btnClose.inputEnabled = true;
    this.btnClose.events.onInputUp.add(this.closePopup, this);
    
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

	this.visible = false;
}

AdPopup.prototype = Object.create(Phaser.Group.prototype);
AdPopup.prototype.constructor = AdPopup;

AdPopup.prototype.showPopup = function(eType, DescKey) {
	this.type = eType;

    switch(eType){
        case EAdPopupType.slow:
            this.sprIcon.loadTexture("PopupAtlas", "img_slow.png");
            this.txtDesc.text = "Please try \"SLOW\" item.\nIt is easier to move slowly.";
            break;
        case EAdPopupType.skip:
            this.sprIcon.loadTexture("PopupAtlas", "img_skip.png");
            this.txtDesc.text = "If the stage is too difficult,\n you can skip it.";
            break;
    }

	this.visible = true;
	
	leaderboard.closeLeaderboard();
};

AdPopup.prototype.closePopup = function() {
	window.sounds.sound('sfx_button').play();
	this.visible = false;
	leaderboard.openLeaderboard(ELeaderboardType.FRIEND_LIST
		, this.game.canvas.style, "restartScene");
};

function OptionPopup(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);

	this.blackLayer = this.game.add.graphics();
    this.blackLayer.beginFill(0x000000, 0.7);
    this.blackLayer.drawRect(0, 0, 720, 1280);
	this.blackLayer.endFill();
	this.blackLayer.inputEnabled = true;

    this.BG = new Phaser.NinePatchImage(this.game, 720*0.5, 1280*0.5, "popupBG");
	this.BG.targetWidth = 516;
	this.BG.targetHeight = 740;
	this.BG.anchor.setTo(0.5, 0.5);
	this.BG.UpdateImageSizes();

	var txtTitle = this.game.add.text(0, -320, "SETTING", {"font":"bold 48px Blogger Sans","fill":"#1a8aa8"});
	txtTitle.anchor.setTo(0.5);

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -275, "popupTitleLine");
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
	
	this.btnSound = new OptionButton(this.game, "icon_sound01On.png", "SOUND");
	this.btnMusic = new OptionButton(this.game, "icon_bgm02On.png", "MUSIC");
	this.btnFanPage = new OptionButton(this.game, "icon_fanpage.png", "FANPAGE");
	this.btnLanguage = new OptionButton(this.game, undefined, "ENGLISH", "blueBtnDisable");
	this.btnLanguage.text.fill = "#68acb5";
	this.btnLanguage.text.position.x = 286*0.5;
	this.btnLanguage.text.position.y +=3;

	this.btnSound.btn.position.x = this.btnMusic.btn.position.x = this.btnFanPage.btn.position.x = this.btnLanguage.btn.position.x = -286*0.5;
	
	var offsetY = 20, i = 0, startY= -240, height = 105; 
	this.btnSound.btn.position.y = startY+(height+offsetY) * i++;
	this.btnMusic.btn.position.y = startY+(height+offsetY) * i++;
	this.btnFanPage.btn.position.y = startY+(height+offsetY) * i++;
	this.btnLanguage.btn.position.y = startY+(height+offsetY) * i++;

	this.btnSound.btn.inputEnabled = true;
	this.btnMusic.btn.inputEnabled = true;
	this.btnFanPage.btn.inputEnabled = true;

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

	this.btnFanPage.btn.events.onInputUp.add(function() {
		window.sounds.sound('sfx_button').play();
		/**
		 * todo : link fanpage
		 */
	}, this);

	this.btnClose = this.game.add.sprite(200, -320, "PopupAtlas", "btn_close.png");
	this.btnClose.anchor.setTo(0.5);
	this.btnClose.inputEnabled = true;
	this.btnClose.events.onInputUp.add(this.closePopup, this);

	this.txtDesc = this.game.add.text(0, 310, "INFORMATION", {"font":"bold 20px Blogger Sans", "fill":"#8cccd4", "align":"center"});
	this.txtDesc.anchor.setTo(0.5);
	
	this.version = "0.0.37";
	this.PID = "123123123123";
	this.lastUpdateDate = "MAR.15.2018";

	this.add(this.blackLayer);
	this.add(this.BG);
	this.BG.addChild(txtTitle);
	this.BG.addChild(titleLine);
	this.BG.addChild(this.btnSound.btn);
	this.BG.addChild(this.btnMusic.btn);
	this.BG.addChild(this.btnFanPage.btn);
	this.BG.addChild(this.btnLanguage.btn);
	this.BG.addChild(this.btnClose);
	this.BG.addChild(this.txtDesc);

	this.visible = false;
}

OptionPopup.prototype = Object.create(Phaser.Group.prototype);
OptionPopup.prototype.constructor = OptionPopup;

OptionPopup.prototype.showPopup = function() {
	this.visible = true;

	this.txtDesc.text = "LAST UPDATE "+this.lastUpdateDate+"\n"
		+ "VERSION " + this.version + "\n"
		+ "PID " + this.PID;
};

OptionPopup.prototype.closePopup = function() {
	window.sounds.sound('sfx_button').play();
	this.visible = false;
	var curState = this.game.state.getCurrentState();
	curState.menuScene.showOptionPopAddProcess(true);
};

function GetDinoPopup(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType){
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
	
	var txtTitle = this.game.add.text(0, -250, "GET CHARACTER", {"font":"bold 44px Blogger Sans","fill":"#1a8aa8"});
	txtTitle.anchor.setTo(0.5);

	var titleLine = new Phaser.NinePatchImage(this.game, 0, -200, "popupTitleLine");
	titleLine.targetWidth = 466;
	titleLine.targetHeight = 6;
	titleLine.anchor.setTo(0.5, 0.5);
	titleLine.UpdateImageSizes();
	
	this.txtDesc = this.game.add.text(0, 70, "Description", {"font":"bold 32px Blogger Sans","fill":"#4bacc6", "align":"center"});
    this.txtDesc.anchor.setTo(0.5);
    
    this.sprCharacter = this.game.add.sprite(0, -80, "auhaSheet1", 8);
	this.sprCharacter.anchor.setTo(0.5);
	this.sprCharacter.scale.setTo(2);
    
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
GetDinoPopup.prototype.constructor = AdPopup;

GetDinoPopup.prototype.showPopup = function(charId) {
	if(DinoRunz.InGame.getNewCharacterList.length==0) return;
	
	if(!charId) charId = DinoRunz.InGame.getNewCharacterList.shift();
	
	this.visible = true;
	this.sprCharacter.loadTexture("auhaSheet"+charId, 8);
	this.txtDesc.text = "I GOT THE \"" + StaticManager.dino_runz_character.get(charId).name + "\"\nCHARACTER!";
};

GetDinoPopup.prototype.closePopup = function(charId) {
	window.sounds.sound('sfx_button').play();
	if(DinoRunz.InGame.getNewCharacterList.length!==0) this.showPopup();
	else this.visible = false;
};