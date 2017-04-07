var StzGameConfig = {
    DEBUG_MODE: true
    , GAME_WIDTH: 720
    , GAME_HEIGHT: 1280
    , LOCK_ORIENTATION: "PORTRAIT"     // , LOCK_ORIENTATION: "LANDSCAPE"
    , MATCH_MIN          : 3
    , GAUGE_TIMER_BODY_INITIAL_SCALE	: 1
    , GAME_WARNING_TIME		: 500
	, GAME_LIMIT_TIME		: 6000
	, GAME_LEVEL_UP_TIME	: 4500
	, BOMB_CREAT_COUNT		: 50
	, BOMB_REMOVE_TIME		: 150
	, BASE_PLAYER_PROFILE : 'assets/images/avatar_player.png'
	, USER_LEAVE_CHECK_TIME : 10000
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
    BLOCK_WIDTH : 100,
    BLOCK_HEIGHT : 100,
    BLOCK_Y_OFFSET : 2
};

var InGameInterruptedConfig = {
	IS_ICE: true,
	ICE_TIME: 3,
	ICE_BREAK_RULE: "unbreakable", // "unbreakable", "breakable-each"
};

var ESoundName = {
		BGM_GAME 			: "BGM_Game",
		SE_BLOCK_CLICK 		: "SE_Block_Click",
		SE_BLOCK_MISSMATCH 	: "SE_Block_MissMatch",
		SE_BLOCK_SWITCH		: "SE_Block_Switch",
		SE_COMBO3			: "SE_Combo3",
		SE_COMBO5			: "SE_Combo5",	
		SE_COMBO7			: "SE_Combo7",
		SE_MATCH1			: "SE_Match1",
		SE_MATCH2			: "SE_Match2",
		SE_MATCH3			: "SE_Match3",
		SE_MATCH			: "SE_Match",
		SE_FEVER_LOOP		: "SE_Fever_Loop",
		SE_READY_VOICE		: "SE_Ready_Voice",
		SE_RESULT			: "SE_Result",
		SE_START_VOICE		: "SE_Start_Voice",	
		SE_MATCH_SPECIAL	: "SE_Match_Special"
};

var StzSoundList = {};

var EXP_TABLE = [100,300,600,1000,1500];