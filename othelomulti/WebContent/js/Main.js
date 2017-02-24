window.onRequireLoad = function() {
	
	StzCommon.StzLog.assert(StzGameConfig.PEER_API_KEY !== undefined, "[index.html] StzGameConfig not loaded");
    
    window.stz_peer = new Peer({
    	// Set API Key for cloud server
    	key: StzGameConfig.PEER_API_KEY, 
    	// Set highest debug level (log everything)
    	debug: 3, 
    	// Set a logging function
    	logFunction: function() {}
    });
    
    window.stz_peer.on('open', function(id) {
    	// Peer Cloud Server와 연결 완료.
    	StzCommon.StzLog.print("[Peer] id: " + id);
    	window.stz_peerId = id;
    });
    
    window.stz_peer.on('connection', window.connected);
    
    window.stz_peer.on('error', function(err) {
    	StzCommon.StzLog.print("[Peer] err: " + err);
    });
    
    window.connected = function(c) {
    	// 다른 Peer 클라이언트가 접속해 온 경우
    	StzCommon.StzLog.print("[Peer (connected)] c: " + c);
    };
	
	
	// Create your Phaser game and inject it into an auto-created canvas.
	// We did it in a window.onload event, but you can do it anywhere (requireJS
	// load, anonymous function, jQuery dom ready, - whatever floats your boat)
	var game = new Phaser.Game(480, 800, Phaser.AUTO);

	// Add the States your game has.
	game.state.add("Boot", Boot);
	// game.state.add("Menu", Menu);
	// game.state.add("Preload", Preload);
	// game.state.add("Level", Level);

	// Now start the Boot state.
	game.state.start("Boot");
};
