var ESocketState = {
	CONNECTED: 1, 
	LOGIN: 2,
	JOIN_LOBBY: 3, 
	GET_ROOM_LIST: 4,
	CREATE_ROOM: 5, 
	JOIN_ROOM: 6, 
	ROOM_READY: 7,
	WAITING: 8,
	MAX: 9
};


var socket = io.connect('ws://html5.stzapp.net:11000', {
	transports: ['websocket'], 
	path: '/rt',
	upgrade: false
});
socket.realWillState = ESocketState.LOGIN;
socket._isRealServerWaiting = false;
//현재 참여한 룸 ID
socket._joinedRoomId = null;
socket._waitStartTime = null;
socket._mySessionId = null;

///////////////////
// SOCKET SENDER //
///////////////////

// 레알 서버에 접속
socket.realSendLogin = function(inUserId, inUserName, inThumbnail, inRemain, inDeviceId) {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var type = 'IO:LOGIN';
	var data = {
		'type': type, 
		'user_id': inUserId, 
		'name': inUserName, 
		'thumbnail': inThumbnail,
		'remain': inRemain, 
		'device_id': inDeviceId
	};
	socket.emit(type, data);
	console.log('[realjs] send ' + type);
	socket_isRealServerWaiting = true;
	return false;
	
	// 정상 로그인 시, io:onLogin 이벤트를 받는다.
};

// 로비에 참여
socket.realJoinLobby = function(isBlock) {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var type = "ROOM:JOIN";
	var roomId = 'lobby';
	var data = {
		'type': type, 
		'room_id': roomId
	};
	socket.emit(type, data);
	console.log('[realjs] send ' + type + ' to lobby');
	socket._isRealServerWaiting = (isBlock && true);
	return false;
};

// 특정 방에 참여
socket.realJoinRoom = function(inRoomId) {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var type = 'ROOM:JOIN';
	if( inRoomId.substring(0,3) === 'gr:') {
        var data = {"type":type, "room_id":inRoomId};
        socket.emit(type, data);
        console.log('[realjs] send ' + type);
        socket._isRealServerWaiting = true;
    }
    return false;
};

// 현재 방 목록 조회
socket.realGetRoomList = function() {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var type = 'ROOM:LIST';
	var data = {
		'type': type
	};
	socket.emit(type, data);
	console.log('[realjs] send ' + type);
	socket._isRealServerWaiting = true;
	return false;
};

// 새로운 방 생성
socket.realCreateRoom = function(inRoomId) {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var type = 'ROOM:CREATE';
	var roomId = inRoomId || '0';
	var data = {
		'type': type, 
		'room_id': roomId
	};
	socket.emit(type, data);
	console.log('[realjs] send ' + type);
	socket._isRealServerWaiting = true;
	return false;
};

// 방에서 레디 완료
socket.realRoomReady = function() {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	if (socket._joinedRoomId === null) {
		return false;
	}
	
	var type = 'ROOM:READY';
	var data = {
		'type': type, 
		'room_id': socket._joinedRoomId
	};
	socket.emit(type, data);
	console.log('[realjs] send ' + type);
	socket._isRealServerWaiting = true;
	return false;
};

// 메시지 입력
socket.realSendMessage = function(inMessage, isBlock) {
	
	if (socket._isRealServerWaiting === true) {
		return false;
	}
	
	var message = inMessage.trim();
	if (message) {
		socket.emit('ROOM:MESSAGE', message);
		console.log('[realjs] send ROOM:MESSAGE - message: ' + message);
		socket._isRealServerWaiting = (isBlock && true);
	}
};



/////////////////////
// SOCKET LISTENER //
/////////////////////

// 최초 접속 시
socket.onRealConnect = null;
socket.on('IO:WELCOME', function(data) {
	console.log('[realjs] io:welcome - data: ' + data);
	if (socket.onRealConnect) {
		socket.onRealConnect(data);
	}
	socket._isRealServerWaiting = false;
});


//정상 로그인 완료
// { 'device_id', 'name', 'remain', 's_id', 't', 'thumbnail', 'type', 'user_id'}
socket.onRealSendLogin = null;
socket.on('IO:LOGIN', function(data) {
	console.log('[realjs] io:onLogin - data: ' + data);
	socket._mySessionId = data.s_id;
	if (socket.onRealSendLogin) {
		socket.onRealSendLogin(data);
	}
	socket._isRealServerWaiting = false;
});

// 방 또는 로비에 참여 완료
//{ 'members', 'room_id', 't', 'type', 'user' }
//'members' -> ['player1_s_id', 'player2_s_id']
socket.onRealJoinRoom = null;
socket.onRealJoinLobby = null;
socket.on('ROOM:JOIN', function(data) {
	console.log('[realjs] room:onJoin - data: ' + data);
	socket._joinedRoomId = data.room_id;
	if (data.room_id === 'lobby') {
		if (socket.onRealJoinLobby) {
			socket.onRealJoinLobby(data);
		}
	} else {
		if (socket.onRealJoinRoom) {
			socket.onRealJoinRoom(data);
		}	
	}
	socket._isRealServerWaiting = false;
});

// 방 목록 조회 결과
// { 'joined', 'room_list', 't', 'type'}
socket.onRealGetRoomList = null;
socket.on('ROOM:LIST', function(data) {
	console.log('[realjs] room:onList - data: ' + data);
	if (socket.onRealGetRoomList) {
		var dataList = [];
		for (var index = 0; index < data.room_list.length; index++) {
			if (data.room_list[index].id === 'lobby') {
				continue;
			}
			
			if (data.room_list[index].user_count >= 2) {
				continue;
			}
			dataList.push(data.room_list[index]);
		}
		socket.onRealGetRoomList(data, dataList);
	}
	socket._isRealServerWaiting = false;
});

// 방에서 메시지를 받았을 때
// { 'm', 't', 'n', 'sid', 'room' }
socket.onRealRoomMessasge = null;
socket.on('ROOM:MESSAGE', function(data) {
	console.log('[realjs] room:onMessage - data: ' + data);
	if (socket.onRealRoomMessasge) {
		socket.onRealRoomMessasge(data);
	}
	socket._isRealServerWaiting = false;
});

// 새로운 방 생성 완료
// { 'type', 'room_id', 'ok', 't' }
socket.onRealCreateRoom = null;
socket.on('ROOM:CREATE', function(data) {
	console.log('[realjs] room:onCreate - data: ' + data);
	socket._joinedRoomId = data.room_id;
	if (socket.onRealCreateRoom) {
		socket.onRealCreateRoom(data);
	}
	socket._isRealServerWaiting = false;
});

// 방에서 레디 결과
// { 'ok', 't', 'type' }
socket.onRealRoomReady = null;
socket.on('ROOM:READY', function(data) {
	console.log('[realjs] room:onReady - data: ' + data);
	if (socket.onRealRoomReady) {
		socket.onRealRoomReady(data);
	}
	socket._isRealServerWaiting = false;
});


