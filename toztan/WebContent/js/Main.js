window.onload = function() {
	var game = new Phaser.Game(720 , 1280, Phaser.CANVAS, 'gameContainer');

	// Add the States your game has.
	game.state.add("Boot", Boot);
	game.state.add("Preload", Preload);
	game.state.add("InGame", InGame);
	game.state.add("TestLevel", TestLevel);

	game.state.start("Boot");
};
