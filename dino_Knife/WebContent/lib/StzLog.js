function _StzLog(inLogEnabled) {
	this.log_enabled = inLogEnabled;
}

var StzLog = new _StzLog(StzGameConfig.DEBUG_MODE);
StzLog.print = function(inValue) {
	if (this.log_enabled === true) {
		console.log(inValue);
	}
};

StzLog.assert = function(condition, message) {
	if (!condition) {
		var resultMessage = message || "Assertion failed";
		if (typeof Error !== "undefined") {
			throw new Error(resultMessage);
		}
		throw resultMessage;
	}
};

StzLog.serverError = function(inId, inMessage, inObject) {
	
	var obj = inObject;
	obj.pid = inId;

	var strLocation = "";
	try {
		strLocation = window.location.href;
	} catch (e) {
		strLocation = "dinoballz";
	}
	obj.location = strLocation;
	
	$.post(SERVER_DOMAIN + '/logs/error/v1', {
		"msg": inMessage,
		"vars": obj
	});
};