
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * LobbyScene.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function LobbyScene(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _targetContainer = this.game.add.group(this);
	
	var _bottomUIContainer = this.game.add.group(this);
	
	var _freeGiftContainer = this.game.add.group(_bottomUIContainer);
	_freeGiftContainer.position.setTo(602, 898);
	
	var _textFreeGift = this.game.add.text(-69, 58, 'FREE GIFT', {"font":"32px Lilita One"}, _freeGiftContainer);
	
	var _waitFreeCoinContainer = this.game.add.group(_freeGiftContainer);
	
	var _waitFreeCoin = this.game.add.sprite(0, 0, 'mainAtlas', 'bonus_time.png', _waitFreeCoinContainer);
	_waitFreeCoin.anchor.setTo(0.5, 0.5);
	
	var _timeLeftBg = this.game.add.sprite(-57, -114, 'mainAtlas', 'time_left_bg.png', _waitFreeCoinContainer);
	
	var _textRemainTime = this.game.add.text(1, -88, '', {"font":"bold 18px Lilita One","fill":"#74baba"}, _waitFreeCoinContainer);
	_textRemainTime.anchor.setTo(0.5, 0.5);
	
	var _completeFreeCoinContainer = this.game.add.group(_freeGiftContainer);
	
	var _completeFreeCoin = this.game.add.sprite(-41, -93, 'mainAtlas', 'bonus_fin.png', _completeFreeCoinContainer);
	
	var _text = this.game.add.text(1, -122, 'TOUCH', {"font":"bold 32px Lilita One"}, _completeFreeCoinContainer);
	_text.anchor.setTo(0.5, 0.5);
	
	var _characterContainer = this.game.add.group(_bottomUIContainer);
	_characterContainer.position.setTo(362, 886);
	
	var _btnCharacter = this.game.add.sprite(0, 0, 'mainAtlas', 'chracter_bg.png', _characterContainer);
	_btnCharacter.anchor.setTo(0.5, 0.5);
	
	var _character_bg_png = this.game.add.sprite(5, 88, 'mainAtlas', 'character_bg.png', _characterContainer);
	_character_bg_png.anchor.setTo(0.5, 0.5);
	
	var _textCharacter = this.game.add.text(6, 90, 'CHARACTER', {"font":"32px Lilita One"}, _characterContainer);
	_textCharacter.anchor.setTo(0.5, 0.5);
	
	var _iconCharacter = this.game.add.sprite(0, -36, 'characterAtlas', '1.png', _characterContainer);
	_iconCharacter.anchor.setTo(0.5, 0.5);
	
	var _btnLeft = this.game.add.sprite(68, 554, 'mainAtlas', 'skip_icon.png', _bottomUIContainer);
	_btnLeft.scale.setTo(-1.0, 1.0);
	
	var _btnRight = this.game.add.sprite(639, 550, 'mainAtlas', 'skip_icon.png', _bottomUIContainer);
	
	var _rankContainer = this.game.add.group(_bottomUIContainer);
	_rankContainer.position.setTo(117, 905);
	_rankContainer.alpha = 0.3;
	
	var _btnRank = this.game.add.sprite(0, 0, 'mainAtlas', 'rank_icon.png', _rankContainer);
	_btnRank.anchor.setTo(0.5, 0.5);
	
	var _textRank = this.game.add.text(-41, 50, 'RANK', {"font":"32px Lilita One"}, _rankContainer);
	
	var _coinContainer = this.game.add.group(this);
	_coinContainer.position.setTo(256, 45);
	
	var _iconCoin = this.game.add.sprite(0, 0, 'mainAtlas', 'common_coin.png', _coinContainer);
	_iconCoin.scale.setTo(0.4, 0.4);
	
	var _inviteContainer = this.game.add.group(this);
	_inviteContainer.position.setTo(357, 364);
	
	var _btnInvite = this.game.add.sprite(0, 0, 'mainAtlas', 'invite_btn.png', _inviteContainer);
	_btnInvite.anchor.setTo(0.5, 0.5);
	
	var _facebook_icon_png = this.game.add.sprite(-218, 13, 'mainAtlas', 'facebook_icon.png', _inviteContainer);
	_facebook_icon_png.anchor.setTo(0.5, 0.5);
	
	var _btnStage = this.game.add.sprite(356, 586, 'mainAtlas', 'btn_large_common.png', this);
	_btnStage.anchor.setTo(0.5, 0.5);
	
	var _btnSetting = this.game.add.sprite(624, 26, 'mainAtlas', 'setting_icon.png', this);
	
	
	
	// public fields
	
	this.fTargetContainer = _targetContainer;
	this.fBottomUIContainer = _bottomUIContainer;
	this.fTextFreeGift = _textFreeGift;
	this.fWaitFreeCoinContainer = _waitFreeCoinContainer;
	this.fWaitFreeCoin = _waitFreeCoin;
	this.fTimeLeftBg = _timeLeftBg;
	this.fTextRemainTime = _textRemainTime;
	this.fCompleteFreeCoinContainer = _completeFreeCoinContainer;
	this.fCompleteFreeCoin = _completeFreeCoin;
	this.fBtnCharacter = _btnCharacter;
	this.fTextCharacter = _textCharacter;
	this.fIconCharacter = _iconCharacter;
	this.fBtnLeft = _btnLeft;
	this.fBtnRight = _btnRight;
	this.fBtnRank = _btnRank;
	this.fTextRank = _textRank;
	this.fCoinContainer = _coinContainer;
	this.fIconCoin = _iconCoin;
	this.fInviteContainer = _inviteContainer;
	this.fBtnInvite = _btnInvite;
	this.fBtnStage = _btnStage;
	this.fBtnSetting = _btnSetting;
	/* --- post-init-begin --- */
	_btnStage.tint = 0xfca100;
	this.fSettingPopup = null;
	
	//text UI
	{
		var inviteFontStyle = {fontSize: '33px', fill: '#ffffff', font: 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
		_textInviteFriend = this.game.add.text(0, 0, StzTrans.translate(ELocale.INVITE_FRIEND_TEXT_B), inviteFontStyle, this.fInviteContainer);
		_textInviteFriend.setTextBounds(-this.fBtnInvite.width/2.1, -this.fBtnInvite.height/2.1, this.fBtnInvite.width, this.fBtnInvite.height);
		
		
		var stageValueFontStyle = {fontSize: '60px', fill: '#ffffff', font: 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
		this.fTextStageNum = this.game.add.text(0, 0, StzUtil.strFormatObj(StzTrans.translate(ELocale.STAGE_TEXT_B), {N : PlayerDataManager.saveData.getBestStage()})
				, stageValueFontStyle, this);
		this.fTextStageNum.setTextBounds(-this.fBtnStage.width/2, 10 - this.fBtnStage.height/2, this.fBtnStage.width, this.fBtnStage.height/2);
		this.fBtnStage.addChild(this.fTextStageNum);
		
		var stageFontStyle = {fontSize: '120px', fill: '#ffffff', font: 'Lilita One', boundsAlignH: 'center', boundsAlignV: 'middle'};
		_textStage = this.game.add.text(0, 0, StzTrans.translate(ELocale.PLAY_TEXT_B), stageFontStyle, this);
		_textStage.setTextBounds(-this.fBtnStage.width/2, this.fBtnStage.height/2.7 - this.fBtnStage.height/2, this.fBtnStage.width, this.fBtnStage.height/2);
		this.fBtnStage.addChild(_textStage);
		
		_textRank.fill = '#005d72';
		_textRank.text = StzTrans.translate(ELocale.RANK_TEXT_B);
		_textCharacter.fill = '#ffffff';
		_textCharacter.text = StzTrans.translate(ELocale.CHARACTER_TEXT_B);
		_textFreeGift.fill = '#005d72';
		_textFreeGift.text = StzTrans.translate(ELocale.FREE_GIFT_TEXT_B);
		_btnSetting.tint = 0x00a2ea;
	}
	
	//coin UI
	{
		var coinFontStyle = {fontSize: '54px', fill: '#ffffff', font: 'Lilita One', boundsAlignH: 'left', boundsAlignV: 'middle'};
		this.fTextCoin = this.game.add.text(0, 0, PlayerDataManager.saveData.getCoin(), coinFontStyle, this.fCoinContainer);
		this.fTextCoin.setTextBounds(this.fIconCoin.width*1.4, 0, this.game.width, this.fIconCoin.height);
		
		if(StzGameConfig.QA_MODE === true){
			this.fIconCoin.inputEnabled = true;
			this.fIconCoin.events.onInputUp.add(function(){
				window.sounds.sound('sfx_button').play();
				PlayerDataManager.saveData.updateCoin(50);
			}.bind(this));
		}

		this.onUpdateCoinLobbyScene = function(inCoinValue){
			this.fTextCoin.text = inCoinValue;
			this.updateUI();
		}.bind(this);
		PlayerDataManager.saveData.addUpdateCoinDelegate(this.onUpdateCoinLobbyScene, this);
	}
	
	this.fCompleteFreeCoin.inputEnabled = true;
	this.fCompleteFreeCoin.events.onInputUp.add(function(){
		FbManager.updateAsyncByInviteUpdateView(EShareType.COIN);
		var freeCoin = (StaticManager.dino_thornz_base.get('freecoin_coin'))? StaticManager.dino_thornz_base.get("freecoin_coin").value : InGameConfig.FREE_COIN_COIN;
		window.sounds.sound('sfx_button').play();
		PlayerDataManager.saveData.updateCoin(freeCoin);
		PlayerDataManager.saveData.setFreeCoinTimeStamp(new Date().getTime());
		PlayerDataManager.saveData.save();
		this.updateUI();
	}.bind(this));
	
	this.fBtnInvite.inputEnabled = true;
	this.fBtnInvite.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		FbManager.inviteFriend();
	}.bind(this));
	
	this.fBtnStage.inputEnabled = true;
	this.fBtnStage.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		this.game.input.enabled = false;
		this.game.add.tween(this.fBtnStage.scale).to({x : 1.1, y : 1.1}, 100, Phaser.Easing.Linear.None, true, 0, 0, true)
		.onComplete.addOnce(function(){
			this.game.state.getCurrentState().createInGameScene(PlayerDataManager.saveData.getBestStage());
		}.bind(this));
	}.bind(this));
	
	this.fBtnSetting.inputEnabled = true;
	this.fBtnSetting.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		//로비 화면 최상단에 블라인드
		if(!this.fSettingPopup){
			this.fSettingPopup = new PopupSetting(this.game, this);
		}
		this.fSettingPopup.setData();
		this.game.state.getCurrentState().showBlindFunc(this.fSettingPopup.fBlindContainer);
		
		this.fSettingPopup.visible = true;
	}.bind(this));
	
//	this.fBtnRank.inputEnabled = true;
//	this.fBtnRank.events.onInputUp.add(function(){
//		this.game.state.getCurrentState().toggleRankScene();
//	}.bind(this))
//	//화살표 부분 주석
	this.fBtnLeft.visible = StzGameConfig.QA_MODE;
	this.fBtnLeft.inputEnabled = true;
	this.fBtnLeft.events.onInputUp.add(function(){
		var cutStage = PlayerDataManager.saveData.getBestStage();
		cutStage--;
		if(cutStage<= 1){
			cutStage = 1;
		}
		PlayerDataManager.saveData.setBestStage(cutStage);
		this.onUpdateStage.dispatch(cutStage);
	}.bind(this));
	
	this.fBtnRight.visible = StzGameConfig.QA_MODE;
	this.fBtnRight.inputEnabled = true;
	this.fBtnRight.events.onInputUp.add(function(){
		var cutStage = PlayerDataManager.saveData.getBestStage();
		cutStage++;
		
		if(StageManager.getStageCount() <= cutStage){
			cutStage = StageManager.getStageCount();
		}
		PlayerDataManager.saveData.setBestStage(cutStage);
		this.onUpdateStage.dispatch(cutStage);
	}.bind(this));

	this.fBtnCharacter.inputEnabled = true;
	this.fBtnCharacter.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		this.game.state.getCurrentState().toggleCharacterScene();
	}.bind(this));
	
	this.onUpdateStageNum = function(inStageNum){
		this.fTextStageNum.text = 'STAGE ' + inStageNum;
	};
	
	this.onUpdateStage = new Phaser.Signal();
	this.onUpdateStage.add(this.onUpdateStageNum, this);
	
	this.updateUI();
	this.visible = false;
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var LobbyScene_proto = Object.create(Phaser.Group.prototype);
LobbyScene.prototype = LobbyScene_proto;
LobbyScene.prototype.constructor = LobbyScene;

/* --- end generated code --- */
// -- user code here --
LobbyScene.prototype.fadeInLobby = function(isNotTween){
	this.visible = true;
	
	if(isNotTween === true){
		return;
	}
	
	this.fCoinContainer.y -= 100;
	this.fBottomUIContainer.alpha = 0;
	
	this.fBtnSetting.alpha = 0;
	this.fBtnStage.alpha = 0;
	this.fBtnStage.scale.set(1.05);
	this.fInviteContainer.alpha = 0;
	this.fInviteContainer.scale.set(1.05);

	this.game.add.tween(this.fInviteContainer).to({alpha : 1}, 1000, Phaser.Easing.Linear.None, true)
	.onComplete.addOnce(function(){
		this.game.add.tween(this.fInviteContainer.scale).to({x : 1, y : 1}, 100, Phaser.Easing.Linear.None, true)
		.onComplete.addOnce(function(){
			this.game.add.tween(this.fBottomUIContainer).to({alpha : 1}, 1000, Phaser.Easing.Linear.None, true);
			this.game.add.tween(this.fBtnSetting).to({alpha : 1}, 1000, Phaser.Easing.Linear.None, true);
			this.game.add.tween(this.fCoinContainer).to({y : this.fCoinContainer.y + 100}, 500, Phaser.Easing.Linear.None, true);
		}.bind(this));
	}.bind(this));
	
	this.game.time.events.add(200, function(){
		this.game.add.tween(this.fBtnStage).to({alpha : 1}, 1000, Phaser.Easing.Linear.None, true)
		.onComplete.addOnce(function(){
			this.game.add.tween(this.fBtnStage.scale).to({x : 1, y : 1}, 100, Phaser.Easing.Linear.None, true);
		}.bind(this));
	}.bind(this));

};

LobbyScene.prototype.updateUI = function(){
	this.fCoinContainer.x = this.game.world.width/2 - this.fCoinContainer.width/2;
	this.fIconCharacter.frameName = PlayerDataManager.saveData.getCharacterID() + '.png';
	
	var freeCoinTimeStamp = PlayerDataManager.saveData.getFreeCoinTimeStamp();
	var freeCoinTime = (StaticManager.dino_thornz_base.get('freecoin_time'))? StaticManager.dino_thornz_base.get("freecoin_time").value : InGameConfig.FREE_COIN_TIME;
	var completeFreeCoinTimeStamp = freeCoinTimeStamp + freeCoinTime;
	
	var remainTime = completeFreeCoinTimeStamp - new Date().getTime();

	if(remainTime <= 0){
		this.fWaitFreeCoinContainer.visible = false;
		this.fCompleteFreeCoinContainer.visible = true;
	}
	else{
		this.fWaitFreeCoinContainer.visible = true;
		this.fCompleteFreeCoinContainer.visible = false;
		this.fTextRemainTime.text = StzUtil.millysecondToHMs(remainTime, ['H ', 'M ', 'S']);
		if(this.freeCoinTimer){
			this.game.time.events.remove(this.freeCoinTimer);
			this.freeCoinTimer = null;
		}
		this.freeCoinTimer = this.game.time.events.loop(1000, function(){
			remainTime = completeFreeCoinTimeStamp - new Date().getTime();
			
			this.fTextRemainTime.text = StzUtil.millysecondToHMs(remainTime, ['H ', 'M ', 'S']);
			if(remainTime <= 0){
				if(this.freeCoinTimer){
					this.game.time.events.remove(this.freeCoinTimer);
					this.freeCoinTimer = null;
				}
				this.fWaitFreeCoinContainer.visible = false;
				this.fCompleteFreeCoinContainer.visible = true;
			}
		}.bind(this));
	}
};

LobbyScene.prototype.superDestroy = LobbyScene.prototype.destroy;
LobbyScene.prototype.destroy = function(destroyChildren, soft) {
	if(this.freeCoinTimer){
		this.game.time.events.remove(this.freeCoinTimer);
		this.freeCoinTimer = null;
	}
	PlayerDataManager.saveData.removeUpdateCoinDelegate(this.onUpdateCoinLobbyScene, this);
	
	this.superDestroy(destroyChildren, soft);
};