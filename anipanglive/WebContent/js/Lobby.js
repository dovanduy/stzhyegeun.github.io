function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.isWaiting = false;
	this.waitingTimer = this.game.time.create(false);
	this.remainWaitingTime = 30;
};

Lobby.prototype.preload = function() {
	this.scene = new LobbyScene(this.game);
};

Lobby.prototype.create = function() {
	this.game.stage.backgroundColor = "#ffffff";
	this.scene.fBtn_stage.events.onInputDown.add(this.OnClickGameStart, this);
};

Lobby.prototype.OnClickGameStart = function(sprite, pointer) {
	StzLog.print("[Lobby (OnClickGameStart)]");
	
	if (this.isWaiting == false) {
		this.isWaiting = true;
		this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
		this.waitingTimer.loop(1000, function(){
			if (this.isWaiting == false) {
				return;
			}
			this.remainWaitingTime--;
			this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
			
			if (this.remainWaitingTime <= 20) {
				// 봇모드로 시작
				this.startInGameState(true);
			}
		}, this);
		
		this.waitingTimer.start();
		
		if (window.realjs) {
			realjs.event.getRoomListListener.add(function(data) {
				for (var index = data.room_list.length - 1; index >= 0; index--) {
					if (data.room_list[index].id === 'lobby') {
						continue;
					}
					
					if (data.room_list[index].user_count >= StzRealJSConfig.GAME_MEMBER_PER_ROOM) {
						continue;
					}
					realjs.realJoinRoomById(data.room_list[index].id);
					return false;
				}
				realjs.realCreateRoom();
			}, this);
			
			realjs.event.joinRoomListener.add(function(data) {
				
				if (data.room_id === 'lobby') {
					return;
				}
				
				if (data.members.length === 2) {
					this.startInGameState(false);
				} 
			}, this);
			
			realjs.realGetRoomList();
		} else {
			this.startInGameState(true);
		}
	}
};

Lobby.prototype.startInGameState = function(isBot) {
	if (window.realjs) {
		realjs.event.getRoomListListener.removeAll();
		realjs.event.joinRoomListener.removeAll();
		
		if (isBot) {
			realjs.realJoinLobby(false);
		}
	}
	
	this.waitingTimer.stop();
	this.game.state.start("InGame", false, false, isBot);
};
