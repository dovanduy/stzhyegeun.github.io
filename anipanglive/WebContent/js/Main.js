if(window.location.href.indexOf("instant-bundle") == -1 && window.location.href.indexOf("https://localhost") == -1) {
    window.FBInstant = null;
}

if (StzRealJSConfig.SERVER_ENABLE === false) {
	window.realjs = null;	
}


window.MeInfo = {
	'real_id': '0',
	'name': 'Me',
	'id': '0', 
	'thumbnail': "https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p320x320/12096103_10204089815400231_2121453525092547468_n.jpg?oh=e4e97914489731d4e6546b9cdc472f79&oe=59602C0B"
};

var ERivalState = {
	GAME: "GAME",
	DISCONNECT: "DISCONNECT"
};

window.RivalInfo = {
	'real_id': '0',
	'name': 'Rival',
	'id': '1',
	'thumbnail': "https://scontent-hkg3-1.xx.fbcdn.net/v/t1.0-1/p320x320/12096103_10204089815400231_2121453525092547468_n.jpg?oh=e4e97914489731d4e6546b9cdc472f79&oe=59602C0B", 
	'state': ERivalState.GAME
};

window.isComboShow = true;
window.isScoreShow = true;
window.isScoreFly = true;

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

    /*
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
    */
	//this.game = new Phaser.Game(gameWidth , gameHeight, Phaser.WEBGL, 'gameContainer');
    this.game = new Phaser.Game(720 , 1280, Phaser.WEBGL, 'gameContainer');
    
    
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