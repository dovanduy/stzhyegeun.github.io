define(function () {
	function StzLog() {
		 this.log_enabled = true;
	}
	
	StzLog.prototype.print = function(inValue) {
		if (this.log_enabled) {
			console.log(inValue);
		}
	}

	// REFER http://stackoverflow.com/questions/15313418/javascript-assert
	StzLog.prototype.assert = function(condition, message) {
		if (!condition) {
			message = message || "Assertion failed";
			if (typeof Error !== "undefined") {
				throw new Error(message);
			}
			throw message; // Fallback
		}
	}
	
	return StzLog;
});

