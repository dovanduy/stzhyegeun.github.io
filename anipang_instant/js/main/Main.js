var USE_FB_INTEGRATION = true;

var FB_DATA = {
			id : '000000',
			name : 'GUEST',
			profile : null, 
            init: function() {
                this.id = '000000';
                this.name = 'GUEST';
                this.profile = null;    
            }
		};

var USER_DATA = {
	id : '000000',
	topScore : 0, 
    init: function() {
        this.id = '000000';
        this.topScore = 0;    
    }
};

var START_ANIPANG = function()
{
	if (USE_FB_INTEGRATION === true) {
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

	console.log('[Main] width: ' + width + ', height: ' + height + ', scale: ' + sc + ', ratio: ' + ratio);
	console.log('[Main] actual width: ' + (480 * sc) + ', height: ' + Math.floor(480 * sc * ratio));

	if (USE_FB_INTEGRATION === true) {
		FBInstant.setLoadingProgress(20);	
	}
	
	this.game = new Phaser.Game(480 * sc, Math.floor(480 * sc * ratio), Phaser.AUTO, 'gameContainer', null, false, false);

	this.game.preserveDrawingBuffer = true;
	this.game.state.add("Boot", Boot);
	this.game.state.add("Preload", Preload);
	this.game.state.add("PopupResult", PopupResult);
	this.game.state.add("Start", Start);
	
	this.game.state.start("Boot");    
};