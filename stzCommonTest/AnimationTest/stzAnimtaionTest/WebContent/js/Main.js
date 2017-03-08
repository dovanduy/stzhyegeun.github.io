window.onRequireLoad = function() {
	changePhaserFunction();
	
	 
	// Create your Phaser game and inject it into an auto-created canvas.
	// We did it in a window.onload event, but you can do it anywhere (requireJS
	// load, anonymous function, jQuery dom ready, - whatever floats your boat)
	var game = new Phaser.Game(1200, 800, Phaser.AUTO);

	game.state.add("Level", Level);

	// Now start the Boot state.
	game.state.start("Level");
};
