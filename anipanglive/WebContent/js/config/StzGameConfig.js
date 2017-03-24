var StzGameConfig = {
    DEBUG_MODE: true
    , GAME_WIDTH: 480
    , GAME_HEIGHT: 800
    , LOCK_ORIENTATION: "PORTRAIT"     // , LOCK_ORIENTATION: "LANDSCAPE"
    , MATCH_MIN          : 3
	, GAME_LIMIT_TIME		: 60
	, BOMB_CREAT_COUNT		: 50
	, BOMB_REMOVE_TIME		: 150
	, BASE_PLAYER_PROFILE : 'assets/images/avatar_player.png'
		
};

var StzRealJSConfig = {
	SERVER_ENABLE: true,
	GAME_MEMBER_PER_ROOM: 2 
};

var EEmoticonNames = {
        ALL     :'emoticon' ,
        FAST    :'emoticonFast.png',
        LAUGH    :'emoticonLaugh.png',
        SORRY    :'emoticonSorry.png',
        GREET    :'emotionGreet.png'
};

var InGameBoardConfig = {
    ROW_COUNT : 7,
    COL_COUNT : 7,
    BLOCK_WIDTH : 68,
    BLOCK_HEIGHT : 68
};



var EXP_TABLE = [100,300,600,1000,1500];