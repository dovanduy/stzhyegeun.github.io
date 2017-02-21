var StzGameConfig = {};

// Preset Setting -- do not delete!!!
StzGameConfig.DEBUG_MODE = true;
StzGameConfig.LOCK_ORIENTATION = "PORTRAIT";
//StzGameConfig.LOCK_ORIENTATION = "LANDSCAPE";

// Custom Setting
StzGameConfig.PRELOAD_BAR_MIN_WIDTH = 20;
StzGameConfig.PRELOAD_BAR_MAX_WIDTH = 310;

StzGameConfig.STAGE_PER_EPISODE = 20;
StzGameConfig.TOTAL_EPISODE_COUNT = 5;

StzGameConfig.BLOCK_WIDTH = 84;
StzGameConfig.BLOCK_HEIGHT = 80;


// 인게임 블럭의 대분류
var StzEBlockKind = {};
StzEBlockType.NORMAL = "ingame_block_0";
StzEBlockType.CAN = "ingame_block_10001";
StzEBlockTYpe.WOOD_BOX = "ingame_block_10003";
StzEBlockType.MOLE = "ingame_block_10005";
StzEBlockType.SEED = "ingame_block_10006";
StzEBlockType.POPCORN = "ingame_block_20002";
StzEBlockType.MAO = "ingame_block_30007";
StzEBlockType.PINKY = "ingame_block_60001";
StzEBlockType.GUESS = "ingame_block_70001";

StzEBlockType.MISSION_DOGGUM = "ingame_block_mission_40001_0";
StzEBlockType.MISSION_EGG = "ingame_block_mission_40002";

StzEBlockType.SPECIAL_LASER = "ingame_special_2002";
StzEBlockType.SPECIAL_BOMB = "ingame_special_2004";

// 인게임 블럭의 Kind에 따른 소분류
var StzEBlockKindType = {};
StzEBlockKindType.NORMAL_YELLOW = "1";
StzEBlockKindType.NORMAL_RED_BASE = "2";
StzEBlockKindType.NORMAL_WHITE = "3";
StzEBlockKindType.NORMAL_GREEN = "4";
StzEBlockKindType.NORMAL_BLUE = "5";
StzEBlockKindType.NORMAL_ORANGE = "6";

StzEBlockKindType.NORMAL_LINE = "2002";
StzEBlockKindType.NORMAL_BOMB = "2004";
StzEBlockKindType.NORMAL_THUNDER = "2005";

StzEBlockKindType.CAN_FIRST = "1";
StzEBlockKindType.CAN_SECOND = "2";
StzEBlockKindType.CAN_THIRD = "3";

StzEBlockKindType.PINKY_NORMAL = "0";
StzEBlockKindType.PINKY_HAPPY = "1";

StzEBlockKindType.EGG_NORMAL = "0";
StzEBlockKindType.EGG_CRACK = "1";

var StzEBlockLineType = {};
StzEBlockLineType.LINE_VERTICAL = "0";
StzEBlockLineType.LINE_HORIZONTAL = "1";