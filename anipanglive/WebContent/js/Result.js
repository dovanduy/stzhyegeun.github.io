function Result() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Result.prototype = proto;

Result.prototype.init = function(inScores) {
	
	this.scores = {
		'me': inScores[0], 
		'rival': inScores[1]
	};
	
	this.isPlayAgain = {
		'me': null,
		'rival': null
	};
	
	if (window.realjs) {
		realjs.event.leaveRoomListener.removeAll();
		realjs.event.leaveRoomListener.add(function(data) {
			if (data.user_id != window.MeInfo.real_id) {
				window.RivalInfo.state = ERivalState.DISCONNECT;
				this.isPlayAgain.rival = false;
				this.scene.fBtnRematch.visible = false;
			}
		}, this);
		
		realjs.event.messageListener.removeAll();
		realjs.event.messageListener.add(function(data) {
			if (data.sid === realjs.getMySessionId()) {
				return;
			}
			
			var rivalData = JSON.parse(data.m);
			this.isPlayAgain.rival = rivalData.isPlayAgain;
			
			if (this.isPlayAgain.me === null) {
				return;
			}
			
			realjs.event.messageListener.removeAll();
			
			if (this.isPlayAgain.me === true && this.isPlayAgain.rival === true) {
				
				this.initData();
				this.game.state.start("InGame");
			} else {
				
				this.initData();
				if (window.realjs) {
					realjs.realJoinLobby(false);	
				}
				
				if (window.FBInstant) {
					FBInstant.endGameAsync().then(function() {
						this.game.state.start("Lobby");
					});
				} else {
					this.game.state.start("Lobby");	
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
	
	this.scene = new ResultScene(this.game);
	
	var rivalProfileImage = null;
	if (this.game.cache.checkImageKey('rivalProfileImage') === true) {
		rivalProfileImage = this.game.add.image(0, 0, 'rivalProfileImage');
	}
	var meProfileImage = null;
	if (this.game.cache.checkImageKey('meProfileImage') === true) {
		meProfileImage = this.game.add.image(0, 0, 'meProfileImage');
	}
	
	
	if (this.scores.me >= this.scores.rival) {
		this.scene.fWinnerName.text = window.MeInfo.name;
		this.scene.fWinnerScore.text = this.scores.me;
		this.scene.fLoserName.text = window.RivalInfo.name;
		this.scene.fLoserScore.text = this.scores.rival;
		
		if (rivalProfileImage) {
			var loserRatio = this.scene.propertyValue.loserProfileSize / rivalProfileImage.width;
			rivalProfileImage.scale.setTo(loserRatio, loserRatio);
			rivalProfileImage.anchor.setTo(0.5, 0.5);
			this.scene.fLoserProfileContainer.add(rivalProfileImage);
		}
		
		if (meProfileImage) {
			var winnerRatio = this.scene.propertyValue.winnerProfileSize / meProfileImage.width;
			meProfileImage.scale.setTo(winnerRatio, winnerRatio);
			meProfileImage.anchor.setTo(0.5, 0.5);
			this.scene.fWinnerProfileContainer.add(meProfileImage);
		}
		
	} else {
		this.scene.fWinnerName.text = window.RivalInfo.name;
		this.scene.fWinnerScore.text = this.scores.rival;
		this.scene.fLoserName.text = window.MeInfo.name;
		this.scene.fLoserScore.text = this.scores.me;
		
		if (rivalProfileImage) {
			var winnerRatio = this.scene.propertyValue.winnerProfileSize / rivalProfileImage.width;
			rivalProfileImage.scale.setTo(winnerRatio, winnerRatio);
			rivalProfileImage.anchor.setTo(0.5, 0.5);
			this.scene.fWinnerProfileContainer.add(rivalProfileImage);
		}
		
		if (meProfileImage) {
			var loserRatio = this.scene.propertyValue.loserProfileSize / meProfileImage.width;
			meProfileImage.scale.setTo(loserRatio, loserRatio);
			meProfileImage.anchor.setTo(0.5, 0.5);
			this.scene.fLoserProfileContainer.add(meProfileImage);
		}
	}
	
	if (window.RivalInfo.state === ERivalState.DISCONNECT) {
		this.scene.fBtnRematch.visible = false;
	}
	this.scene.fBtnRematch.events.onInputUp.add(this.OnClickPlayAgain, this);
	this.scene.fBtnNewGame.events.onInputUp.add(this.OnClickExitToLobby, this);
	
	if (window.FBInstant) {
		FBInstant.setScore(this.scores.me);
		FBInstant.takeScreenshotAsync();
	}
	
	this.game.time.events.add(300, function(){
		StzSoundList[ESoundName.SE_RESULT].play('', 0, 1, false);
	}.bind(this));
};

Result.prototype.initData = function() {
	this.scores.me = 0;
	this.scores.rival = 0;
	this.isPlayAgain.me = null;
	this.isPlayAgain.rival = null;
};

Result.prototype.OnClickExitToLobby = function(item) {
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'isPlayAgain': false}), false);
		realjs.event.messageListener.removeAll();
		realjs.realJoinLobby(false);
	}
	
	this.initData();
	
	if (window.FBInstant) {
		FBInstant.endGameAsync().then(function() {
			this.game.state.start("Lobby");
		});
	} else {
		this.game.state.start("Lobby");	
	}
	
};

Result.prototype.OnClickPlayAgain = function(item) {
	
	this.isPlayAgain.me = true;
	
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'isPlayAgain': true}), false);
	}
	
	
	if (this.isPlayAgain.rival === null) {
		return;
	}

	if (window.realjs) {
		realjs.event.messageListener.removeAll();
	}
	
	if (this.isPlayAgain.me === true && this.isPlayAgain.rival === true) {
		this.initData();
		this.game.state.start("InGame");
	} else {
		this.initData();
		if (window.realjs) {
			realjs.realJoinLobby(false);	
		}
		if (window.FBInsatnt) {
			FBInstant.endGameAsync().then(function() {
				this.game.state.start("Lobby");
			});
		} else {
			this.game.state.start("Lobby");	
		}
	}
};
