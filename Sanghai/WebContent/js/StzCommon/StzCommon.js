define(function (require) {
	// load modules
	var baseLog = require('./StzLog');
	var config = require('./StzGameConfig'); 
	
	function StzCommonCreator() {
		this.StzLog = new baseLog();
		this.StzConfig = config;
		
		this.StzLog.log_enabled = this.StzConfig.debug_mode;
	}
	
	// module global accessor
	StzCommon = new StzCommonCreator();
	
	window.onRequireLoad();
});