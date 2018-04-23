var ELOG_GAME_ID	= 28;

var EServerLogMsg = {
		INIT			:	'init',
		START			:	'start',
		END				:	'end',
		TUTORIAL		:	'tutorial',
		INIT_STEP		:	'init_step',
		RESOURCE		:	'resource',
		SHARE			:	'share',
		MENU			:	'menu',
		GAME_INIT		:	'game_init'
};

var EInitStep = {
		INSTANT			:	'instant',
		TITLE			:	'title',
		CDN_COMPLETE	:	'cdn_complete',
		LOBBY			:	'lobby',
		GAME_START		:	'game_start',
};

var EResourcePlace = {
		GAME_PLAY 		: 	'game_play',
		FREE_COIN		:	'free_coin',
		BUY_CHARACTER	: 	'buy_character',
		CONTINUE		:	'continue',
		SKIP			:	'skip'	
};

var EMenuName = {
		RANKING		:	'ranking',
		CHARACTER	:	'character',
		SETTING		:	'setting'
};

var ELogEvent = {
		SEND_MESSAGE_SHARE_RANKING		: 'SEND_MESSAGE_SHARE_RANKING',
		SEND_MESSAGE_SHARE_RESULT		: "SEND_MESSAGE_SHARE_RESULT",
		SEND_MESSAGE_SHARE_TITLE		: "SEND_MESSAGE_SHARE_TITLE", 
		SEND_MESSAGE_SHARE_CHARACTER	: "SEND_MESSAGE_SHARE_CHARACTER",
		SEND_MESSAGE_SHARE_FREECOIN		: "SEND_MESSAGE_SHARE_FREECOIN"
};