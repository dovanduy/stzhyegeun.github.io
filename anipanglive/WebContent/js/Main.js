window.onRequireLoad = function() {

	var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.AUTO);

	// Add the States your game has.
	game.state.add("Boot", Boot);
	game.state.add("Menu", Menu);
	game.state.add("Preload", Preload);
	game.state.add("Level", Level);

	// Now start the Boot state.
	game.state.start("Boot");
};
