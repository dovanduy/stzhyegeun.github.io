define(function () {
	function StzLog() {
		 this.log_enabled = true;
	}
	
	StzLog.prototype.print = function(inValue) {
		if (this.log_enabled) {
			console.log(inValue);
		}
	}
	
	return StzLog;
});

