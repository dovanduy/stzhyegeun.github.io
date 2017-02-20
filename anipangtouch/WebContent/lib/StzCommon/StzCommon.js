define(function (require) {
	// load modules
	var baseLog = require('./StzLog');
	var baseUtil = require('./StzUtility');
	
	if (StzGameConfig === undefined) {
		throw "StzGameConfig is undefined";
		return;
	}
	
	function StzCommonCreator() {
		this.StzLog = new baseLog();
		this.StzLog.log_enabled = StzGameConfig.DEBUG_MODE;
		
		this.StzUtil = new baseUtil();
	}
	
	// module global accessor
	StzCommon = new StzCommonCreator();
	
	window.onRequireLoad();
});