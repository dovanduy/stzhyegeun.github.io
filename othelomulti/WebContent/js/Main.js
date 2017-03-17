var startOthelloMulti = function()
{
	if (IS_FB_INSTANT === true) {
		FBInstant.setLoadingProgress(10);	
	}
	
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var height = window.innerHeight || document.docuemntElement.clientHeight || document.body.clientHeight;
	var ratio = height / width;
	var sc = 1;
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		if (ratio > 1.6) {
			ratio = 1.6;
		}
	} else {
		ratio = 1.5;
	}

	console.log('[Main] width: ' + width + ', height: ' + height + ', scale: ' + sc + ', ratio: ' + ratio);
	console.log('[Main] actual width: ' + (640 * sc) + ', height: ' + Math.floor(640 * sc * ratio));

	if (IS_FB_INSTANT === true) {
		FBInstant.setLoadingProgress(20);	
	}
	
	this.game = new Phaser.Game(640 * sc, Math.floor(640 * sc * ratio), Phaser.AUTO, 'gameContainer', null, false, false);

	this.game.preserveDrawingBuffer = true;
	this.game.state.add("Boot", Boot);
	this.game.state.add("Preload", Preload);
	this.game.state.add("Lobby", Lobby);
	this.game.state.add("InGame", InGame);
	
	this.game.state.start("Boot");    
};