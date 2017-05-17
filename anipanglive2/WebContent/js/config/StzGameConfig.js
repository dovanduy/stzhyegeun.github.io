var StzGameConfig = {
    DEBUG_MODE: false
    , GAME_WIDTH: 720
    , GAME_HEIGHT: 1280
    , LOCK_ORIENTATION: "PORTRAIT"     // , LOCK_ORIENTATION: "LANDSCAPE"
    , MATCH_MIN          : 3
    , GAUGE_TIMER_BODY_INITIAL_SCALE	: 1
    , GAME_WARNING1_TIME	: 10000
    , GAME_WARNING2_TIME	: 3000
	, GAME_LIMIT_TIME		: 45000
	, GAME_LEVEL_UP_TIME	: 30000
	, BOMB_REMOVE_TIME		: 150
	, BASE_PLAYER_PROFILE : 'assets/images/avatar_player.png'
	, USER_LEAVE_CHECK_TIME : 10000
	, MATCHED_MAX_COUNT		: 3
	, MAX_PROFILE_COUNT		: 5
	, MAX_LOBBY_WATING_COUNT	: 5
	, ME_BADGE_SCORE_DUMY		: 2397
	, TUTORIAL_MAX_COUNT			: 4
};
StzGameConfig.PROFILE_NAME_TABLE = ['DICAPRIO','JACK','DAVID','ETHAN','JESSICA'];
var StzRealJSConfig = {
	SERVER_ENABLE: true,
	GAME_MEMBER_PER_ROOM: 2
};

var StzWatingState = {
		WAIT_FRIENDS 			: 0,
		KEEP_WAIT_FRIENDS 		: 1,
		SEARCHIG_PLAYERS		: 2
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
    BLOCK_Y_OFFSET : 2,
    
    BOARD_Y_OFFSET 	: 275,
    BOARD_WIDTH 	: 720,
    BOARD_HEIGHT 	: 745
};

var InGameInterruptedConfig = {
	IS_ICE: true,
	ICE_TIME: 5,
	ICE_BREAK_RULE: "unbreakable", // "unbreakable", "breakable-each"
	ICE_MAX_COUNT : 1,
	ICE_CREAT_COUNT		: 15,
	
	//구름 시간은 ms으로
	CLOUD_TIME : 5000,
	CLOUD_MAX_COUNT : 1,
	CLOUD_CREAT_COUNT		: 15
};

var ESoundName = {
		BGM_GAME 			: "BGM_Game",
		SE_BLOCK_CLICK 		: "SE_Block_Click",
		SE_BLOCK_MISSMATCH 	: "SE_Block_MissMatch",
		SE_BLOCK_SWITCH		: "SE_Block_Switch",
		SE_COMBO3			: "SE_Combo3",
		SE_COMBO5			: "SE_Combo5",	
		SE_COMBO7			: "SE_Combo7",
		SE_MATCH1_1			: "SE_Match1_1",
		SE_MATCH1_2			: "SE_Match1_2",
		SE_MATCH2_1			: "SE_Match2_1",
		SE_MATCH2_2			: "SE_Match2_2",
		SE_MATCH3_1			: "SE_Match3_1",
		SE_MATCH3_2			: "SE_Match3_2",
		SE_MATCH			: "SE_Match",
		SE_FEVER_LOOP		: "SE_Fever_Loop",
		SE_READY_VOICE		: "SE_Ready_Voice",
		SE_RESULT			: "SE_Result",
		SE_START_VOICE		: "SE_Start_Voice",	
		SE_MATCH_SPECIAL	: "SE_Match_Special",
		SE_SKILL_FULL		: "SE_Skill_Full",
		SE_ICE_ATTACK		: "SE_Ice_Attack",
		SE_RAIN_ATTACK		: "SE_Rain_Attack",
		SE_SKILL_BUTTON		: "SE_Skill_Button",
		SE_COUNTDOWN1		: "SE_Countdown1",
		SE_COUNTDOWN2		: "SE_Countdown2",
		BGM_FEVER			: "BGM_Fever",
		BGM_MATCHING		: "BGM_Matching",
		SE_MATCHING_RATTLE	: "SE_Matching_Rattle",
		SE_MATCHING_COMPLETE: "SE_Matching_Complete"
};

var StzSoundList = {};

var EXP_TABLE = [100,300,600,1000,1500];