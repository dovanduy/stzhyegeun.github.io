if(window.location.href.indexOf("instant-bundle") == -1 && window.location.href.indexOf("https://localhost") == -1) {
    window.FBInstant = null;
}

if (StzRealJSConfig.SERVER_ENABLE === false) {
	window.realjs = null;	
}


window.PlayerInfo = {
	'name': 'Me',
	'id': '0', 
	'thumbnail': 'ani'
};

window.RivalInfo = {
	'name': 'Rival',
	'id': '1',
	'thumbnail': 'blue'
};

var startAnipangMulti = function()
{
	if (window.realjs) {
		realjs.realConnect('wss://html5.stzapp.net:11001', {
			transports: ['websocket'], 
			path: '/rt', 
			upgrade: false
		});
	}
	
    if (window.FBInstant) {
        FBInstant.setLoadingProgress(10);
    }

    // set display ratio
    var documentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var documentHeight = window.innerHeight || document.docuemntElement.clientHeight || document.body.clientHeight;
    var documentRatio = documentHeight / documentWidth;

    var screenScale = 1;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if (documentRatio > 1.6) {
            documentRatio = 1.6;
        }
    } else {
        documentRatio = 1.67;
    }

    var gameWidth = 480 * screenScale;
    var gameHeight = Math.floor(480 * screenScale * documentRatio); 
	this.game = new Phaser.Game(gameWidth , gameHeight, Phaser.WEBGL, 'gameContainer');

    if (window.FBInstant) {
        FBInstant.setLoadingProgress(20);
    }

	//this.game.preserveDrawingBuffer = true;
	this.game.state.add("Boot", Boot);	
	this.game.state.add("Preload", Preload);
	this.game.state.add("Lobby", Lobby);
	this.game.state.add("InGame", InGame);
	this.game.state.add("Result", Result);

	this.game.state.start("Boot");  
};