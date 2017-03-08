define(function (require) {
	// load modules
	var baseLog = require('./StzLog');
	
	if (StzGameConfig === undefined) {
		throw "StzGameConfig is undefined";
		return;
	}
	
	function StzCommonCreator() {
		this.StzLog = new baseLog();
		this.StzLog.log_enabled = StzGameConfig.DEBUG_MODE;
	}
	
	// module global accessor
	StzCommon = new StzCommonCreator();
	
	window.onRequireLoad();
});