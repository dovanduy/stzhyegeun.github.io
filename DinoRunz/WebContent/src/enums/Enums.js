var EDirection = {
	RIGHT: 0, 
	DOWN: 1, 
	LEFT: 2, 
	UP: 3
};

var ETileType = {
	DIRECTION_RIGHT: 0, 
	DIRECTION_DOWN: 1, 
	DIRECTION_LEFT: 2, 
	DIRECTION_UP: 3, 
	NONE: 4, 
	NORMAL: 5, 
	SLIM: 6, 
	START: 7, 
	GOAL: 8, 
	END: 9,
	EDITMODE_JUMP: 101,
};

var ESlotLockType = {
	none: 1,
	level: 2,
	video: 3,
	share: 4,
	gift: 99
};

var EShareType = {
	INVITE		:	'invite',
	CHARACTER	:	'character',
	RESULT		:	'result',
	CROWN		:	"crown",
	CLEAR		:	"clear"
};

var EStageMode = {
	NORMAL 	: "N",
	HARD 	: "H"
};

var EStageResult = {
	FAIL	: "F",
	CLEAR	: "C"
};

var EChatbotType = {
	REPEAT 	: 	"repeat",
	STAGE	:	"stage"
};