var StzGameConfig = {
	DEBUG_MODE: true
	, LOCK_ORIENTATION: "PORTRAIT" 	// , LOCK_ORIENTATION: "LANDSCAPE"
	, PEER_API_KEY: "e3sltd1aarod2t9"
	, ROW_COUNT: 8
	, COL_COUNT: 8
	, CHIP_WIDTH: 80
	, CHIP_HEIGHT: 80
	, BOARD_TOP_OFFSET: 160
};

var EChipType = {
	NONE: 0, 
	BLACK: 1, 
	WHITE: 2,
	MINIBLACK: 3,
	MINIWHITE: 4
};

StzGameConfig.getChipFrameName = function(type){
	if(type === EChipType.BLACK) return 'blackChipBig.png';
	else if(type === EChipType.WHITE) return 'whiteChipBig.png';
	else if(type === EChipType.MINIBLACK) return 'blackChipMini.png';
	else if(type === EChipType.MINIWHITE) return 'whiteChipMini.png';
	else StzCommon.StzLog.assert(true, "Error");
};

var ETurn = {
    BLACK: 1, 
    WHITE: 2
};