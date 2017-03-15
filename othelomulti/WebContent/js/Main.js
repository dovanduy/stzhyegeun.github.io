var startOthelloMulti = function() {
	
    var preload = function() {
	};
	
	var create = function() {
		game.state.add("Boot", Boot);
		game.state.start("Boot");
	};
    
	/*
	var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var windowHeight = window.innerHeight || document.docuemntElement.clientHeight || document.body.clientHeight;
	var ratio = windowHeight / windowWidth;
	var sc = 1;
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		if (ratio > 1.6) {
			ratio = 1.6;
		}
	} else {
		ratio = 1.5;
	}

	console.log('[Main] width: ' + windowWidth + ', height: ' + windowHeight + ', scale: ' + sc + ', ratio: ' + ratio);
	console.log('[Main] actual width: ' + (640 * sc) + ', height: ' + Math.floor(640 * sc * ratio));

    var game = new Phaser.Game(640 * sc, Math.floor(480 * sc * ratio), Phaser.AUTO, 'gameContainer', {
    */
	var game = new Phaser.Game(StzGameConfig.GAME_WIDTH, StzGameConfig.GAME_HEIGHT, Phaser.AUTO, 'gameContainer', {
		preload: preload, 
		create: create
	}, false, false);
};
