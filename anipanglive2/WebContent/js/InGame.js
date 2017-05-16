function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;
InGame.prototype.init = function(inIsBot) {

	// init Scene
	this.scene = new InGameScene(this);
	
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
					this.controller.interruptedCloud.addCloudInterrupt();
					this.controller.interruptedIce.addIceInterrupt(4);
					
				}
			}
			
			this.rivalScore = this.aniBot.score;
			this.updateScoreView(this.scoreData.getScore(), this.rivalScore);
		}).bind(this);
	} else if (window.realjs) {
		realjs.event.leaveRoomListener.add(function(data) {
			
			if (this.game.state.current !== "InGame") {
				return;
			}
			
			if (data.room_id === 'lobby') {
				return;
			}
			
			if (data.user_id != window.MeInfo.real_id) {
				window.RivalInfo.state = ERivalState.DISCONNECT;
				this.rivalGameEnd = true;	
			}
		}, this);
		
		realjs.event.messageListener.removeAll();
		realjs.event.messageListener.add(function(data) {
			
			if (data.sid === realjs.getMySessionId()) {
				return;
			}

			// time interpolation
			if (data.hasOwnProperty('t') && window.gameStartTime) {
				var currentServerTime = data.t;
				this.timeCount = StzGameConfig.GAME_LIMIT_TIME - (currentServerTime - window.gameStartTime);
				StzLog.print('[InGame (messageListener)] Time Interp - processTime: ' + (currentServerTime - window.gameStartTime) + ', timeCount: ' + this.timeCount);
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
					this.controller.interruptedIce.addIceInterrupt(4);
				}
				
			}
			
			if (rivalData.hasOwnProperty('cloudInterrupt')) {
				this.controller.interruptedCloud.addCloudInterrupt();
			}
			
		}, this);
		
	}
	
	this.rivalScore = 0;
	
	this.isGameStarted = false;
	
	//점수 및 콤보
	this.scoreData = new Score(this.game);
	this.scoreData.initData();
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
	if(this.timeCount <= 0){
		return;
	}
	
	this.scene.boardNoticePlay("fever_time.png");
	
	StzSoundList[ESoundName.SE_FEVER_LOOP].play("", 0, 1, true);
	StzSoundList[ESoundName.BGM_GAME].stop();
	StzSoundList[ESoundName.BGM_FEVER].play("", 0, 1, true);
	
	this.feverAnim.visible = true;
	this.feverAnim.play("animFeverMode", 5, true);
	
	//StzSoundList[ESoundName.BGM_GAME]._sound.playbackRate.value = 1.1;
	
	this.pivotTimer = pivotTimer;
	
	this.controller.setPivotFlag(true);
	this.controller.AllBlockClickFrame();
};

InGame.prototype.onPivotEnd = function() {
	StzSoundList[ESoundName.SE_FEVER_LOOP].stop();
	StzSoundList[ESoundName.BGM_FEVER].stop();
	
	if(this.timeCount > StzGameConfig.GAME_WARNING1_TIME){
		StzSoundList[ESoundName.BGM_GAME].play("", 0, 1, true);
	}
	
	
	this.controller.setPivotFlag(false);
	
	//StzSoundList[ESoundName.BGM_GAME]._sound.playbackRate.value = 1.0;
	
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
	
	window.currentGameState = this.game.state.current;
	
	// 인게임 진입 시 이미 유저가 떠난 상태라면
	if (window.RivalInfo.state === ERivalState.DISCONNECT) {
		this.rivalGameEnd = true;
	}
	StzSoundList[ESoundName.BGM_MATCHING].stop();
	
    // 방해 얼음 테스트코드
	this.game.input.mouse.capture = true;
	
	// init Controller
	this.controller = InGameController(this);
	
	// init UserInteraction
	this.game.input.onDown.add(this.controller.clickBlock, this.controller);
	this.game.input.addMoveCallback(this.controller.moveBlock, this.controller);
	this.game.input.onUp.add(this.controller.unClickBlock, this.controller);
	
	//시간 관련
	this.timeCount = StzGameConfig.GAME_LIMIT_TIME;

	this.startTimestamp = (new Date()).getTime();
	
	//아이스 인터럽트 관련 변수
    this.iceInterruptBlockRemainCount = InGameInterruptedConfig.ICE_CREAT_COUNT;
    this.icePrevBlockRemainCount = 0;
    this.iceInterrupCount = 0;
    this.maxIceEffectAnim = this.game.add.sprite(this.scene.fBtnIce.x - 10, this.scene.fBtnIce.y - 10, "animMaxEffect", null, this.scene.fAnimMaxEffectGroup);
    this.maxIceEffectAnim.animations.add("animMaxEffect");
    this.maxIceEffectAnim.visible = false;
    this.iceAnimTimer = null;

    //구름 인터럽트 관련 변수
    this.cloudInterruptBlockRemainCount = InGameInterruptedConfig.CLOUD_CREAT_COUNT;
    this.cloudPrevBlockRemainCount = 0;
    this.cloudInterrupCount = 0;
    this.maxCloudEffectAnim = this.game.add.sprite(this.scene.fBtnCloud.x - 10, this.scene.fBtnCloud.y - 10, "animMaxEffect", null, this.scene.fAnimMaxEffectGroup);
    this.maxCloudEffectAnim.animations.add("animMaxEffect");
    this.maxCloudEffectAnim.visible = false;
    this.cloudAnimTimer = null;
    
    this.scene.fBtnIce.events.onInputDown.add(this.sendInterrupt, this);
    this.scene.fBtnCloud.events.onInputDown.add(this.sendInterrupt, this);
    this.scene.fBtnIce.inputEnabled = false;
    this.scene.fBtnCloud.inputEnabled = false;

	StzSoundList[ESoundName.BGM_GAME].play('', 0, 1, true);
	
	this.scene.fWarning.visible = false;
	this.feverAnim = this.game.add.sprite(0, 0, "animFeverMode", "", this.scene.fFeverAnimContainer);
	this.feverAnim.animations.add("animFeverMode");
	this.feverAnim.visible = false;
	
	this.txtStateImage = this.game.add.sprite(0, 0, "txtImage", "ready.png", this.scene.fTxtStateImage);
	this.txtStateImage.anchor.set(0.5, 0.5);
	this.txtStateImage.visible = false;
	
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
			this.gameTimer = this.game.time.events.loop((Phaser.Timer.SECOND / 10), this.timerCheck, this);
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
	
	this.checkInterruptCount();
	this.controller.updateView();
};

InGame.prototype.checkInterruptCount = function(){
	//얼음 블럭 남은 카운터에 따라 얼음 공격 개수를 채워짐
	if (this.iceInterruptBlockRemainCount === 0 && (this.scene.fBtnIce.inputEnabled === null || this.scene.fBtnIce.inputEnabled === false)) {
		//보드 중앙에 나오는 차지 애니매이션
		this.scene.boardNoticePlay("ice_charged.png");
		
		this.scene.fIceFire.visible = true;
		this.iceInterrupCount++;
	    this.scene.fBtnIce.inputEnabled = true;

	    this.maxIceEffectAnim.visible = true;
	    this.maxIceEffectAnim.animations.play("animMaxEffect",20, true);
	    
		if(this.iceInterrupCount >= InGameInterruptedConfig.ICE_MAX_COUNT){
			this.iceInterrupCount = InGameInterruptedConfig.ICE_MAX_COUNT;
		}
		StzSoundList[ESoundName.SE_SKILL_FULL].play();
	}
	else if(this.iceInterruptBlockRemainCount < 0){
		this.iceInterruptBlockRemainCount = 0;
	}
	//
	else if(this.icePrevBlockRemainCount !== this.iceInterruptBlockRemainCount){
		var iceGauge = (InGameInterruptedConfig.ICE_CREAT_COUNT - this.iceInterruptBlockRemainCount)/InGameInterruptedConfig.ICE_CREAT_COUNT;
		this.scene.fBtnIceEnable.mask.destroy();
		this.scene.fBtnIceEnable.mask = this.game.add.graphics(this.scene.fBtnIceEnable.x, this.scene.fBtnIceEnable.y);
		this.scene.fBtnIceEnable.mask.beginFill(0xffffff);
		this.scene.fBtnIceEnable.mask.drawRect(0, this.scene.fBtnIceEnable.height, this.scene.fBtnIceEnable.width, -this.scene.fBtnIceEnable.height*iceGauge);
		this.icePrevBlockRemainCount = this.iceInterruptBlockRemainCount;
	}
	
	//구름 블럭 남은 카운터에 따라 구름 공격 개수를 채워짐
	if (this.cloudInterruptBlockRemainCount === 0 && (this.scene.fBtnCloud.inputEnabled === null || this.scene.fBtnCloud.inputEnabled === false)) {
		//보드 중앙에 나오는 차지 애니매이션
		this.scene.boardNoticePlay("cloud_charged.png");
		
		this.scene.fCloudFire.visible = true;
		this.cloudInterrupCount++;
	    this.scene.fBtnCloud.inputEnabled = true;
	    
	    this.maxCloudEffectAnim.visible = true;
	    this.maxCloudEffectAnim.animations.play("animMaxEffect",20, true);
	    
		if(this.cloudInterrupCount >= InGameInterruptedConfig.CLOUD_MAX_COUNT){
			this.cloudInterrupCount = InGameInterruptedConfig.CLOUD_MAX_COUNT;
		}
		StzSoundList[ESoundName.SE_SKILL_FULL].play();
	}
	else if(this.cloudInterruptBlockRemainCount < 0){
		this.cloudInterruptBlockRemainCount = 0;
	}
	
	else if(this.cloudPrevBlockRemainCount !== this.cloudInterruptBlockRemainCount){
		var cloudGauge = (InGameInterruptedConfig.CLOUD_CREAT_COUNT - this.cloudInterruptBlockRemainCount)/InGameInterruptedConfig.CLOUD_CREAT_COUNT;
		this.scene.fBtnCloudEnable.mask.destroy();
		this.scene.fBtnCloudEnable.mask = this.game.add.graphics(this.scene.fBtnCloudEnable.x, this.scene.fBtnCloudEnable.y);
		this.scene.fBtnCloudEnable.mask.beginFill(0xffffff);
		this.scene.fBtnCloudEnable.mask.drawRect(0, this.scene.fBtnCloudEnable.height, this.scene.fBtnCloudEnable.width, -this.scene.fBtnCloudEnable.height*cloudGauge);
		this.cloudPrevBlockRemainCount = this.cloudInterruptBlockRemainCount;
	}
};

//게이지가 풀로찬 하단 버튼 클릭 할 경우
InGame.prototype.sendInterrupt = function(sprite){
	if(this.timeCount <= 0){
		return;
	}
	
	StzSoundList[ESoundName.SE_SKILL_BUTTON].play();
	 this.scoreData.initStartComboStamp();
    if(sprite === this.scene.fBtnIce){
    	if (window.realjs) {
    		if(this.iceInterrupCount > 0){
    			this.scene.fIceFire.visible = false;
    		    this.scene.fBtnIce.inputEnabled = false;
    			this.iceInterruptBlockRemainCount = InGameInterruptedConfig.ICE_CREAT_COUNT;
    			this.iceInterrupCount--;
    			
    			this.maxIceEffectAnim.visible = false;
    		    this.maxIceEffectAnim.animations.stop("animMaxEffect");
    		    
    		    var attackPoint = this.game.add.image(this.scene.fBtnIce.x, this.scene.fBtnIce.y, 'light');
    		    attackPoint.anchor.set(0.5, 0.5);
    		    
    		    var fromPosition = attackPoint.world;
    		    var toPosition = this.scene.fRivalContainer.position;
    		    var centralPosition = new Phaser.Point(this.game.world.centerX, this.game.world.centerY);
    		    //공격 시 상대방 프로필 쪽에 공격 당한 애니매이션 재생
    		    this.moveSpriteByQuadraticBezierCurve(attackPoint, fromPosition, centralPosition, toPosition, 500, function(){
    		    	StzSoundList[ESoundName.SE_ICE_ATTACK].play();
    		    	attackPoint.kill();
    		    	attackPoint = null;
    		    	this.scene.iceProfileAnim.visible = true;
    		    	this.scene.iceProfileAnim.play('iceProfileAnim',2, false);
    		    	
    		    	this.scene.iceBackGoundAnim.visible = true;
    		    	this.scene.iceBackGoundAnim.play('iceBackGoundAnim',2, false);
    		    	
    		    	if(this.iceAnimTimer !== null){
    		    		this.game.time.events.remove(this.iceAnimTimer);
    		    		this.iceAnimTimer = null;
    		    	}
    		    	
    		    	this.iceAnimTimer = this.game.time.events.add(InGameInterruptedConfig.ICE_TIME*1000, function(){
    		    		this.scene.iceProfileAnim.visible = false;
    		    		this.scene.iceBackGoundAnim.visible = false;
    		    		this.iceAnimTimer = null;
    		    	}.bind(this));
    		    	
    		    	realjs.realSendMessage(JSON.stringify({'iceInterrupt': 4}), false);
    		    }.bind(this, attackPoint));
    		}
    	}
    }
    else if(sprite === this.scene.fBtnCloud){
    	if (window.realjs) {
    		if(this.cloudInterrupCount > 0){
    			this.scene.fCloudFire.visible = false;
    			this.scene.fBtnCloud.inputEnabled = false;
    			this.cloudInterruptBlockRemainCount = InGameInterruptedConfig.CLOUD_CREAT_COUNT;
    			this.cloudInterrupCount--;
    			
    			this.maxCloudEffectAnim.visible = false;
    		    this.maxCloudEffectAnim.animations.stop("animMaxEffect");
    		    
    		    var attackPoint = this.game.add.image(this.scene.fBtnCloud.x, this.scene.fBtnCloud.y, 'light');
    		    attackPoint.anchor.set(0.5, 0.5);
    		    
    		    var fromPosition = attackPoint.world;
    		    var toPosition = this.scene.fRivalContainer.position;
    		    var centralPosition = new Phaser.Point(this.game.world.centerX, this.game.world.centerY);
    		    //공격 시 상대방 프로필 쪽에 공격 당한 애니매이션 재생
    		    this.moveSpriteByQuadraticBezierCurve(attackPoint, fromPosition, centralPosition, toPosition, 500, function(){
    		    	StzSoundList[ESoundName.SE_RAIN_ATTACK].play();
    		    	attackPoint.kill();
    		    	attackPoint = null;
    		    	this.scene.cloudProfileAnim.visible = true;
    		    	this.scene.cloudProfileAnim.play('cloudProfileAnim',5, true);
    		    	
    		    	this.scene.cloudBackGroudAnim.visible = true;
    		    	var moveX = this.game.world.width - this.scene.cloudBackGroudAnim.width;
    		    	var cloudTween = this.game.add.tween(this.scene.cloudBackGroudAnim).to({x:moveX}, 2000, 'Quart.easeOut', true)
    				.onComplete.addOnce(function() {
    					cloudTween = null;
    				}.bind(this, cloudTween));
    		    	
    		    	
    		    	if(this.cloudAnimTimer !== null){
    		    		this.game.time.events.remove(this.cloudAnimTimer);
    		    		this.cloudAnimTimer = null;
    		    	}
    		    	
    		    	this.cloudAnimTimer = this.game.time.events.add(InGameInterruptedConfig.CLOUD_TIME, function(){
    		    		this.scene.cloudProfileAnim.visible = false;
    		    		this.scene.cloudBackGroudAnim.visible = false;
    		    		this.scene.cloudBackGroudAnim.x = this.game.world.width - this.scene.cloudBackGroudAnim.width*0.3;
    		    		this.scene.cloudProfileAnim.animations.stop('cloudProfileAnim');
    		    		
    		    		this.cloudAnimTimer = null;
    		    	}.bind(this));
    		    	
    		    	realjs.realSendMessage(JSON.stringify({'cloudInterrupt': 4}), false);
    		    }.bind(this, attackPoint));
    		}
    	}
    }
};

InGame.prototype.updateScoreView = function (playerScore, rivalScore) {	

	// 점수 업데이트
	this.scene.fMeScore.text = this.scoreData.getScoreText();
	this.scene.fRivalScore.text = StzUtil.createNumComma(rivalScore);
	var frameNum = 0;
	
	if (playerScore <= 0 || rivalScore <= 0) {
		frameNum = 3;
	}
	else{
		frameNum = this.checkFrameNum(rivalScore/playerScore);
	}
	
	if(this.prevFrame !== frameNum){
		var moveX = 0;
		this.prevFrame = frameNum;
		if(frameNum === 0){
			// rival win
			this.scene.playTinkleStar('rival');
			this.scene.playLoseBoard();
			moveX = this.scene.winSunPosXArray[2];
		}
		else if(frameNum === 3){
			// middle
			this.scene.stopTinkleStar();
			this.scene.stopLoseBoard();
			moveX = this.scene.winSunPosXArray[1];
		}
		else if(frameNum === 6){
			// me win
			this.scene.playTinkleStar('me');
			this.scene.stopLoseBoard();
			moveX = this.scene.winSunPosXArray[0];
		}
		
		var curFrame = this.scene.fAnimUpperUI.animations.currentFrame.index;
		
		var isUp = (curFrame > frameNum)?true:false;
		var frameArray = [];
		if(isUp === true){
			for(var i=curFrame; i>=frameNum; i--){
				frameArray.push(i);
			}
		}
		else{
			for(var i=curFrame; i<=frameNum; i++){
				frameArray.push(i);
			}
		}

		this.scene.fAnimUpperUI.animations.add('animUpper', frameArray, 5 , false);
		this.scene.fAnimUpperUI.animations.play('animUpper');	
		
		if(moveX !== 0){

			if (this.meCrownTween) {
				this.game.tweens.remove(this.meCrownTween);
				this.meCrownTween = null;
			}
			this.meCrownTween = this.game.add.tween(this.scene.fMeCrown).to({alpha: (moveX !== this.scene.winSunPosXArray[0] ? 0 : 1)}, 1000, 'Quart.easeOut', true)
			.onComplete.addOnce(function() {
				this.meCrownTween = null;
			}.bind(this));
			
			if (this.rivalCrownTween) {
				this.game.tweens.remove(this.rivalCrownTween);
				this.rivalCrowTween = null;
			}
			this.rivalCrowTween = this.game.add.tween(this.scene.fRivalCrown).to({alpha: (moveX !== this.scene.winSunPosXArray[2] ? 0 : 1)}, 1000, 'Quart.easeOut', true)
			.onComplete.addOnce(function() {
				this.rivalCrowTween = null;
			}.bind(this));
			
			if(this.sunTween !== undefined && this.sunTween !== null){
				this.game.tweens.remove(this.sunTween);
				this.sunTween = null;
			}
			
			this.sunTween = this.game.add.tween(this.scene.fWinnerSun).to({x:moveX}, 2000, 'Quart.easeOut', true)
			.onComplete.addOnce(function() {
				this.sunTween = null;
			}.bind(this, moveX));
		}
		
	}
};

InGame.prototype.checkFrameNum = function(percent){
	var frameNum = 0;
	
	if(percent < 0.8){
		frameNum = 6;
	}

	else if(percent>=0.8 && percent<=1.2){
		frameNum = 3;
	}
	
	else{
		frameNum = 0;
	}
	
	return frameNum;
}; 

InGame.prototype.checkGameEnd = function() {
	
	if (this.aniBot) {
		this.rivalGameEnd = true;
	}
	
	if (this.rivalGameEnd === false) {
		
		if (this.lastRivalMessageTime === 0) {
			this.lastRivalMessageTime = (new Date()).getTime();
		}
		
		var lastRivalMessageOffset = (new Date()).getTime() - this.lastRivalMessageTime;
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
	//StzSoundList[ESoundName.BGM_GAME].stop();
	//this.onPivotEnd();
	
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
	
	StzObjectPool.init();
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
		
		this.txtStateImage.visible = true;
		this.txtStateImage.frameName = "timeover.png";
		
		this.onPivotEnd();
		
		if(this.controller.checkNormal(false) === true){
			
			this.game.time.events.remove(this.gameTimer);

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
	
	if(this.timeCount <= StzGameConfig.GAME_LEVEL_UP_TIME && this.controller.getLevelUP() === 0){
		this.controller.setLevelUP();
	}
	
	if(this.timeCount <= StzGameConfig.GAME_WARNING1_TIME && this.scene.fTimer_start.frameName ===  "green_end.png"){
		//타이머 색깔 노란색
		StzSoundList[ESoundName.BGM_GAME].stop();
		this.scene.fTimer_start.frameName = "yellow_end.png";
		this.scene.fTimeGageBody.frameName = "middle_bar_yellow.png";
		this.scene.fTimerEnd.frameName = "yellow_start.png";
		
		this.warningTimer = this.game.time.events.loop(200, function(){
			if(this.scene.fWarning.visible === false){
				this.scene.fWarning.visible = true;
			}
			else{
				this.scene.fWarning.visible = false;
			}
			
		}, this);
		
		StzSoundList[ESoundName.SE_COUNTDOWN1].play();
		StzSoundList[ESoundName.SE_COUNTDOWN1].onStop.add(function(){
			if(this.timeCount <= 0){
				return;
			}
			StzSoundList[ESoundName.SE_COUNTDOWN2].play();
		}, this);
		
		StzSoundList[ESoundName.SE_COUNTDOWN2].onStop.add(function(){
			if(this.timeCount <= 0){
				return;
			}
			StzSoundList[ESoundName.SE_COUNTDOWN1].play();
		}, this);
	}
	
	if(this.timeCount <= StzGameConfig.GAME_WARNING2_TIME && this.scene.fTimer_start.frameName ===  "yellow_end.png"){
		//타이머 색깔 빨간색
		this.scene.fTimer_start.frameName = "red_end.png";
		this.scene.fTimeGageBody.frameName = "middle_bar_red.png";
		this.scene.fTimerEnd.frameName = "red_start.png";
	}
	
	this.timeCount = this.timeCount - (Phaser.Timer.SECOND / 10);

	
	if (this.timeCount <= 0) {
		this.timeCount = 0;
	}
	this.scene.fTimeGageBody.scale.x =  (StzGameConfig.GAUGE_TIMER_BODY_INITIAL_SCALE / StzGameConfig.GAME_LIMIT_TIME * this.timeCount);
	this.scene.fTimerEnd.x = this.scene.fTimeGageBody.x + this.scene.fTimeGageBody.width - 1;
};


InGame.prototype.moveSpriteByQuadraticBezierCurve = function(inSprite, inFromPoint, inCentralPoint, inToPoint, operateTime, inCallback, inContext) {
	if(operateTime === undefined){
		operateTime = 500;
	}
	inSprite.anchor.set(0.5, 0.5);
	var bezierTween = game.add.tween(inSprite).to({
		x: [inFromPoint.x, inCentralPoint.x, inCentralPoint.x, inToPoint.x],
		y: [inFromPoint.y, inCentralPoint.y, inCentralPoint.y, inToPoint.y],
	}, operateTime,Phaser.Easing.Quadratic.InOut, true, 0).interpolation(function(v, k){
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

InGame.prototype.createComboText = function() {
	//콤보제거테스트
	//return;
	if (window.isComboShow === false) {
		return;
	}

	if (this.txtCombo) {
		this.txtCombo.setText('C' + (this.scoreData.getCombo() + 1));
		this.txtCombo.visible = true;
	} else {
		this.txtCombo = this.game.add.bitmapText(this.game.world.centerX, 270, 'comboAndScoreBitmapText', 'C' + (this.scoreData.getCombo() + 1), 55);
		this.txtCombo.anchor.setTo(0.5, 1.0);	
	}

	var comboShowTimer = this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function() {
		if (this.txtCombo) {
			this.txtCombo.visible = false;
		}
	}, this);
};

InGame.prototype.createScoreText = function(x, y, count, scoreType) {
	
	if (window.isScoreShow === false) {
		return;
	}
	
	var machedBlocksLength = count;
	var currentCombo = this.scoreData.getCombo();
	var bitmapFont = null;
	var fontSize = 0;
	
	if(this.controller.getPivotFlag() === true){
		bitmapFont = 'feverScoreBitmapText';
		fontSize = 45;
	}
	else{
		bitmapFont = 'comboAndScoreBitmapText';
		fontSize = 35;
	}

	var txtScore = StzObjectPool.loadView('BITMAPTEXT', bitmapFont, this, x, y, bitmapFont, Score.calculateScore(count,(currentCombo+1), scoreType), fontSize);
	txtScore.anchor.setTo(0.5, 1.4);
	
	var scoreShowTimer = null;
	    scoreShowTimer = this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function(inParam) {
		if (txtScore !== undefined && txtScore !== null) {
			this.game.time.events.remove(inParam[0]);
			//txtScore.kill();
			StzObjectPool.unloadView(inParam[1], inParam[2]);
		}
	}, this, [scoreShowTimer, bitmapFont, txtScore]);
};

InGame.prototype.showWaitingFriends = function() {
	
	this.ingameWaiting = this.game.add.sprite(this.game.width / 2, this.game.height / 4, 'waiting');
	this.ingameWaiting.anchor.setTo(0.5, 0.5);
	this.ingameWaitingTween = this.game.add.tween(this.ingameWaiting.scale).to({'x': 1.5, 'y': 1.5}, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);
};

InGame.prototype.shutdown = function() {
	// remove Tweens
	this.game.tweens.removeAll();
	
	// remove Timers
	this.game.time.removeAll();
	
	if (this.feverAnim) {
		// remove animations
		this.feverAnim.animations.destroy();
		// remove Sprites
		this.feverAnim.kill();
		this.feverAnim = null;	
	}
	
	if (this.txtStateImage) {
		this.txtStateImage.kill();
		this.txtStateImage = null;	
	}
	
	if (this.ingameWaiting) {
		this.ingameWaiting.kill();
		this.ingameWaiting = null;
	}
	
	if (this.txtCombo) {
		this.txtCombo.kill();
		this.txtCombo = null;
	}
};
