function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.waitingTimer = this.game.time.create(false);
	this.tipTextLoop = this.game.time.create(false);
	this.waitingTime = 0;
	this.isBot = true;
	this.isHost = false;
	this.isStart = false;
	this.isTaunt = false;
	window.RivalInfo.state = ERivalState.GAME;

	window.fbContextId = "1234";
};

Lobby.prototype.preload = function() {
	
	if (StzGameConfig.DEBUG_MODE) {
		this.game.add.plugin(Phaser.Plugin.Debug);	
	}
	
// window.saveCPU = new Phaser.Plugin.SaveCPU(game);
// game.add.plugin(window.saveCPU);
	
	this.game.load.crossOrigin = 'Anonymous';
	if (window.MeInfo.thumbnail.indexOf("http") >= 0) {
		this.game.load.image('meProfileImage', window.MeInfo.thumbnail);	
	}
};

Lobby.prototype.create = function() {
	this.scene = new LobbyScene(this.game);
	
	this.popupHelp = this.game.plugins.add(new PopupHelp(this.game, this, {blind:true}));
	this.readyMatched();
};

Lobby.prototype.readyMatched = function() {
	window.currentGameState = this.game.state.current;
	
	// 라이벌 인포 초기화
	window.RivalInfo.real_id = 0;
	window.RivalInfo.name = 'Rival';
	window.RivalInfo.id = 0;
	window.RivalInfo.thumbnail = "https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p320x320/12096103_10204089815400231_2121453525092547468_n.jpg?oh=e4e97914489731d4e6546b9cdc472f79&oe=59602C0B";
	var minBadgeCount = window.MeInfo.badge.getBadgeData().badgeScore - 300;
	if(minBadgeCount < 0){
		minBadgeCount = 0;
	}

	window.RivalInfo.badge =  new Badge(this.game, StzUtil.createRandomInteger(minBadgeCount, window.MeInfo.badge.getBadgeData().badgeScore + 300));
	if (this.game.cache.checkImageKey('rivalProfileImage')) {
		this.game.cache.removeImage('rivalProfileImage');
	}


	if (window.realjs) {
		// ROOM:START - 리스너 등록
		realjs.event.roomStartListener.removeAll();
		realjs.event.roomStartListener.add(function(data){
			if (this.isStart) {
				return;
			}
			this.isStart = true;
			this.isBot = false;
			
			if (data.hasOwnProperty('t')) {
				window.gameStartTime = data.t + (Phaser.Timer.SECOND * 2);
			} else {
				window.gameStartTime = null;
			}
			this.startInGameState();
		}, this);	
		
		realjs.event.leaveRoomListener.removeAll();
		realjs.event.leaveRoomListener.add(function(data) {
			
			if (this.game.state.current !== "Lobby") {
				return;
			}
			
			if (data.room_id === 'lobby') {
				return;
			}
			
			if (data.user_id != window.MeInfo.real_id) {
				window.RivalInfo.state = ERivalState.DISCONNECT;
			}
		}, this);
	}

	if (window.FBInstant) {
		FBInstant.setLoadingProgress(100);
		FBInstant.startGameAsync().then((function() {
			
			//처음 접속 유저 일 경우 도움말 팝업 오픈
			if(window.isFirstUser === true){
				this.popupHelp.popupOpen();
			} 
			window.fbContextId = FBInstant.context.getID();
			StzSoundList[ESoundName.BGM_MATCHING].play('', 0, 1, true);
			StzSoundList[ESoundName.SE_MATCHING_RATTLE].play('', 0, 1, true);
			
			this.scene.startRollingProfile();
			this.waitingFriends();	
		}).bind(this));
	} else {
		StzSoundList[ESoundName.BGM_MATCHING].play('', 0, 1, true);
		StzSoundList[ESoundName.SE_MATCHING_RATTLE].play('', 0, 1, true);
		
		this.scene.startRollingProfile();
		this.waitingFriends();
	}
	
	this.scene.fBtnSkip.inputEnabled = true;
	this.scene.fBtnSkip.events.onInputUp.add(this.onClickSkip, this);
	
	this.scene.fBtnWait.inputEnabled = true;
	this.scene.fBtnWait.events.onInputUp.add(this.onClickWait, this);
	
	this.createTipText();
	
	var tipNum = StzUtil.createRandomInteger(0, this.tipCount-1);
	this.scene.txtTipOneLine.text =  this.textOneLineArray[tipNum];
	this.scene.txtTipTwoLine.text =  this.textTwoLineArray[tipNum];
	this.scene.txtTipOneLine.fontSize = this.textFont[tipNum];
	this.scene.txtTipTwoLine.fontSize = this.textFont[tipNum];

	this.tipTextLoop.start();
	this.tipTextLoop.loop(2500, function(){
		var tipNum = StzUtil.createRandomInteger(0, this.tipCount-1);
		this.scene.txtTipOneLine.text =  this.textOneLineArray[tipNum];
		this.scene.txtTipTwoLine.text =  this.textTwoLineArray[tipNum];
		this.scene.txtTipOneLine.fontSize = this.textFont[tipNum];
		this.scene.txtTipTwoLine.fontSize = this.textFont[tipNum];
	}.bind(this));
	
	this.scene.fBtnHelp.inputEnabled = true;
	this.scene.fBtnHelp.events.onInputUp.add(function(){
		this.popupHelp.popupOpen();
	}, this);
};

Lobby.prototype.createTipText = function(){
	var tipData = this.game.cache.getText('tipText');
	parser=new DOMParser();
	
	var xmlDoc=parser.parseFromString(tipData, "text/xml");
	this.textOneLineArray = [];
	this.textTwoLineArray = [];
	this.textFont = [];
	 // 특정 테그를 기준으로 변수에 담는다
	 var xml = xmlDoc.getElementsByTagName('tipTexts');
	 
	 this.tipCount = (xml[0].getElementsByTagName('tipText')[0].getElementsByTagName('tipCount')[0].childNodes[0].nodeValue);
	 for(var i =0; i < this.tipCount; i++){
		 this.textOneLineArray.push((xml[0].getElementsByTagName('tipText')[0].getElementsByTagName('text' + i + '-0')[0].childNodes[0].nodeValue));
		 this.textTwoLineArray.push((xml[0].getElementsByTagName('tipText')[0].getElementsByTagName('text' + i + '-1')[0].childNodes[0].nodeValue));
		 this.textFont.push((xml[0].getElementsByTagName('tipText')[0].getElementsByTagName('text' + i + '-font')[0].childNodes[0].nodeValue));
	 }
};

Lobby.prototype.waitingFriends = function() {
	var isSearchExpanded = false;
	//로비에 접속
	realjs.realJoinLobby(false, window.fbContextId);
	//현재 사용자가 게임별에서 직접 접속 했을 경우
	if(window.fbContextId === undefined || window.fbContextId === null){
		this.scene.fTxtMatchedState.frameName = "searching.png";
		isSearchExpanded = true;
		this.scene.fBtnWait.visible = false;
		this.scene.fBtnSkip.visible = false;
		
		this.waitingState = StzWatingState.SEARCHIG_PLAYERS;
	}
	//현재 사용자가 대화방에서 접속 하였을 경우
	else{
		this.scene.fTxtMatchedState.frameName = "waiting.png";
		this.waitingState = StzWatingState.WAIT_FRIENDS;
	}
	
	this.waitingTimer.loop(1000, function(){
		//매칭 상태가 KEEP_WAIT_FRIENDS일 경우 계속 친구를 기다림 (skip을 누르기 전까지)
		if(this.waitingState === StzWatingState.KEEP_WAIT_FRIENDS){
			return;
		}
		
		this.waitingTime = this.waitingTime + 1;
		//사용자가 대화방에서 접속 하고 친구 기다리는 5초가 지났을 경우 글로벌 매칭으로 바뀜
		if(this.waitingState === StzWatingState.WAIT_FRIENDS && this.waitingTime === StzGameConfig.MAX_LOBBY_WATING_COUNT){
			this.waitingTime = 0;
			this.scene.fTxtMatchedState.frameName = "searching.png";
			this.waitingState = StzWatingState.SEARCHIG_PLAYERS;
			
			this.scene.fBtnWait.visible = false;
			this.scene.fBtnSkip.visible = false;
		}
		
		this.scene.txtMatchCount.text = StzGameConfig.MAX_LOBBY_WATING_COUNT - this.waitingTime;
	

		if (this.waitingTime >= StzGameConfig.MAX_LOBBY_WATING_COUNT) {
			if (window.realjs) {
				realjs.event.joinRoomListener.removeAll();
				// NOTE @hyegeun 대화방 우선 매칭 비활성화
				realjs.realJoinLobby(false, window.fbContextId);
				// realjs.realJoinLobby(false);
			}
			this.waitingTimer.stop();
			this.isBot = true;
			
			this.loadRivalInfo(function() {
				this.scene.stopRollingProfile();
				this.scene.setRivalInfo();
				this.startInGameState();
			}, this);
			
			
		// NOTE @hyegeun 대화방 우선 매칭 비활성
		} else if (window.fbContextId && isSearchExpanded === false && this.waitingState === StzWatingState.SEARCHIG_PLAYERS) {
			isSearchExpanded = true;
			if (window.realjs) {
				realjs.event.joinLobbyListener.add(function(data) {
					
					if (data.p_id !== window.MeInfo.id) {
						return;
					}
					realjs.event.joinLobbyListener.removeAll();
					realjs.realGetRoomList();	
				});
				realjs.realJoinLobby(true);
			}
		}
	}, this);
	
	this.waitingTimer.start();
	
	if (window.realjs) {
		realjs.event.getRoomListListener.removeAll();
		realjs.event.getRoomListListener.add(function(data) {
			
			var challengeRoomId = null;
			if (window.FBInstant && FBInstant.getSDKVersion().indexOf('3.') >= 0) {
				if(FBInstant.getEntryPointData() === undefined || FBInstant.getEntryPointData() === null){
					challengeRoomId = null;
				}
				else{
					challengeRoomId = FBInstant.getEntryPointData().room_id || null;
				}
			}
			  
			var index = data.waiting.length;
			do {
				if (challengeRoomId && data.waiting.indexOf(challengeRoomId) >= 0) {
					currentWaitingRoom = challengeRoomId;					
				} else {
					if (data.waiting.length <= 0) {
						break;
					}
					currentWaitingRoom = data.waiting[--index];
				}
					
				if (currentWaitingRoom.indexOf('lobby') >= 0) {
					index--;
					continue;
				}
				
				for (var indexRoom = data.room_list.length - 1; indexRoom >= 0; indexRoom--) {
					var currentRoom = data.room_list[indexRoom];
					if (currentRoom.id === currentWaitingRoom) {
						if (currentRoom.user_count < 2) {
							this.isHost = false;
							if(challengeRoomId !== null && currentWaitingRoom === challengeRoomId){
								this.scene.fTxtFriendMatch.visible = true;
								this.scene.txtMatchCount.visible = false;
								this.scene.fBtnWait.visible = false;
								this.scene.fBtnSkip.visible = false;
							}
							realjs.realJoinRoomById(currentWaitingRoom);
							return false;
						} 
						break;
					} 
				}
				
				index--;
			} while(index >= 0);
			this.isHost = true;
			
			if (window.FBInstant && FBInstant.getSDKVersion().indexOf('3.') >= 0) {
				realjs.event.createRoomListener.add(function(data) {
					realjs.event.createRoomListener.removeAll();
					if (this.isTaunt === true) {
						return;
					}
					this.isTaunt = true;
					if (window.FBInstant && FBInstant.getSDKVersion().indexOf('3.') >= 0) {
						var base64Picture = StzUtil.getScreenCapture(this.game, 0, 260, this.game.width, 415);
						var joinedRoomId = realjs.getJoinedRoomId();
						FBInstant.updateAsync({
							action: 'CUSTOM', 
							cta: 'Accept ' + window.MeInfo.name + '\'s Challenge!', 
							image: base64Picture, 
							text: window.MeInfo.name + ' waiting for you!',
							data: {'room_id': joinedRoomId}, 
							strategy: 'IMMEDIATE'
						}).then((function() {
							console.log('FBInstant.updateAsync');
						}).bind(this)).catch(function(err) {
							console.log('FBInstant.updateAsync- err: ' + err);
						});
					}
				}, this);
			}
			
			realjs.realCreateRoom();
		}, this);
		
		realjs.event.joinRoomListener.removeAll();
		realjs.event.joinRoomListener.add(function(data) {
			
			if (data.room_id === 'lobby') {
				return;
			}
			
			var memberIds = Object.keys(data.members);
			if (memberIds.length === 2) {
				
				var rivalIndex = 0;
				if (memberIds[0] == window.MeInfo.id) {
					rivalIndex = 1;
				} 
				
				realjs.realGetUserInfo(memberIds[rivalIndex], function(inRivalsData) {
					for(var index = 0; index < inRivalsData.length; index++) {
						var currentData = inRivalsData[index];
						if (currentData.platform_id == memberIds[rivalIndex]) {
							window.RivalInfo.real_id = currentData.id;
							window.RivalInfo.name = currentData.name;
							window.RivalInfo.id = currentData.platform_id;
							window.RivalInfo.thumbnail = decodeURIComponent(currentData.thumbnail);
							
							if (currentData.hasOwnProperty('trophy')) {
								securityStorage.setInt('rivalTrophy', currentData.trophy);
								window.RivalInfo.badge =  new Badge(this.game, securityStorage.getInt('rivalTrophy'));
							}
							else{
								securityStorage.setInt('rivalTrophy', 0);
								window.RivalInfo.badge =  new Badge(this.game, securityStorage.getInt('rivalTrophy'));
							}
							
							break;
						}
					}
					
					this.isBot = false;
					this.loadRivalInfo(function() {
						this.scene.stopRollingProfile();
						this.scene.setRivalInfo();
							// if (this.isHost) {
							realjs.realRoomStart();
							// }
					}, this);
				}, this);
			} 
		}, this);
		realjs.realGetRoomList();
	}
};

Lobby.prototype.onClickSkip = function() {
	this.waitingTime = 0;
	this.scene.fTxtMatchedState.frameName = "searching.png";
	this.waitingState = StzWatingState.SEARCHIG_PLAYERS;
	this.scene.txtMatchCount.text = StzGameConfig.MAX_LOBBY_WATING_COUNT - this.waitingTime;
	this.scene.txtMatchCount.visible = true;
	
	this.scene.fBtnWait.visible = false;
	this.scene.fBtnSkip.visible = false;
	
	this.scene.fAnimLoading.visible = false;
}

Lobby.prototype.onClickWait = function() {
	this.scene.fTxtMatchedState.frameName = "waiting.png";
	this.waitingState = StzWatingState.KEEP_WAIT_FRIENDS;
	this.scene.txtMatchCount.visible = false;
	
	this.scene.fBtnWait.inputEnabled = false;
	this.scene.fBtnWait.alpha = 0.5;
	
	this.scene.fAnimLoading.visible = true;
	this.scene.fAnimLoading.animations.play('Loading', 5, true);
}

/**
 * 라이벌의 섬네일 이미지 데이터 로드
 * 
 * @param inCallback
 * @param inContext
 */
Lobby.prototype.loadRivalInfo = function(inCallback, inContext) {
	
	this.game.load.onLoadComplete.add(function() {
		this.game.load.onLoadComplete.removeAll();
		
		if (typeof inCallback !== 'undefined' && inCallback != null) {
			if (typeof inContext !== 'undefined' && inContext != null) {
				inCallback.call(inContext);
			} else {
				inCallback();
			}
		}
	}, this);
	
	this.game.load.crossOrigin = 'Anonymous';
	if (window.RivalInfo.thumbnail.indexOf('http') >= 0) {
		this.game.load.image('rivalProfileImage', window.RivalInfo.thumbnail);
		this.game.load.start();
	}
};

/**
 * 인게임 실행
 * 
 * @param isBot
 *            봇으로 플레이 여부 (true / false)
 */
Lobby.prototype.startInGameState = function() {
	if (window.realjs) {
		realjs.event.getRoomListListener.removeAll();
		realjs.event.joinRoomListener.removeAll();
		realjs.event.roomStartListener.removeAll();
	}
	
	this.waitingTimer.stop();
	this.tipTextLoop.stop();
	
	if (window.realjs) {
		if (this.isBot === true) {
			// NOTE @hyegeun 대화방 우선 매칭 비활성
			realjs.realJoinLobby(false, window.fbContextId);	
			// realjs.realJoinLobby(false);
		}
	}
	
	
	if (this.startDelayTimer) {
		this.game.time.events.remove(this.startDelayTimer);
		this.startDelayTimer = null;
	}
	
	this.startDelayTimer = this.game.time.events.add(Phaser.Timer.SECOND*1.5, function() {
		this.game.time.events.remove(this.startDelayTimer);
		this.startDelayTimer = null;
		this.game.state.start("InGame", true, false, this.isBot);
	}, this);
};

Lobby.prototype.shutdown = function() {

	this.waitingTimer = null;
	
	if (this.rivalProfileImage) {
		this.rivalProfileImage.destroy();
		this.rivalProfileImage = null;
	}
	
	// remove Tweens
	this.game.tweens.removeAll();
	
	// remove Timers
	this.game.time.removeAll();
};