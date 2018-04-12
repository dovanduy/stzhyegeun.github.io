
/**
 *
 */
var StaticManager_proto = function () {
	if (!(this instanceof StaticManager_proto)) {
		return new StaticManager_proto();
	}
	
	
	this.DEBUG_MODE = true;
	
	this.stage = 1;
	
	this.initWithData = function(inObj, inCallback, inContext) {
		for (var key in inObj) {
			if (typeof inObj[key] === 'object') {
				this[key] = new StaticModel(key, (inObj[key].version || 1), inObj[key].data);
			} else {
				continue;
			}
		}
		
		if (inCallback) {
			inCallback.call(inContext);
		}
	};
	
	this.evaluate = function(inEquation, inDefaultValue, inOverrideParams) {
		
		if (!inEquation) {
			return 0;
		}
		
		if (typeof inEquation == "number") {
			return inEquation;
		}
//		
//		var _stage = getParamValue("_stage");
//		var _level = getParamValue("_level");
//		var _damage = getParamValue("_damage");
//		var _followers = getParamValue("_followers");
//		var _pocket = getParamValue("_pocket");
//		var _beststage = getParamValue("_beststage");
//		var _totalbeststage = getParamValue("_totalbeststage");
//		var _warpstage = getParamValue("_warpstage");
//		var _evolution = getParamValue("_evolution");
//		var _tier = getParamValue("_tier");
//		var _min_stage = getParamValue("_min_stage");
//		
//		var tempFunction = null;
//		var tempFunctionBody = "return " + inEquation + ";";
//		var result = inDefaultValue || 0;
//		try {
//			tempFunction = new Function("_stage", "_level", "_damage", "_followers", "_pocket", "_beststage", "_totalbeststage", "_warpstage", "_evolution", "_tier", "_min_stage", tempFunctionBody);
//			result = tempFunction(_stage, _level, _damage, _followers, _pocket, _beststage, _totalbeststage, _warpstage, _evolution, _tier, _min_stage);
//		} catch (error) {
//			console.log('[StaticManager-(evaluate)] Error: ' + JSON.stringify(error));
//			return result;
//		} 
//		return result;
//		
//		function getParamValue(inParamName) {
//			return (inEquation.indexOf(inParamName) < 0 ? null : (inOverrideParams && inOverrideParams.hasOwnProperty(inParamName) ? inOverrideParams[inParamName] : getParamDefaultValue(inParamName)));
//			
//			function getParamDefaultValue(inParamName) {
//				switch (inParamName) {
//				case "_stage": return this.stage || 1;
//				case "_level": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getLevel() : 1);
//				case "_damage": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getDamage() : 1);
//				case "_followers": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getFollowers() : 0);
//				case "_pocket": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getMaxFollowers() : 1);
//				case "_beststage": return PlayerDataManager.weeklyBestInfo.getStage();
//				case "_totalbeststage": return PlayerDataManager.bestInfo.getStage();
//				case "_warpstage": return InGameConfig.WARP_MIN_STAGE;
//				case "_evolution": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getEvolutionLevel() : 0);
//				case "_tier": return (LeaderBallManager.currentLeaderBall() ? LeaderBallManager.currentLeaderBall().getTier() : 1);
//				case "_min_stage": InGameConfig.BOSS_BLOCK_LEVEL;
//				default: return 0;
//				}
//			}
//		}
	};
	
	this.parseToArray= function(inValue) {
		if (inValue === null || undefined) {
			return null;
		}
		
		var ARRAY_DELIMETER = ":";
		
		var result = null;
		if (typeof inValue === "string" && inValue.indexOf(ARRAY_DELIMETER)) {
			result = inValue.split(ARRAY_DELIMETER);
		} else {
			result = [inValue];
		}
		return result;
	};
	
	this.getStaticVersions = function() {
		var result = {};
		for (var key in this) {
			if (this[key] instanceof StaticModel === true) {
				result[key] = this[key].version;
			}
		}
		
		return result;
	};
};


var StaticModel = function(staticName, staticVersion, staticData) {
	if (!(this instanceof StaticModel)) {
		return new StaticModel(staticName, staticVersion, staticData);
	}
	
	this.DEBUG_MODE = false;
	
	var _processName = function(inName) {
		return inName;
	};
	
	var _processVersion = function(inVersion) {
		return inVersion;
	};
	
	var _processData = function(inData) {
		
		var typeData = Object.prototype.toString.call(inData);

		var result = null;
		if (typeData === '[object Object]') {
			result = inData;
			this.length = 1;
		} else if (typeData === '[object Array]') {
			result = new Object();
			this.length = inData.length;
			for (var i = 0; i < inData.length; i++) {
				if (inData[i].hasOwnProperty('key')) {
					result[inData[i].key] = inData[i];
				} else if (inData[i].hasOwnProperty('id')) {
					result[inData[i].id] = inData[i];
				} else {
					result[i] = inData[i];
				}
			}
		} 
		
		return result;
	}.bind(this);
	
	this.length = 1;
	this.name = (staticName ? _processName(staticName) : null);
	this.version = (staticVersion ? _processVersion(staticVersion) : null);
	this.data = (staticData ? _processData(staticData) : null);
	
	this.set = function(inName, inVersion, inData) {
		this.name = _processName(inName);
		this.version = _processVersion(inVersion);
		this.data = _processData(inData);
	};
	
	this.get = function(inKeyId) {
		if (this.data && this.data.hasOwnProperty(inKeyId)) {
			return this.data[inKeyId];
		}
		return null;
	};
	
	
};
