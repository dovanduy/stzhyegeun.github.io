
var StzGameConfig = {
    DEBUG_MODE: (StzBuildConfig.SERVER_MODE === EServerMode.DEV)? true : false
    ,COLLIDER_MODE : false
    ,QA_MODE		: (StzBuildConfig.SERVER_MODE === EServerMode.DEV)? true : false
    , GAME_WIDTH: 720
    , GAME_HEIGHT: 1280
};

var InGameConfig = {
	CHARACTER_SPEED			: 100
	,SCENE_FADE_IN_SPEED		: 350
	,SCENE_FADE_OUT_SPEED		: 350
	
	,SCORE_LEADER_BOARD_NOMAL		: 'SCORE_LEADER_BOARD_NOMAL'
	,SCORE_LEADER_BOARD_CONTEXT		: 'SCORE_LEADER_BOARD.'
	,RESTART_COUNT					: 10,
	
	FREE_COIN_TIME					: 10800000,
	FREE_COIN_COIN					: 50
};

var PoolObjectName = {
		CHARACTER 	 	: 'CHARACTER',
		COIN	 		: 'COIN',
		OBSTACLE		: 'OBSTACLE',
		COLLIDER		: 'COLLIDER'
}

var EAdPlacementId ={
		REWARDED_AD_1		: 	"445772845881216_451712285287272",
		REWARDED_AD_2		: 	"445772845881216_451708981954269",
		REWARDED_AD_3		: 	"445772845881216_451711651954002",
		INTERSTITIAL_AD_1	:	"445772845881216_451711931953974"
	};

var EAdName ={
		REWARD_GET_CHARACTER				:   'reward_get_character',
		REWARD_SKIP							:	'reward_skip',
		REWARD_CONTINUE						:	'reward_continue',
		INTERSTITIAL_INGAME_RESTART			:	"interstitial_ingame_restart",
	};

var AdConfig = {
	INTERSTITIAL_ID_LIST 	: [EAdPlacementId.INTERSTITIAL_AD_1], 
	REWARDED_ID_LIST		: [EAdPlacementId.REWARDED_AD_1, EAdPlacementId.REWARDED_AD_2, EAdPlacementId.REWARDED_AD_3],
	
	INTERSTITIAL_NAME_LIST 	: [EAdName.INTERSTITIAL_INGAME_RESTART], 
	REWARDED_NAME_LIST		: [EAdName.REWARD_GET_CHARACTER, EAdName.REWARD_SKIP, EAdName.REWARD_CONTINUE],
	
	INGAME_NAME_LIST		: [EAdName.INTERSTITIAL_INGAME_RESTART, EAdName.REWARD_SKIP, EAdName.REWARD_CONTINUE],
	OUTGAME_NAME_LIST		: [EAdName.REWARD_GET_CHARACTER]
};

var EResultType = {
		'CLEAR' 	: 'C',
		'FAIL'		: 'F',
		'OOPS'		: 'O',
		'GIVE_UP'	: 'G'
};

var EStageColorData = {
		1:{
			backGround 		: 	0x03b2a9,
			backAlpha		: 	0x1d6aa0,
			motionBg		: 	0x7ad6e5,
			bossMain		:	0x061833,
			bossEye			:	0x2177b7,
			obstacle		:	0x061833,
			remainText		:	'#659cb7'
		},
		2:{
			backGround 		: 	0x3f85d1,
			backAlpha		: 	0x601761,
			motionBg		: 	0x7e5be8,
			bossMain		:	0x120633,
			bossEye			:	0x3c23b5,
			obstacle		:	0x120633,
			remainText		:	'#6159be'
		},
		3:{
			backGround 		: 	0x03b2a9,
			backAlpha		: 	0x1d6aa0,
			motionBg		: 	0x7ad6e5,
			bossMain		:	0x061833,
			bossEye			:	0x2177b7,
			obstacle		:	0x061833,
			remainText		:	'#659cb7'
		},
		4:{
			backGround 		: 	0x4c60ae,
			backAlpha		: 	0x382b61,
			motionBg		: 	0x4069ff,
			bossMain		:	0x200635,
			bossEye			:	0x8d20ba,
			obstacle		:	0x200635,
			remainText		:	'#5757aa'
		},
		5:{
			backGround 		: 	0xac5a80,
			backAlpha		: 	0x352254,
			motionBg		: 	0xb96085,
			bossMain		:	0x200635,
			bossEye			:	0x1e4ebc,
			obstacle		:	0x200635,
			remainText		:	'#659cb7'
		},
		6:{
			backGround 		: 	0x006999,
			backAlpha		: 	0xcf6182,
			motionBg		: 	0xff97d3,
			bossMain		:	0x2b0a27,
			bossEye			:	0xc12bb6,
			obstacle		:	0x2b0a27,
			remainText		:	'#753475'
		},
		7:{
			backGround 		: 	0xb4b125,
			backAlpha		: 	0x1e5b4a,
			motionBg		: 	0xc8ff43,
			bossMain		:	0x03160e,
			bossEye			:	0x8d20ba,
			obstacle		:	0x03160e,
			remainText		:	'#52892e'
		},
		8:{
			backGround 		: 	0xe47b55,
			backAlpha		: 	0x470453,
			motionBg		: 	0x9e255c,
			bossMain		:	0x1e0217,
			bossEye			:	0x7d20ba,
			obstacle		:	0x1e0217,
			remainText		:	'#7028f4'
		},
		99:{
			backGround 		: 	0xfdaa69,
			backAlpha		: 	0xc21b3b,
			motionBg		: 	0xff0031,
			bossMain		:	0x9e0031,
			bossEye			:	0xdb0020,
			obstacle		:	0x72001e,
			remainText		:	'#ff8383'
		}
		
}
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
