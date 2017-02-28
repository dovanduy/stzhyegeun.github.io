window.onRequireLoad = function() {
	
    var preload = function() {
    	game.load.pack("boot", "assets/assets-pack.json");
	};
	
	var create = function() {
		game.state.add("Boot", Boot);
		
		StzCommon.StzLog.assert(StzGameConfig.PEER_API_KEY !== undefined, "[index.html] StzGameConfig not loaded");
	    
		window.stz_peer = new Peer({host: StzServerConfig.BASE_URL, path:'/api', port: 80, debug: 3});
		
		/*
	    window.stz_peer = new Peer({
	    	// Set API Key for cloud server
	    	key: StzGameConfig.PEER_API_KEY, 
	    	// Set highest debug level (log everything)
	    	debug: 3, 
	    	// Set a logging function
	    	logFunction: function() {}
	    });
	    */
	    
	    window.is_peer_expired = function(inRawTime) {
	    	var dataTime = (new Date(inRawTime)).getTime();
			var timeDeltaFromNow = (new Date().getTime()) - dataTime; 
			
			if (timeDeltaFromNow > StzServerConfig.EXPIRE_SECONDS * 100) {
				return true;
			}
			return false;
	    }
	    
	    window.stz_peer.on('open', function(id) {
	    	// Peer Cloud Server와 연결 완료.
	    	StzCommon.StzLog.print("[Peer] id: " + id);
	    	window.stz_peerId = id;
	    	
			// 서버에 이미 있는 peerid 인지 확인해본다.
	    	$.get(StzServerConfig.getRetrievePeerIdUrl(window.stz_peerId), function(data, status) {
	    		StzCommon.StzLog.print("[" + StzServerConfig.GET_PEERID_URL + "] peerid= " + window.stz_peerId + " / data= " + data);
	    		if (data.hasOwnProperty('rowCount') && data.hasOwnProperty('rows')) {
	    			if (data.rowCount < 1) {
	    				$.get(StzServerConfig.getCreatePeerIdUrl(window.stz_peerId), function(data, status) {
	    					StzCommon.StzLog.print("[" + StzServerConfig.CREATE_PEERID_URL + "] peerid= " + window.stz_peerId + " / data= " + data);
		    				game.state.start("Boot");
		    			});		
	    			} else {
	    				if (window.is_peer_expired(data.rows[0].updated)) {
	    					// updted가 expire되었다면 status를 0으로 update한다.
	    					$.get(StzServerConfig.getUpdateUrl(window.stz_peerId, EConnectStatus.LOGIN), function(data, status) {
	    						StzCommon.StzLog.print("[" + StzServerConfig.UPDATE_PEERID_URL + "] peerid= " + window.stz_peerId + " / data= " + data);
	    						game.state.start("Boot");
	    					});
	    				} else {
	    					StzCommon.StzLog.assert(false, "[Main] Error Server init. Code = 2");
	    				}
	    			}
	    		} else {
	    			// 오류 발생
	    			StzCommon.StzLog.assert(false, "[Main] Error SErver init. Code = 1");
	    		}
	    	});
	    });
	};
    
    var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.AUTO, '', {
		preload: preload, 
		create: create
	});
};
