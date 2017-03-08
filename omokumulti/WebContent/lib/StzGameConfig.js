var StzGameConfig = {
	DEBUG_MODE: true
	, GAME_WIDTH: 640
	, GAME_HEIGHT: 960
	, LOCK_ORIENTATION: "PORTRAIT" 	// , LOCK_ORIENTATION: "LANDSCAPE"
	, PEER_API_KEY: "e3sltd1aarod2t9"
	, ROW_COUNT: 15
	, COL_COUNT: 15
	, BLOCK_WIDTH: 42.6
	, BLOCK_HEIGHT: 42.6
	, BOARD_TOP_OFFSET: 160
};

var StzServerConfig = {
    BASE_URL: "//infinite-cliffs-71037.herokuapp.com"
    , GET_PEERID_URL: "/omok/get/peerid"
    , GET_PEERIDLIST_URL: "/omok/get/peeridlist"
    , CREATE_PEERID_URL: "/omok/create/peerid"
    , UPDATE_PEERID_URL: "/omok/update/peerid"
    , EXPIRE_SECONDS: 30
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

var EServerMethod = {
	CHANGE_TURN : 		"CHANGE_TURN",
	SEND_EMOTICON : 	"SEND_EMOTICON",
	SEND_END : 			"SEND_END"
		
};

var EBlockType = {
	NONE: 0, 
	BLACK: 1, 
	WHITE: 2,
	FORBIDERN:3
};

StzGameConfig.getChipFrameName = function(type){
	if(type === EBlockType.BLACK) return 'blackBlock.png';
	else if(type === EBlockType.WHITE) return 'whiteBlock.png';
	else if(type === EBlockType.FORBIDERN) return 'forbidern.png';
	
	else StzCommon.StzLog.assert(true, "Error");
};

var ETurn = {
    BLACK: 1, 
    WHITE: 2
};

var ERESULT = {
	    WIN: 1, 
	    LOSE: 2
	};

var EEmoticonNames = {
		ALL 	:'emoticon' ,
		FAST	:'emoticonFast.png',
		LAUGH	:'emoticonLaugh.png',
		SORRY	:'emoticonSorry.png',
		GREET	:'emotionGreet.png'
};