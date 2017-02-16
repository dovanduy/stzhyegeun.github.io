define(function (require) {
	// load modules
	var baseLog = require('./StzLog');
	var baseAnimation = require('./animations/StzAnimation');
	
	if (StzGameConfig === undefined) {
		throw "StzGameConfig is undefined";
		return;
	}
	
	function StzCommonCreator() {
		this.StzLog = new baseLog();
		this.StzAnimation = new baseAnimation();
		this.StzLog.log_enabled = StzGameConfig.DEBUG_MODE;
	}
	
	// module global accessor
	StzCommon = new StzCommonCreator();
	
	window.onRequireLoad();
});