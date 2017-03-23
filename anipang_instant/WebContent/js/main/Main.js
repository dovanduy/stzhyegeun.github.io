if(window.location.href.indexOf("instant-bundle") == -1 && window.location.href.indexOf("https://localhost") == -1) {
	window.FBInstant = null;
}

var START_ANIPANG = function()
{
	if (window.FBInstant) {
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
		ratio = 1.67;
	}

	if (window.FBInstant) {
		FBInstant.setLoadingProgress(20);	
	}
	
	this.game = new Phaser.Game(480 * sc, Math.floor(480 * sc * ratio), Phaser.CANVAS, 'gameContainer', null, false, false);

	this.game.preserveDrawingBuffer = true;
	this.game.state.add("Boot", Boot);
	this.game.state.add("Preload", Preload);
	this.game.state.add("PopupResult", PopupResult);
	this.game.state.add("Start", Start);
	
	this.game.state.start("Boot");    
};