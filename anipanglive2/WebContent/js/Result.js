function Result() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Result.prototype = proto;

Result.prototype.init = function(inScores) {
	
	this.isStart = false;
	
	this.scores = {
		'me': inScores[0], 
		'rival': inScores[1]
	};
	
	this.isPlayAgain = {
		'me': null,
		'rival': null
	};
	if (window.RivalInfo.state === ERivalState.DISCONNECT) {
		this.isPlayAgain.rival = false;
	}
	
	this.capturePosition = {
		'winner': {'x': 0, 'y': 100, 'width': this.game.width, 'height': 380}, 
		'loser': {'x': 0, 'y': 600, 'width': this.game.width, 'height': 310}
	};
	
	if (window.realjs) {
		
		
		realjs.event.roomStartListener.removeAll();
		realjs.event.roomStartListener.add(function(data) {
			if (this.isStart) {
				return;
			}
			
			this.isStart = true;
			if (data.hasOwnProperty('t')) {
				window.gameStartTime = data.t + (Phaser.Timer.SECOND * 2);
			} else {
				window.gameStartTime = null;
			}
			this.game.state.start("InGame");
		}, this);

		// 라이벌 유저 게임 종료
		if (window.RivalInfo.state !== ERivalState.DISCONNECT) {
			realjs.event.leaveRoomListener.add(function(data) {
				
				if (this.game.state.current !== "Result") {
					return;
				}
				
				if (data.room_id === 'lobby') {
					return;
				}
				
				if (data.user_id != window.MeInfo.real_id) {
					window.RivalInfo.state = ERivalState.DISCONNECT;
					this.isPlayAgain.rival = false;
				}
			}, this);	
		}
		
		// 이모티콘 메시지 확인
		realjs.event.messageListener.removeAll();
		realjs.event.messageListener.add(function(data) {
			if (data.sid === realjs.getMySessionId()) {
				return;
			}
			
			var rivalData = JSON.parse(data.m);
			
			if (rivalData.hasOwnProperty('emoticonName')) {
				if(this.isWin === true){
					this.scene.operateLoseEmotion(rivalData.emoticonName, false);
				}
				else{
					this.scene.operateWinEmotion(rivalData.emoticonName, false);
				}
			}
			
		}, this);
	}
};

Result.prototype.preload = function() {
	
	this.game.load.crossOrigin = 'Anonymous';
	if (this.game.cache.checkImageKey('meProfileImage') === false) {
		if (window.MeInfo.thumbnail.indexOf("http") >= 0) {
			this.game.load.image('meProfileImage', window.MeInfo.thumbnail);	
		}
	}

	// thumbnail setting - 'rivalProfileImage'
	if (this.game.cache.checkImageKey('rivalProfileImage') === false) {
		if (window.RivalInfo.thumbnail.indexOf('http') >= 0) {
			this.game.load.image('rivalProfileImage', window.RivalInfo.thumbnail);
		}
	}
};

Result.prototype.create = function() {
	
	window.currentGameState = this.game.state.current;
	
	this.scene = new ResultScene(this.game);

	var preBadgeData = {
			badgeGrade:window.MeInfo.badge.getBadgeData().grade,
			starCount:window.MeInfo.badge.getBadgeData().starCount,
	};
	
	if (this.scores.me > this.scores.rival) {
	
		this.scene.setWinAndLoseResultUI(window.MeInfo, window.RivalInfo, this.scores.me, this.scores.rival);
		this.scene.createProfileImage('meProfileImage', 'rivalProfileImage');
		
		this.isWin = true;

		realjs.realUpdateUserTrophy(window.MeInfo.real_id, securityStorage.getInt('winTrophy'));
		
		if(window.RivalInfo.real_id !== 0){
			realjs.realUpdateUserTrophy(window.RivalInfo.real_id, securityStorage.getInt('loseTrophy'));
		}
		
		this.createWinParticle();
	} 
	else if(this.scores.me === this.scores.rival){
		this.scene.setDrawResultUI(window.MeInfo, window.RivalInfo, this.scores.me, this.scores.rival);
		this.scene.createProfileImage('meProfileImage', 'rivalProfileImage');
		
		this.isWin = true;
	}
	else {

		this.scene.setWinAndLoseResultUI(window.RivalInfo, window.MeInfo, this.scores.rival, this.scores.me);
		this.scene.createProfileImage('rivalProfileImage','meProfileImage');
		
		this.isWin = false;

		realjs.realUpdateUserTrophy(window.MeInfo.real_id, securityStorage.getInt('loseTrophy'));
		
		if(window.RivalInfo.real_id !== 0){
			realjs.realUpdateUserTrophy(window.RivalInfo.real_id, securityStorage.getInt('winTrophy'));
		}
		
		this.createWinParticle();
	}
	
	this.scene.fBtnNewGame.events.onInputUp.add(this.OnClickExitToLobby, this);
	this.scene.fBtnEmoticon.events.onInputUp.add(this.OnClickEmoticonButton, this);
	this.scene.fBtnShare.events.onInputUp.add(this.OnClickShareButton, this);
	
	this.game.time.events.add(300, function(){
		StzSoundList[ESoundName.SE_RESULT].play('', 0, 1, false);
	}.bind(this));
	
	this.EmoticonArray = [this.scene.fProvokeEmoticon, this.scene.fSadEmoticon, 
	                      this.scene.fFunEmoticon, this.scene.fRegameEmoticon];
	
	for(var i=0; i<this.EmoticonArray.length; i++){
		this.EmoticonArray[i].inputEnabled = true;
		this.EmoticonArray[i].events.onInputUp.add(this.OnClickEmoticon, this);
	}
	
	this.scene.operateTxtAnim(this.scene.fBtnEmofiInfo);
	this.scene.operateTxtAnim(this.scene.fBtnNewGameInfo);
	this.scene.operateTxtAnim(this.scene.fBtnShareInfo);
	
	var curBadgeData = {
			badgeGrade:window.MeInfo.badge.getBadgeData().grade,
			starCount:window.MeInfo.badge.getBadgeData().starCount,
	};
	
	if(preBadgeData.badgeGrade < curBadgeData.badgeGrade){
		this.popupLevelUp = this.game.plugins.add(new PopupLevelUp(this.game, this, {blind:true}));
		this.popupLevelUp.setData(preBadgeData, curBadgeData, true);
		this.popupLevelUp.popupOpen();
	}
	else if(preBadgeData.badgeGrade > curBadgeData.badgeGrade){
		this.scene.popupOpenDrawLvDown(preBadgeData, curBadgeData);
	}
	else if(preBadgeData.starCount < curBadgeData.starCount){
		this.popupLevelUp = this.game.plugins.add(new PopupLevelUp(this.game, this, {blind:true}));
		this.popupLevelUp.setData(preBadgeData, curBadgeData, false);
		this.popupLevelUp.popupOpen();
	}
	else if(preBadgeData.starCount > curBadgeData.starCount){
		this.scene.popupOpenDrawLvDown(preBadgeData, curBadgeData);
	}

};

Result.prototype.initData = function(isCleanRivalData) {
	
	this.scores.me = 0;
	this.scores.rival = 0;
	this.isPlayAgain.me = null;
	this.isPlayAgain.rival = null;
	
	this.time.removeAll();
	this.tweens.removeAll();
};

Result.prototype.createWinParticle = function() {
	
		this.back_emitter = game.add.emitter(0, 0, 600);
		this.back_emitter.makeParticles('winParticle', [0, 1]);

		this.back_emitter.minParticleSpeed.setTo(-120, -120);
		this.back_emitter.maxParticleSpeed.setTo(120, 120);
		this.back_emitter.maxParticleScale = 1;
		this.back_emitter.minParticleScale = 0.5;
		this.back_emitter.minRotation = 0;
		this.back_emitter.maxRotation = 40;
		this.back_emitter.gravity = 0;
	    this.scene.fWinParticlesContainer.add(this.back_emitter);
	
	    this.back_emitter.start(false, 1500, 18);
};

Result.prototype.OnClickExitToLobby = function(item) {
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'isPlayAgain': false}), false);
		realjs.event.messageListener.removeAll();
		// NOTE @hyegeun 대화방 우선 매칭 비활성화 
		//realjs.realJoinLobby(false, window.fbContextId);
		realjs.realJoinLobby(false);
	}
	if(this.back_emitter !== undefined && this.back_emitter !== null){
		this.back_emitter.destroy();
		this.back_emitter = null;
	}
	
	this.initData(true);
	this.game.state.start("Lobby");
	/*
	if (window.FBInstant) {
		FBInstant.quit();
	} else {
		this.game.state.start("Lobby");	
	}
	*/
};

Result.prototype.OnClickShareButton = function() {
	if (window.FBInstant === null) {
		return;
	}
	
	if (FBInstant.getSDKVersion().indexOf('3.') >= 0) {
		var base64Picture = StzUtil.getScreenCapture(this.game, 0, (this.isWin ? this.capturePosition.winner.y : this.capturePosition.loser.y), this.game.width, (this.isWin ? this.capturePosition.winner.height : this.capturePosition.loser.height));
		FBInstant.shareAsync({
			intent: 'INVITE', 
			image: base64Picture,
			text: 'Play with ME!!', 
		}).then(function() {
			StzLog.print("[Result (OnClickShareButton)] Share Success!!");
		}).catch(function(err) {
			console.log('err: ' + err);
		});	
	} else {
		FBInstant.takeScreenshotAsync();
		FBInstant.endGameAsync().then(function() {
			this.game.state.start("Lobby");
		});
	}
};

/**
 * 이모티콘 버튼 눌렀을 경우 이모티콘 팝업 ON/OFF
 */
Result.prototype.OnClickEmoticonButton = function() {
	if(this.scene.fEmoticonGroup.alpha !== 1 && this.scene.fEmoticonGroup.alpha !== 0){
		return;
	}
	
	if(this.scene.fEmoticonGroup.visible === false){
		this.scene.operatePopupEmotion(true);
	}
	else{
		this.scene.operatePopupEmotion(false);
	}
};

/**
 * 이모티콘 눌렀을 경우 
 */
Result.prototype.OnClickEmoticon = function(sprite) {
	if(this.isWin === true){
		this.scene.operateWinEmotion(sprite.animations.currentFrame.name, true);
	}
	else{
		this.scene.operateLoseEmotion(sprite.animations.currentFrame.name, true);
	}
	
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'emoticonName' : sprite.animations.currentFrame.name}), false);
	}
};
