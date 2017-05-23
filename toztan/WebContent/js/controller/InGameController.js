
var EControllerState = {
		NONE_TURN				: "NONE_TURN",
		USER_INPUT_TURN 		: "USER_INPUT_TURN",
		MOVE_BALL_TURN 			: "MOVE_BALL_TURN",
};


var InGameController = function(inViewContext) {
	
	var _state = EControllerState.NONE_TURN;
	var _inViewContext = inViewContext;
	
	self.updateView = function() {
		if(_state === EControllerState.USER_INPUT_TURN){
			
		}
		else if(_state === EControllerState.MOVE_BALL_TURN){
			
		}
	};
	
	self.clickMouse = function() {
		console.log("클릭");
	};
	
	self.moveMouse = function() {
		console.log("무브");
	};
	
	self.unClickMouse = function() {
		console.log("언클릭");
	};
	return self;
};