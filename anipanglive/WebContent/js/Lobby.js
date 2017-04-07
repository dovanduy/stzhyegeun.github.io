function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.waitingTimer = this.game.time.create(false);
	this.waitingTime = 0;
	this.isBot = true;
	this.isHost = false;
};

Lobby.prototype.preload = function() {
	this.game.load.crossOrigin = 'Anonymous';
	if (window.MeInfo.thumbnail.indexOf("http") >= 0) {
		this.game.load.image('meProfileImage', window.MeInfo.thumbnail);	
	}
};

Lobby.prototype.create = function() {
	
	this.scene = new LobbyScene(this.game);
	
	if (window.realjs) {
		// ROOM:START - 리스너 등록
		realjs.event.roomStartListener.add(function(data){
			this.isBot = false;
			this.startInGameState();
		}, this);	
	}

	
	// 개발모드 - 봇 모드 실행
	this.scene.fCommon_vs.events.onInputUp.add(function() {
		this.loadRivalInfo(function() {
			this.isBot = true;
			this.startInGameState();	
		}, this);
	}, this);
	
	this.waitingFriends();
};

Lobby.prototype.waitingFriends = function() {
	
	this.waitingTimer.loop(1000, function(){
		this.waitingTime = this.waitingTime + 1;
		this.scene.setWaitingDots(this.waitingTime);
	}, this);
	
	this.waitingTimer.start();
	
	if (window.realjs) {
		realjs.event.getRoomListListener.add(function(data) {
			for (var index = data.waiting.length - 1; index >= 0; index--) {
				
				var currentWaitingRoom = data.waiting[index];
				if (currentWaitingRoom === 'lobby') {
					continue;
				}
				
				for (var indexRoom = data.room_list.length - 1; indexRoom >= 0; indexRoom--) {
					var currentRoom = data.room_list[indexRoom];
					if (currentRoom.id === currentWaitingRoom) {
						if (currentRoom.user_count < 2) {
							this.isHost = false;
							realjs.realJoinRoomById(currentWaitingRoom);
							return false;
						} 
						break;
					} 
				}
			}
			this.isHost = true;
			realjs.realCreateRoom();
		}, this);
		
		realjs.event.joinRoomListener.add(function(data) {
			
			if (data.room_id === 'lobby') {
				return;
			}
			
			var memberIds = Object.keys(data.members);
			if (memberIds.length === 2) {
				
				var rivalIndex = 0;
				if (memberIds[0] == window.MeInfo.real_id) {
					rivalIndex = 1;
				} 
				
				realjs.realGetUserInfo(memberIds[rivalIndex], function(inRivalsData) {
					for(var index = 0; index < inRivalsData.length; index++) {
						var currentData = inRivalsData[index];
						if (currentData.id == memberIds[rivalIndex]) {
							window.RivalInfo.real_id = currentData.id;
							window.RivalInfo.name = currentData.name;
							window.RivalInfo.id = currentData.platform_id;
							window.RivalInfo.thumbnail = decodeURIComponent(currentData.thumbnail);
							break;
						}
					}
					
					this.isBot = false;
					this.loadRivalInfo(function() {
						this.setRivalInfo();
							if (this.isHost) {
								realjs.realRoomStart();
							}
					}, this);
				}, this);
			} 
		}, this);
		realjs.realGetRoomList();
	}
};

/*
Lobby.prototype.cancelWaiting = function() {
	if (window.realjs) {
		realjs.realJoinLobby(false);
	}
	this.waitingTimer.stop();
};
*/

/**
 * 라이벌 정보를 로비 화면에 출력
 */
Lobby.prototype.setRivalInfo = function() {
	
	this.scene.fRivalName.text = window.RivalInfo.name;
	this.scene.fRivalName.visible = true;
	
	if (this.game.cache.checkImageKey('rivalProfileImage') === true) {
		var rivalProfileImage = this.game.add.image(0, 0, 'rivalProfileImage');
		this.scene.fRivalProfileContainer.add(rivalProfileImage);
		var ratio = 160 / rivalProfileImage.width;
		rivalProfileImage.scale.setTo(ratio, ratio);
		rivalProfileImage.anchor.setTo(0.5, 0.5);
	}
};

/**
 * 라이벌의 섬네일 이미지 데이터 로드
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
 * @param isBot 봇으로 플레이 여부 (true / false)
 */
Lobby.prototype.startInGameState = function() {
	if (window.realjs) {
		realjs.event.getRoomListListener.removeAll();
		realjs.event.joinRoomListener.removeAll();
		realjs.event.roomStartListener.removeAll();
	}
	this.waitingTimer.stop();
	
	if (window.realjs) {
		if (this.isBot === true) {
			realjs.realJoinLobby(false);	
		}
	}
	this.game.state.start("InGame", true, false, this.isBot);
};
