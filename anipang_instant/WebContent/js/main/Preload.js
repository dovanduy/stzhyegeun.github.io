/**
 * Preload state.
 */
function Preload() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Preload.prototype = proto;

Preload.prototype.preload = function() {
	
	if (window.FBInstant) {
        FBInstant.setLoadingProgress(40);    
    }

    game.load.onFileComplete.add(this.fileComplete, this);
    game.load.onLoadComplete.add(this.loadComplete, this);

    game.load.pack("start", "assets/assets-pack.json");
    game.load.spritesheet("GEMS", "assets/start/block/blocks.png", 81, 82);
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

    game.load.start();
};

Preload.prototype.create = function() {};

Preload.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
    var prog = 50 + 20 * (totalLoaded - 1) / totalFiles;
    if (window.FBInstant) {
	   FBInstant.setLoadingProgress(prog);

    }
    //console.log("File Complete (" + cacheKey + ") : " + progress + "% - " + totalLoaded + " / " + totalFiles);
};

Preload.prototype.loadComplete = function () {
	console.log("Load Complete.");
	// 바인딩을 제거하지 않으면 다른 스테이트의 로딩 완료 시, 여기서 또 처리됨.
	game.load.onLoadStart.removeAll();
	game.load.onFileComplete.removeAll();
	game.load.onLoadComplete.removeAll();
	
	// 혹은 game.state.current에서 현재 스테이트명과 동일한지 체크하는 방법도 있다.
	if (window.FBInstant) {
        FBInstant.setLoadingProgress(100);
        FBInstant.startGameAsync().then(function() {
            this.game.state.start("Start");
        });
    } else {
    	socket.onRealSendLogin = function(data) {
    		socket.realJoinLobby(false);
    		socket.realWillState = ESocketState.GET_ROOM_LIST;
    	};
    	socket.realSendLogin('1259705044105125', 'Hyegeun Cho', 'http://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p320x320/12096103_10204089815400231_2121453525092547468_n.jpg?oh=e4e97914489731d4e6546b9cdc472f79&oe=59602C0B', '5000', 'DEVICE-100');
    	//this.game.state.start("Start");
    	
    }
};


var roomList = null;
Preload.prototype.update = function() {
	
	if (socket.realWillState === ESocketState.JOIN_LOBBY) {
		socket.onRealJoinLobby = function(data) {
			socket.realWillState = ESocketState.GET_ROOM_LIST;
		};
		socket.realJoinLobby(false);
	} else if (socket.realWillState === ESocketState.GET_ROOM_LIST) {
		socket.onRealGetRoomList = function(data, dataList) {
			roomList = dataList;
			if (roomList.length <= 0) {
				socket.realWillState = ESocketState.CREATE_ROOM; 
			} else {
				socket.realWillState = ESocketState.JOIN_ROOM;
			}
		};
		socket.realGetRoomList();
	} else if (socket.realWillState === ESocketState.CREATE_ROOM) {
		socket.onRealCreateRoom = function(data) {
			if (data.ok == 'true') {
				socket.realWillState = ESocketState.WAITING;
			} else {
				socket.realWillState = ESocketState.GET_ROOM_LIST;	
			}
		};
		socket.realCreateRoom();
	} else if (socket.realWillState === ESocketState.JOIN_ROOM) {
		
		if (roomList === null || roomList.length <= 0) {
			socket.realWillState = ESocketState.CREATE_ROOM;
			return;
		}
		socket.onRealJoinRoom = function(data) {
			if (data.members.length === 2) {
				socket.realWillState = ESocketState.ROOM_READY;	
			} else if (data.members.length === 1) {
				socket.realWillState = ESocketState.WAITING;
			}
		};
		socket.realJoinRoom(roomList[0].id);
	} else if (socket.realWillState === ESocketState.ROOM_READY) {
		socket.onRealRoomReady = function(data) {
			socket.realWillState = ESocketState.MAX;
		};
		socket.realRoomReady();
	} else if (socket.realWillState === ESocketState.MAX) {
		this.game.state.start("Start");
	}
};
