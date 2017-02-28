var StzGameConfig = {
	DEBUG_MODE: true
	, GAME_WIDTH: 640
	, GAME_HEIGHT: 960
	, LOCK_ORIENTATION: "PORTRAIT" 	// , LOCK_ORIENTATION: "LANDSCAPE"
	, PEER_API_KEY: "e3sltd1aarod2t9"
	, ROW_COUNT: 8
	, COL_COUNT: 8
	, CHIP_WIDTH: 80
	, CHIP_HEIGHT: 80
	, BOARD_TOP_OFFSET: 160
};

var StzServerConfig = {
    BASE_URL: "https://infinite-cliffs-71037.herokuapp.com"
    , GET_PEERID_URL: "/othelo/get/peerid"
    , GET_PEERIDLIST_URL: "/othelo/get/peeridlist"
    , CREATE_PEERID_URL: "/othelo/create/peerid"
    , UPDATE_PEERID_URL: "/othelo/update/peerid"
    , EXPIRE_SECONDS: 600
    , getRetrievePeerIdUrl: function(inPeerId) {
		var result = this.BASE_URL + this.GET_PEERID_URL + "?peerid=" + inPeerId;
		return result;
	}
	, getRetrievePeerIdListUrl: function() {
		var result = this.BASE_URL + this.GET_PEERIDLIST_URL;
		return result;
	} 
	, getCreatePeerIdUrl: function(inPeerId) {
		var result = this.BASE_URL + this.CREATE_PEERID_URL + "?peerid=" + inPeerId;
		return result;
	}
	, getUpdateUrl: function(inPeerId, inStatus) {
    	var result = this.BASE_URL + this.UPDATE_PEERID_URL + "?peerid=" + inPeerId + "&status=" + inStatus;
    	return result;
    }
};

var EConnectStatus = {
	LOGIN: 0, 
	WAITING: 1, 
	GAMING: 2
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