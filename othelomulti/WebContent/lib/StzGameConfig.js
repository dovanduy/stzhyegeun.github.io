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
	BLACK: 'blackChipBig.png', 
	WHITE: 'whiteChipBig.png',
	MINIBLACK: 'blackChipMini.png',
	MINIWHITE: 'whiteChipMini.png'
};

var ETurn = {
    BLACK: 1, 
    WHITE: 2
};