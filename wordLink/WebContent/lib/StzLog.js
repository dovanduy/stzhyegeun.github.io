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
