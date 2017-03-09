window.onRequireLoad = function() {

	var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.AUTO, '', {
		preload: function() {
			game.load.pack('boot', 'assets/assets-pack.json');
		}, 
		create: function() {
			StzCommon.StzLog.assert(StzGameConfig !== undefined, "[index.html] StzGameConfig not loaded");
			game.state.add('Boot', Boot);
			game.state.start('Boot');
		}
	});
};
