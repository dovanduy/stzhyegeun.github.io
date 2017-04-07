var REALJS_DEBUG = true;

( function(global, factory) {

	"use strict";

	function require(inScript, inCallback) {
		if (global.$ && typeof global.$.getscript === "function") {
			$.getscript(inScript, function() {
				if (inCallback) {
					inCallback();
				}
			});
		} else {
			$.ajax({
				url: inScript, 
				dataType: 'script', 
				async: false, 
				success: function() {
					if (inCallback) {
						inCallback();
					}
				}, 
				error: function() {
					throw new Error("Could not load script: " + inScript);
				}
			});
		}
	}

	if (typeof module === "object" && typeof module.exports === "object") {

		module.exports = global.document ? factory( global, true) : function(w) {
			if (!w.document) {
				throw new Error("realjs requires a window with a document");
			}
			return factory(w);
		};
	} else {
		require('lib/socket.io.js', function() {
			factory(global);
		});
	}

})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
	"use strict";

	var RealJSEvent = function() {

		var RealEventListener = function() {
			this._list = [];
			
			this.add = function(inListener, inContext) {
				var targetListener = inContext ? inListener.bind(inContext) : inListener;
				var indexValue = this._list.indexOf(targetListener);
				if (indexValue >= 0) {
					return;
				}
				this._list.push(targetListener);
			};
			this.remove = function(inListener, inContext) {
				var targetListener = inContext ? inListener.bind(inContext) : inListener;
				var indexValue = this._list.indexOf(targetListener);
				if (indexValue < 0) {
					return;
				}
				this._list.splice(indexValue, 1);
			};
			this.removeAll = function() {
				this._list.splice(0, this._list.length);
			};
		};

		this.connectListener = new RealEventListener();
		this.loginListener = new RealEventListener();
		this.joinLobbyListener = new RealEventListener();
		this.getRoomListListener = new RealEventListener();
		this.createRoomListener = new RealEventListener();
		this.leaveRoomListener = new RealEventListener();
		this.joinRoomListener = new RealEventListener();
		this.roomReadyListener = new RealEventListener();
		this.messageListener = new RealEventListener();		
		this.roomStartListener = new RealEventListener();
	};

	var RealJS = function() {

		var _isServerWaiting = false;
		this.getIsServerWaiting = function() {
			return _isServerWaiting;
		};

		var _joinedRoomId = null;
		this.getJoinedRoomId = function() {
			return _joinedRoomId;
		};
		
		var _waitStartTime = null;
		this.getWaitStartTime = function() {
			return _waitStartTime;
		};

		var _mySessionId = null;
		this.getMySessionId = function() {
			return _mySessionId;
		};

		this.EState = {
			NONE: 0,
			CONNECT: 1,
			INIT: 2, 
			LOGIN: 3, 
			JOIN_LOBBY: 4, 
			GET_ROOM_LIST: 5, 
			CREATE_ROOM: 6, 
			JOIN_ROOM: 7, 
			ROOM_READY: 8, 
			WAITING: 9, 
			MESSAGE: 10, 
			END: 11
		};
		this.realState = this.EState.NONE;		
		
		this.realSocket = null;
		
		this.event = new RealJSEvent();

		// CONNECT - 소켓 연결
		this.realConnect = (function(inUrl, inOption) {
			this.realSocket = io.connect(inUrl, inOption);
			if (REALJS_DEBUG) {
				console.log('[realjs-realConnect] url: ' + inUrl + ', inOptions: ' + inOption);
			}

			/////////////////////
			// SOCKET LISTENER //
			/////////////////////

			// 최초 접속 - CONNECT
			this.realSocket.on("IO:WELCOME", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] IO:WELCOME failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] IO:WELCOME | data: ' + data);
				}

				this.realState = this.EState.CONNECT;
				for (var index = this.event.connectListener._list.length - 1; index >= 0; index--) {
					this.event.connectListener._list[index](data);
				}
			}).bind(this));

			// 로그인 콜백 - LOGIN
			// { 'device_id', 'name', 'remain', 's_id', 't', 'thumbnail', 'type', 'user_id'}
			this.realSocket.on("IO:LOGIN", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] IO:LOGIN failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] IO:LOGIN | s_id: ' + data.s_id + ', t: ' + data.t);
				}
				this.realState = this.EState.LOGIN;
				_mySessionId = data.s_id;
				for (var index = this.event.loginListener._list.length - 1; index >= 0; index--) {
					this.event.loginListener._list[index](data);
				}
			}).bind(this));

			// 방 또는 로비 참여 완료 - JOIN_LOBBY | JOIN_ROOM
			//{ 'members', 'room_id', 't', 'type', 'user' }
			//'members' -> ['player1_s_id', 'player2_s_id']
			this.realSocket.on("ROOM:JOIN", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:JOIN failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:JOIN | data.type: ' + data.type + ', roomId: ' + data.room_id + ', memberCount: ' + data.members.length);
				}
				
				if (data.type !== 'ROOM:JOIN') {
					return false;
				}
				
				_joinedRoomId = data.room_id;
				if (data.room_id === 'lobby') {
					this.realState = this.EState.JOIN_LOBBY;
					for (var index = this.event.joinLobbyListener._list.length - 1; index >= 0; index--) {
						this.event.joinLobbyListener._list[index](data);
					}
					
				} else {
					this.realState = this.EState.JOIN_ROOM;
					for (index = this.event.joinRoomListener._list.length - 1; index >= 0; index --) {
						this.event.joinRoomListener._list[index](data);
					}
				}
			}).bind(this));

			// 방 목록 조회 - GET_ROOM_LIST
			// { 'joined', 'room_list', 't', 'type'}
			this.realSocket.on("ROOM:LIST", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:LIST failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:LIST | roomCount: ' + data.room_list.length);
				}
				this.realState = this.EState.GET_ROOM_LIST;
				for (var index = this.event.getRoomListListener._list.length - 1; index >= 0; index--) {
					this.event.getRoomListListener._list[index](data);
				}
			}).bind(this));

			// 게임 스타트 - ROOM_START
			this.realSocket.on("ROOM:START", (function(data){
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:START failed!!');
				}
				
				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:START | room_id: ');
				}
				for (var index = this.event.roomStartListener._list.length - 1; index >= 0; index--) {
					this.event.roomStartListener._list[index](data);
				}
			}).bind(this));
			
			
			// 메시지 수신 - MESSAGE
			// { 'm', 't', 'n', 'sid', 'room' }
			this.realSocket.on("ROOM:MESSAGE", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:MESSAGE failed!!');
				}
				
				if (data.room != this.getJoinedRoomId()) {
					return;
				}
				
				// 내가 보낸 메시지라면 차단
				if (data.sid === this.getMySessionId()) {
					return;
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:MESSAGE | room: ' + data.room + ', t: ' + data.t);
				}
				this.realState = this.EState.MESSAGE;
				for (var index = this.event.messageListener._list.length - 1; index >= 0; index--) {
					this.event.messageListener._list[index](data);
				}
			}).bind(this));

			// 방 떠남 - LEAVE_ROOM
			this.realSocket.on("ROOM:LEAVE", (function(data) {
				if (!data) {
					throw new Error('[realjs-on] ROOM:LEAVE failed!!');
				}
				
				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:LEAVE');
				}
				for (var index = this.event.leaveRoomListener._list.length - 1; index >= 0; index--) {
					this.event.leaveRoomListener._list[index](data);
				}
			}).bind(this));
			
			// 방 생성 - CREATE_ROOM
			// { 'type', 'room_id', 'ok', 't' }
			this.realSocket.on("ROOM:CREATE", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:CREATE failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:CREATE | roomId: ' + data.room_id + ', ok: ' + data.ok);
				}
				this.realState = this.EState.CREATE_ROOM;
				for (var index = this.event.createRoomListener._list.length - 1; index >= 0; index--) {
					this.event.createRoomListener._list[index](data);
				}
			}).bind(this));

			// 레디 - ROOM_READY
			// { 'ok', 't', 'type' }
			this.realSocket.on("ROOM:READY", (function(data) {
				_isServerWaiting = false;
				if (!data) {
					throw new Error('[realjs-on] ROOM:READY failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] ROOM:READY | ok: ' + data.ok);
				}
				this.realState = this.EState.ROOM_READY;
				for (var index = this.event.roomReadyListener._list.length - 1; index >= 0; index--) {
					this.event.roomReadyListener._list[index](data);
				}
			}).bind(this));

		}).bind(this);


		///////////////////
		// SOCKET SENDER //
		///////////////////
		this.realGetUserInfo = function(inRealId, inCallback, inContext) {
			if (typeof window.$ === 'undefined') {
				this.realState = EState.NONE;
				return false;
			}
			
			var reqUrl = "https://html5.stzapp.net:11001/api/user/info?user_ids=";
			if (typeof inRealId === 'object') {
				for (var index = 0; index < inRealId.length; index++) {
					reqUrl = reqUrl + (index === 0 ? inRealId[index] : ',' + inRealId[index]);
				}
			} else {
				reqUrl = reqUrl + inRealId;
			}
			$.get(reqUrl, function(res) {
				if (!res) {
					throw new Error('[realjs-on] GET user info failed!!');
				}
				
				if (typeof inCallback !== 'undefined' && inCallback != null) {
					if (typeof inContext !== 'undefined' && inContext != null) {
						inCallback.call(inContext, res);
					} else {
						inCallback(res);	
					}
				}
			});
		};
		
		this.realInitUser = (function(inUserId, inUserName, inThumbnail, inCallback, inContext) {
			
			if (typeof window.$ === 'undefined') {
				this.realState = EState.NONE;
				return false;
			}
			
			if (_isServerWaiting === true) {
				return false;
			}
			
			var reqUrl = "https://html5.stzapp.net:11001/api/init?platform_id=" + inUserId;
			
			if (typeof inUserName !== "undefined") {
				reqUrl = reqUrl + "&name=" + inUserName;
			}
			
			if (typeof inThumbnail !== "undefined") {
				reqUrl = reqUrl + "&thumbnail=" + encodeURIComponent(inThumbnail);
			}
			
			$.get(reqUrl, (function(res) {
				
				if (!res) {
					throw new Error('[realjs-on] INIT failed!!');
				}

				if (REALJS_DEBUG) {
					console.log('[realjs-on] INIT | id: ' + res.id);
				}
				this.realState = this.EState.INIT;
				
				if (typeof inCallback !== 'undefined' && inCallback != null) {
					if (typeof inContext !== 'undefined' && inContext != null) {
						inCallback.call(inContext, res.id);
					} else {
						inCallback(res.id);	
					}
				}
			}).bind(this));
			
			if (REALJS_DEBUG) {
				console.log('[realjs-realLogin] userId: ' + inUserId + ', userName: ' + inUserName + ', \nthumbnail: ' + inThumbnail);
			}
			return true;
		}).bind(this);
		
		// LOGIN - 로그인
		this.realLogin = (function(inUserId, inUserName, inThumbnail) {
			
			this.realInitUser(inUserId, inUserName, inThumbnail, function(inInitId) {
				if (this.realSocket === null) {
					this.realState = NONE;
					return false;
				}

				if (_isServerWaiting === true) {
					return false;
				}

				var type = "IO:LOGIN";
				var data = {
					"type": type, 
					"user_id": inInitId, 
				};
				this.realSocket.emit(type, data);
				_isServerWaiting = true;
				if (REALJS_DEBUG) {
					console.log('[realjs-realLogin] userId: ' + inUserId + ', userName: ' + inUserName + ', \nthumbnail: ' + inThumbnail);
				}
				return true;
			}, this);
		}).bind(this);

		// 로비 입장 - JOIN_LOBBY
		this.realJoinLobby = (function(isBlock) {
			if (isBlock && _isServerWaiting === true) {
				return false;
			}

			var type = "ROOM:JOIN";
			var roomId = "lobby";
			var data = {
				"type": type, 
				"room_id": roomId
			};
			this.realSocket.emit(type, data);
			_isServerWaiting = (isBlock && true);
			if (REALJS_DEBUG) {
				console.log('[realjs-realJoinLobby] isBlock: ' + isBlock);
			}
			return true;
		}).bind(this);

		// 방에서 게임 시작 - ROOM_START
		this.realRoomStart = (function() {
			if (_isServerWaiting === true) {
				return false;
			}
			
			var type="ROOM:START";
			var joinedRoomId = this.getJoinedRoomId();
			
			if (joinedRoomId.substring(0, 3) === "gr:") {
				var data = {
					'type': type, 
					'room_id': joinedRoomId
				};
				this.realSocket.emit(type, data);
				_isServerWaiting = true;
				if (REALJS_DEBUG) {
					console.log('[realjs-realRoomStart] roomId: ' + joinedRoomId);
				}
				return true;
			}
			return false;
		}).bind(this);
		
		// 특정 방 입장 - JOIN_ROOM
		this.realJoinRoomById = (function(inRoomId) {
			if (_isServerWaiting === true) {
				return false;
			}
			var type = "ROOM:JOIN";
			if (inRoomId.substring(0, 3) === "gr:") {
				var data = {
					"type": type, 
					"room_id": inRoomId
				};
				this.realSocket.emit(type, data);
				_isServerWaiting = true;
				if (REALJS_DEBUG) {
					console.log('[realjs-realJoinRoomById] roomId: ' + inRoomId);
				}
				return true;
			} 
			return false;
		}).bind(this);

		// 방 목록 조회 - GET_ROOM_LIST
		this.realGetRoomList = (function() {
			if (_isServerWaiting === true) {
				return false;
			}

			var type = "ROOM:LIST";
			var data = {"type": type};
			this.realSocket.emit(type, data);
			_isServerWaiting = true;
			if (REALJS_DEBUG) {
				console.log('[realjs-realGetRoomList]');
			}
			return true;
		}).bind(this);

		// 방 생성 - CREATE_ROOM
		this.realCreateRoom = (function(inRoomId) {
			if (_isServerWaiting === true) {
				return false;
			}

			var type = "ROOM:CREATE";
			var roomId = inRoomId || "0";
			var data = {
				"type": type, 
				"room_id": roomId
			};
			this.realSocket.emit(type, data);
			_isServerWaiting = true;
			if (REALJS_DEBUG) {
				console.log('[realjs-realCreateRoom] roomId: ' + roomId);
			}
			return true;
		}).bind(this);

		// 방에서 레디 - READY_ROOM
		this.realRoomReady = (function() {
			if (_isServerWaiting === true) {
				return false;
			}

			if (_joinedRoomId === null) {
				return false;
			}			

			var type = "ROOM:READY";
			var data = {
				"type": type, 
				"room_id": _joinedRoomId
			};
			this.realSocket.emit(type, data);
			_isServerWaiting = true;
			if (REALJS_DEBUG) {
				console.log('[realjs-realRoomReady]');
			}
			return true;
		}).bind(this);


		// 메시지 전송 - MESSAGE
		this.realSendMessage = (function(inMessage, inBlock) {
			if (inBlock && _isServerWaiting === true) {
				return false;
			}

			// 로비에서는 메시지를 보내지 않도록 제거
			if (this.getJoinedRoomId() === "lobby") {
				return false;
			}
			
			var message = inMessage.trim();
			if (message) {
				this.realSocket.emit("ROOM:MESSAGE", message);
				_isServerWaiting = (inBlock && true);
				
				if (REALJS_DEBUG) {
					console.log('[realjs-realSendMessage] message: ' + message + ', isBlock: ' + inBlock);
				}
				return true;
			}
			return false;
		}).bind(this);
	};
	var realjs = new RealJS();

	if (!noGlobal) {
		window.realjs = realjs;
	}
});