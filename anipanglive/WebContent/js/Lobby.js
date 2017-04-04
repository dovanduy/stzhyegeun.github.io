function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.isWaiting = false;
	this.waitingTimer = this.game.time.create(false);
	this.remainWaitingTime = 0;
};

Lobby.prototype.preload = function() {
	this.scene = new LobbyScene(this.game);
};

Lobby.prototype.create = function() {
	this.game.stage.backgroundColor = "#ffffff";
	
	// make Play with bot Text
	this.txtPlayWithBot = this.game.add.text(this.game.width / 2, 680, "Play with Ani", {font: '24px debush', fill: '#000000'});
	this.txtPlayWithBot.anchor.set(0.5, 0.5);
	this.txtPlayWithBot.visible = false;
	this.txtPlayWithBot.inputEnabled = true;
	this.txtPlayWithBot.events.onInputUp.add(function() {
		this.startInGameState(true);
	}, this);
	
	
	this.scene.fBtn_stage.events.onInputDown.add(this.OnClickGameStart, this);
	
	this.OnClickGameStart(null, null);
};

Lobby.prototype.cancelWaiting = function() {
	
	if (window.realjs) {
		realjs.realJoinLobby(false);
	}
	
	this.waitingTimer.stop();
	this.isWaiting = false;
	this.scene.fTxt_stage.text = "Start";
};


Lobby.prototype.OnClickGameStart = function(sprite, pointer) {
	StzLog.print("[Lobby (OnClickGameStart)]");
	
	if (this.isWaiting == false) {
		this.isWaiting = true;
		this.scene.fTxt_stage.text = "Waiting";
		
		this.waitingTimer.loop(1000, function(){
			if (this.isWaiting == false) {
				return;
			}
			this.remainWaitingTime++;
			
			switch (this.remainWaitingTime % 4) {
			case 0:
				this.scene.fTxt_stage.text = "Waiting";
				break;
			case 1: 
				this.scene.fTxt_stage.text = "Waiting.";
				break;
			case 2:
				this.scene.fTxt_stage.text = "Waiting..";
				break;
			case 3:
				this.scene.fTxt_stage.text = "Waiting...";
				break;
			}
			
			if (this.remainWaitingTime >= 10) {
				this.txtPlayWithBot.visible = true;
				this.waitingTimer.stop();
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
		} 
	} else {
		this.cancelWaiting();
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
