
var StzGameConfig = {
    DEBUG_MODE: true
    , GAME_WIDTH: 720
    , GAME_HEIGHT: 1280
};

var InGameConfig = {
	SCENE_FADE_IN_SPEED			: 350
	,SCENE_FADE_OUT_SPEED		: 350
	
	,SCORE_LEADER_BOARD				: 'DINORUNZ_LEADERBOARD'
	,CONTEXT_BOARD					: 'DINORUNZ_CONTEXT_LEADERBOARD.'
};

var EAdPlacementId ={
		REWARDED_AD_1		: 	"159326401332940_161292737802973",
		REWARDED_AD_2		: 	"159326401332940_161294304469483",
		REWARDED_AD_3		: 	"159326401332940_160278434571070",
		INTERSTITIAL_AD_1	:	"159326401332940_160274864571427"
	};

var EAdName ={
		REWARD_GET_CHARACTER				:   'reward_get_character',
		REWARD_SKIP							:	"reward_skip",
		REWARD_SLOW							:	"reward_slow",
		INTERSTITIAL_INGAME_RESTART			:	"interstitial_ingame_restart"
	};

var AdConfig = {
		INTERSTITIAL_ID_LIST 	: [EAdPlacementId.INTERSTITIAL_AD_1], 
		REWARDED_ID_LIST		: [EAdPlacementId.REWARDED_AD_1, EAdPlacementId.REWARDED_AD_2, EAdPlacementId.REWARDED_AD_3],
		
		INTERSTITIAL_NAME_LIST 	: [EAdName.INTERSTITIAL_INGAME_RESTART], 
		REWARDED_NAME_LIST		: [EAdName.REWARD_GET_CHARACTER, EAdName.REWARD_SKIP, EAdName.REWARD_SLOW],
		
		INGAME_NAME_LIST		: [EAdName.INTERSTITIAL_INGAME_RESTART],
		OUTGAME_NAME_LIST		: [EAdName.REWARD_GET_CHARACTER]
	};

var ETesterList = {
	2: ["1721617884516793",  
		/*"1152272051538759",*/ 
		/*"1333129043401578",*/ 
		"1530555093623733", 
		"1638139379531321", 
		"1602912663083794", 
		"1678540002164773", 
		"1275498199195608", 
		"1141551975966967", 
		"1403735259744451",
		"102"], 
	0: [/*"1307364432704013",*/ 
	    /*"1383923805039326",*/ 
	    "1559014647453060", 
	    "1413574902089191", 
	    "1897779360239980", 
	    "1904486412900092", 
	    "1789355494422998", 
	    "1442879609083356", 
	    "1284013098375517", 
	    "1281400591987861",
		"102"], 
	1: [/*"1383923805039326",*/ 
	    /*"1700321423364364",*/ //스테이지
	    "1413574902089191",		//우정님
	    "1727237667347792",		//영선
	    "1767288273344780",		//진혁
	    "1612033245525784",		//준식
	    "1508409309234778",		//박우혁
	    "2173931789299335",		//유주민
	    "1454548061327632"]		//우정
};
