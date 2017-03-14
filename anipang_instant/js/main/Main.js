window.START_ANIPANG = function()
{
	// Create your Phaser game and inject it into an auto-created canvas.
	// We did it in a window.onload event, but you can do it anywhere (requireJS
	// load, anonymous function, jQuery dom ready, - whatever floats your boat)
	FBInstant.setLoadingProgress(10);
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var height = window.innerHeight || document.docuemntElement.clientHeight || document.body.clientHeight;
	var ratio = height / width;
	var sc = 1;
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		if (ratio > 1.6) {
			ratio = 1.6;
		}
	} else {
		ratio = 1.67;
	}

	console.log('[Main] width: ' + width + ', height: ' + height + ', scale: ' + sc + ', ratio: ' + ratio);
	console.log('[Main] actual width: ' + (480 * sc) + ', height: ' + Math.floor(480 * sc * ratio));

	FBInstant.setLoadingProgress(20);
	this.game = new Phaser.Game(480 * sc, Math.floor(480 * sc * ratio), Phaser.AUTO, 'gameContainer', null, false, false);

	this.game.preserveDrawingBuffer = true;
	this.game.state.add("Boot", Boot);
	this.game.state.add("Preload", Preload);
	this.game.state.add("Menu", Menu);
	this.game.state.add("PopupResult", PopupResult);
	this.game.state.add("Start", Start);
	
	// Now start the Boot state.
	this.game.state.start("Boot");    
};