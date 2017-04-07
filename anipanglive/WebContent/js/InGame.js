function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.init = function(inIsBot) {

	// 게임 종료 체크용
	this.meGameEnd = false;
	this.rivalGameEnd = false;
	this.lastRivalMessageTime = 0;
	
	if (inIsBot === true) {
		this.aniBot = new AniBot(this, 20);
		this.aniBot.autoDifficulty = true; // 자동 난이도 조절
		this.aniBot.playListener = (function() {
			if (InGameInterruptedConfig.IS_ICE) {
				StzLog.print('[InGame] aniBot remain Ice Count: ' + (this.aniBot.remainBombCount));
				if (this.aniBot.remainBombCount <= 0) {
					var targetInterruptList = this.controller.interruptedIce.getInterruptedBlocks();
					this.controller.interruptedIce.setInterrupted(targetInterruptList, true, function(inRemainCount) {
						StzLog.print('[InGame] IceInterrupted Remain: ' + inRemainCount);
						if(inRemainCount <= 0){
							this.controller.setState(EControllerState.MATCH_TURN);
						}
					}, this);	
				}
			}
			
			this.rivalScore = this.aniBot.score;
			this.updateScoreView(this.scoreData.getScore(), this.rivalScore);
		}).bind(this);
	} else if (window.realjs) {
		
		realjs.event.leaveRoomListener.add(function(data) {
			
			if (data.room_id === 'lobby') {
				return;
			}
			
			if (data.user_id != window.MeInfo.real_id) {
				window.RivalInfo.state = ERivalState.DISCONNECT;
				this.rivalGameEnd = true;	
			}
		}, this);
		
		realjs.event.messageListener.add(function(data) {
			
			if (data.sid === realjs.getMySessionId()) {
				return;
			}

			var rivalData = JSON.parse(data.m);
			
			this.lastRivalMessageTime = (new Date()).getTime();
			
			if (rivalData.hasOwnProperty('score')) {
				this.rivalScore = rivalData.score;
				this.updateScoreView(this.scoreData.getScore(), this.rivalScore);
			}
			
			if (rivalData.hasOwnProperty('game_end')) {
				this.rivalGameEnd = rivalData.game_end;
				if (this.checkGameEnd()) {
					this.stopControllGame();
				}
			}
			
			if (rivalData.hasOwnProperty('iceInterrupt')) {
				
				var iceIndexs = this.controller.interruptedIce.getInterruptedBlocks();
				if (iceIndexs.length > 0) {
					this.controller.interruptedIce.setInterrupted(iceIndexs, true, function(inRemainCount) {
						console.log('[InGame] IceInterrupted Remain: ' + inRemainCount);
						if(inRemainCount <= 0){
							this.controller.setState(EControllerState.MATCH_TURN);
						}
					}, this);
				}
				
			}
		}, this);
	}
	
	this.rivalScore = 0;
	
	this.isGameStarted = false;
	
	//점수 및 콤보
	this.scoreData = new Score(this.game);
	this.scoreData.onScoreUpdated = (this.OnScoreUpdated).bind(this);
	this.scoreData.onComboUpdated = (this.OnComboUpdated).bind(this);
	this.scoreData.onPivotStart = (this.onPivotStart).bind(this);
	this.scoreData.onPivotEnd = (this.onPivotEnd).bind(this);
	this.comboDuration = 0;
	this.pivotTimer = null;
};

InGame.prototype.OnScoreUpdated = function(inScore) {
	
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'combo': this.scoreData.getCombo(), 'score':inScore}), false);
	}
	this.updateScoreView(this.scoreData.getScore(), this.rivalScore);
};

InGame.prototype.OnComboUpdated = function(inCombo, inTimerDuration) {
	this.comboDuration = inTimerDuration;
};

InGame.prototype.onPivotStart = function(pivotTimer) {
	StzSoundList[ESoundName.SE_FEVER_LOOP].play("", 0, 1, true);
	
	this.feverAnim.visible = true;
	this.feverAnim.play("animFeverMode", 5, true);
	
	this.pivotTimer = pivotTimer;
	
	this.controller.setPivotFlag(true);
	this.controller.AllBlockClickFrame();
};

InGame.prototype.onPivotEnd = function() {
	StzSoundList[ESoundName.SE_FEVER_LOOP].stop();
	
	this.controller.setPivotFlag(false);
	
	this.feverAnim.visible = false;
	this.feverAnim.animations.stop("animFeverMode");
	
	this.pivotTimer = null;
	this.controller.initAllBlockFrame();
};

InGame.prototype.preload = function() {

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

InGame.prototype.create = function() {

	// init Scene
	this.scene = new InGameScene(this);
	
    // 방해 얼음 테스트코드
	this.game.input.mouse.capture = true;
	/*
	var thumbMeBMD = this.game.make.bitmapData(this.scene.fThumbMe.width, this.scene.fThumbMe.height);
	thumbMeBMD.draw(this.fThumbMe);
	this.scene.fMeThumbContainer.mask = thumbMeBMD;
	*/
	
	
	// init Controller
	this.controller = InGameController(this);
	
	// you can insert code here

	this.scene.fMeContainer.x = -1 * this.game.width / 2 + 15;
	this.scene.fRivalContainer.x = (this.game.width / 2) - 65;

	
	this.scene.fMeFaceLose.visible = false;
	this.scene.fRivalFaceLose.visible = false;
	
	// init UserInteraction
	this.game.input.onDown.add(this.controller.clickBlock, this.controller);
	this.game.input.addMoveCallback(this.controller.moveBlock, this.controller);
	this.game.input.onUp.add(this.controller.unClickBlock, this.controller);
	
	//시간 관련
	this.timeCount = StzGameConfig.GAME_LIMIT_TIME;
	
	this.remainTimeText = this.game.add.text(this.scene.fTimeGageBody.x - 65, 
			this.scene.fTimeGageBody.y + this.scene.fTimeGageBody.height/2 +2, StzUtil.millysecondToSM(this.timeCount), {
		fontSize : '30px',
		fill : '#FFFFFF',
		font : 'hs_bubbleregular'
	},this.scene.fTopUIContainer);

	this.remainTimeText.anchor.set(0.5);	
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);
	
	this.remainTimeText.anchor.set(0.5);
	this.startTimestamp = (new Date()).getTime();
	
    this.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
    this.bombCountText = this.game.add.text(0,60, "BombRemainCount : " + this.bombRemainCount, {
        fontSize : '20px',
        fill : '#FFFFFF',
        font : 'hs_bubbleregular'
    },this.scene.fTopUIContainer);
   
	this.scene.fTopUIContainer.bringToTop(this.remainTimeText);

	StzSoundList[ESoundName.BGM_GAME].play('', 0, 1, true);
	
	this.scene.fWarning.visible = false;
	this.feverAnim = this.game.add.sprite(0, 0, "animFeverMode", "", this.scene.fFeverAnimContainer);
	this.feverAnim.animations.add("animFeverMode");
	this.feverAnim.visible = false;
	
	this.txtStateImage = this.game.add.sprite(0, 0, "txtImage", "ready.png", this.scene.fTxtStateImage);
	this.txtStateImage.anchor.set(0.5, 0.5);
	this.txtStateImage.visible = false;
	
//	this.starSpriteArray = [];
//	for(var i=0; i < 5; i++){
//		var fameName =  "star0" + (i+1)+".png";
//		this.starSpriteArray.push(this.game.add.sprite(this.scene.fThumbMe.x,this.scene.fThumbMe.y, "starSprite" ,fameName ,this.scene.fMeContainer));
//		this.starSpriteArray[i].anchor.set(0.5,0.5);
//		this.starSpriteArray[i].visible = false;
//	}

	this.playGameStartCounter();
};

InGame.prototype.playGameStartCounter = function() {
	var countToGameStart = 2;
	
	this.txtStateImage.visible = true;
	this.txtStateImage.frameName = "ready.png";
	
	StzSoundList[ESoundName.SE_READY_VOICE].play();
	
	this.startGame();
	this.controller.controlFlag(false);
	this.game.time.events.loop(Phaser.Timer.SECOND, function() {
		countToGameStart = countToGameStart - 1;
		
		if(countToGameStart === 1){
			StzSoundList[ESoundName.SE_START_VOICE].play();
			this.txtStateImage.frameName = "start.png";
		}

		else if (countToGameStart <= 0) {
			this.game.time.events.removeAll();
			
			this.txtStateImage.visible = false;
			this.controller.controlFlag(true);
			this.gameTimer = this.game.time.events.loop(10, this.timerCheck, this);
			this.controller.hintTimerStart();
		} 
	}, this);
};

InGame.prototype.startGame = function() {
	this.isGameStarted = true;
	this.controller.initBoard();
};

InGame.prototype.update = function() {
	
	if (this.isGameStarted === false) {
		return;
	}
	
	if (this.aniBot) {
		this.aniBot.update();	
	}
	
	if (this.comboDuration > 0) {
		
		if(this.comboDuration <= 0 ) {
			this.scoreData.setCombo(0);
			this.comboDuration = 0;
		}
	}

	if (this.bombRemainCount === 0) {
		this.bombRemainCount = StzGameConfig.BOMB_CREAT_COUNT;
		if (window.realjs && InGameInterruptedConfig.IS_ICE) {
			realjs.realSendMessage(JSON.stringify({'iceInterrupt': 4}), false);
		}
	}
	
	this.controller.updateView();
};

InGame.prototype.updateScoreView = function (playerScore, rivalScore) {	

	// 점수 업데이트
	this.scene.fMeScore.text = this.scoreData.getScoreText();
	this.scene.fRivalScore.text = StzUtil.createNumComma(rivalScore);
	
	if (playerScore <= 0 || rivalScore <= 0) {
		return;
	}
	
	// 표정 업데이트
	this.scene.fRivalFaceLose.visible = (playerScore >= rivalScore);
	this.scene.fMeFaceWin.visible = (playerScore >= rivalScore);
	this.scene.fRivalFaceWin.visible = (playerScore < rivalScore);
	this.scene.fMeFaceLose.visible = (playerScore < rivalScore);
	
	var rivalOffset = this.game.width * (playerScore / (playerScore + rivalScore)) ;
	if (rivalOffset >= this.game.width - 100) {
		rivalOffset = this.game.width - 100;
	}
	var meOffset = this.game.width - rivalOffset; 
	
	//-360
//	if(meOffset < 360){
//		for(var i=0; i < 5; i++){
//			this.starSpriteArray[i].visible = true;
//		}
//	}
//	else{
//		for(var i=0; i < 5; i++){
//			this.starSpriteArray[i].visible = false;
//		}
//	}

	this.game.add.tween(this.scene.fMeContainer).to({'x': -1 * meOffset + 15}, 500, "Quart.easeOut", true);
	this.game.add.tween(this.scene.fRivalContainer).to({'x': (rivalOffset - 65)}, 500, "Quart.easeOut", true);

};

InGame.prototype.checkGameEnd = function() {
	
	if (this.aniBot) {
		this.rivalGameEnd = true;
	}
	
	if (this.rivalGameEnd === false) {
		var lastRivalMessageOffset = ((this.lastRivalMessageTime === 0) ? 0 : (new Date()).getTime() - this.lastRivalMessageTime);
		if (lastRivalMessageOffset > StzGameConfig.USER_LEAVE_CHECK_TIME) {
			this.rivalGameEnd = true;
		}	
	}
	
	if (this.meGameEnd === true && this.rivalGameEnd === true) {
		return true;
	}
	
	return false;
};

InGame.prototype.stopControllGame = function() {
	
	// stop user play
	StzSoundList[ESoundName.BGM_GAME].stop();
	this.onPivotEnd();
	
	this.controller.controlFlag(false);
	
	if (this.ingameBlind) {
		this.ingameBlind.destroy();
	}
	if (this.ingameWaitingTween) {
		this.game.tweens.removeAll();
	}
	if (this.ingameWaiting) {
		this.ingameWaiting.destroy();
	}
	
	this.game.state.start("Result", true, false, [this.scoreData.getScore(), this.rivalScore]);
};

InGame.prototype.timerCheck = function(){
	
	if(this.timeCount <= 0){
		
		// Stop bot play
		if (this.aniBot && this.aniBot.isStop() === false) {
			this.aniBot.stop();
		}
		
		if(this.warningTimer && this.warningTimer.timer.running === true){
			this.game.time.events.remove(this.warningTimer);
			this.scene.fWarning.visible = false;
		}
		
		if(this.controller.getPivotFlag() === true){
			this.onPivotEnd();
		}
		
		this.controller.controlFlag(false);
		
		if(this.controller.checkNormal() === true){
			
			this.game.time.events.remove(this.gameTimer);
			
			this.txtStateImage.visible = true;
			this.txtStateImage.frameName = "timeover.png";
			
			this.game.time.events.add(2000, function(){
				this.controller.setState(EControllerState.LASTPANG_TURN);
				this.txtStateImage.visible = false;
				this.txtStateImage.kill();
				this.txtStateImage = null;
			}.bind(this));
			// 게임 정지 -> 라스트팡 시작.	
			this.pivotTimer = null;
			this.comboDuration = 0;
		}
		
		return;
	}
	
	if(this.timeCount === StzGameConfig.GAME_LEVEL_UP_TIME){
		this.controller.setLevelUP();
	}
	
	if(this.timeCount === StzGameConfig.GAME_WARNING_TIME){
		this.warningTimer = this.game.time.events.loop(250, function(){
			if(this.scene.fWarning.visible === false){
				this.scene.fWarning.visible = true;
			}
			else{
				this.scene.fWarning.visible = false;
			}
			
		}, this);
	}
	
	this.timeCount = this.timeCount - 1;

	
	if (this.timeCount <= 0) {
		this.timeCount = 0;
	}
	this.scene.fTimeGageBody.scale.x =  (StzGameConfig.GAUGE_TIMER_BODY_INITIAL_SCALE / StzGameConfig.GAME_LIMIT_TIME * this.timeCount);
	this.scene.fTimerEnd.x = this.scene.fTimeGageBody.x + this.scene.fTimeGageBody.width;
	this.remainTimeText.text = StzUtil.millysecondToSM (this.timeCount);
};

InGame.prototype.moveSpriteByQuadraticBezierCurve = function(inSprite, inFromPoint, inCentralPoint, inToPoint, inCallback, inContext) {
	inSprite.anchor.set(0.5, 0.5);
	var bezierTween = game.add.tween(inSprite).to({
		x: [inFromPoint.x, inCentralPoint.x, inCentralPoint.x, inToPoint.x],
		y: [inFromPoint.y, inCentralPoint.y, inCentralPoint.y, inToPoint.y],
	}, 500,Phaser.Easing.Quadratic.InOut, true, 0).interpolation(function(v, k){
		return Phaser.Math.bezierInterpolation(v, k);
	});
	bezierTween.onComplete.addOnce(function() {
		
		if (inSprite != null) {
			inSprite.kill();
		}
		if (typeof inCallback !== 'undefined') {
			if (typeof inContext !== 'undefined') {
				inCallback.call(inContext);
			}else {
				inCallback();
			} 
		}
	});
};


InGame.prototype.updateBombGauge = function() {
	this.bombCountText.text = "BombRemainCount : " + this.bombRemainCount;
	var accumulateCount = StzGameConfig.BOMB_CREAT_COUNT - this.bombRemainCount;
	var currentFrameIndex = Math.floor((accumulateCount / StzGameConfig.BOMB_CREAT_COUNT * 100) / 20);
	this.scene.fBombGauge.frame = currentFrameIndex;
};


InGame.prototype.createComboText = function(inBlockModel) {
	
	if (window.isComboShow === false) {
		return;
	}
	if(inBlockModel === undefined || inBlockModel === null){
		return;
	}
	var txtComboFontStyle = { fontSize: '24px', font: 'hs_bubbleregular', fill: '#8b4b00'};
	var txtCombo = this.game.add.text(inBlockModel.view.world.x, inBlockModel.view.world.y, (this.scoreData.getCombo() + 1) + 'combo', txtComboFontStyle);
	txtCombo.anchor.setTo(0.5, 1.0);
	txtCombo.y = txtCombo.y - (inBlockModel.view.height / 3);
	
	var comboShowTimer = this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function() {
		if (txtCombo) {
			txtCombo.kill();
		}
	}, this);
};

InGame.prototype.createScoreText = function(x, y, count) {
	
	if (window.isScoreShow === false) {
		return;
	}
	
	var txtScoreFontStyle = { fontSize: '36px', font: 'hs_bubbleregular', fill: '#8b4b00'};
	var machedBlocksLength = count;
	var currentCombo = this.scoreData.getCombo();
	
	var txtScore = this.game.add.text(x , y , machedBlocksLength*(currentCombo+1)* EScoreConfig.UNIT_SCORE, txtScoreFontStyle);
	txtScore.anchor.setTo(0.5, 1.0);
	
	var scoreShowTimer = null;
	    scoreShowTimer = this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function(scoreTimer) {
		if (txtScore !== undefined && txtScore !== null) {
			this.game.time.events.remove(scoreTimer);
			txtScore.kill();
		}
	}, this, scoreShowTimer);
	
//	var txtScoreFontStyle = { fontSize: '36px', font: 'hs_bubbleregular', fill: '#8b4b00'};
//	var currentCombo = this.scoreData.getCombo();
//	var txtScore = this.game.add.text(inBlockModel.view.world.x, inBlockModel.view.world.y + 20, ((currentCombo === 0 ? 1 : currentCombo) * EScoreConfig.UNIT_SCORE), txtScoreFontStyle);
//	txtScore.anchor.setTo(0.5, 0.5);
//	txtScore.y = txtScore.y - (inBlockModel.view.height / 4);
//	
//	var scoreShowTimer = this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function() {
//		if (txtScore !== undefined && txtScore !== null) {
//			txtScore.kill();
////			if (window.isScoreFly === false) {
////					
////			} else {
////				var fromPosition = txtScore.position;
////				var toPosition = this.scene.fThumbMe.world;
////				var centralPosition = new Phaser.Point(toPosition.x, 290);
////				this.moveSpriteByQuadraticBezierCurve(txtScore, fromPosition, centralPosition, toPosition, function() {
////					if (txtScore) {
////						txtScore.kill();
////					}
////				}, this);
////			}
//		}
//	}, this);	
};

InGame.prototype.showWaitingFriends = function() {
	
	this.ingameWaiting = this.game.add.sprite(this.game.width / 2, this.game.height / 4, 'waiting');
	this.ingameWaiting.anchor.setTo(0.5, 0.5);
	this.ingameWaitingTween = this.game.add.tween(this.ingameWaiting.scale).to({'x': 1.5, 'y': 1.5}, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
};

