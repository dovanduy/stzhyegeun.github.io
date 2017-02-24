define(function (require) {

	// check StzGameConfig is Available
	if (StzGameConfig === undefined) {
		throw "StzGameConfig is undefined";
		return;
	}

	// load modules
	var baseLog = require('./StzLog');
	var baseUtil = require('./StzUtility');
	
	function StzCommonCreator() {
		// StzLog setup
		this.StzLog = new baseLog();
		this.StzLog.log_enabled = StzGameConfig.DEBUG_MODE;
		// StzUtility setup
		this.StzUtil = new baseUtil();
	}
	
	// module global accessor
	StzCommon = new StzCommonCreator();
	
	
});