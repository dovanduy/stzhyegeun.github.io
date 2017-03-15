window.onRequireLoad = function() {
	
    var preload = function() {
    	game.load.pack("boot", "assets/assets-pack.json");
	};
	
	var create = function() {
		game.state.add("Boot", Boot);
		game.state.start("Boot");
	
	};
    
    var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.AUTO, '', {
		preload: preload, 
		create: create
	});
};
