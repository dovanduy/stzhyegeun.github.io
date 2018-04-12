
/**
 * TODO
 * 완료 1. 클래식한 Callback 형태로 우선 구현 
 * 2. Promise 적용하여 구현
 * 3. 각각의 통신 요청을 함수형으로 커맨드화 해서 저장 -> 차후 재시도할 때 사용 (Promise 중간에 atomic 이 깨지더라도 일부만 재시도 할 수 있도록 처리)
 * 완료 Optional 1. 각 함수의 파라미터를 객체화하여 사용하도록 (ex: var userInitParam = new UserInitParam(...);)  
 */

var EErrorMessageType = {
	INVALID_PARAM: "INVALID_PARAM", 
	USER_NOT_INITIALIZED: "USER_NOT_INITIALIZED", 
};

var EServerMethod = {
	// USER_INIT
	USER_INIT: "/init/v1.json", //+
	
	SET_AD_LOG	: "/logs/advertising/log/v1.json"
};

var EServerLogMsg = {
		INIT	:	'init',
		START	:	'start',
		end		:	'end'
};

var ServerManager_proto = function() {
	if (!(this instanceof ServerManager_proto)) {
		return new ServerManager_proto();
	}
	
	var DEBUG_MODE = false;

	{
		// Server User Attr
		this.serverId = -1;
		this.platformId = null;
	}
	
	{
		// SETTINGS
		//var _baseUrl = (StzBuildConfig.SERVER_MODE === EServerMode.STAGE ? "https://webgame-stage.stzapp.net" : "https://webgame.stzapp.net");
		var _baseUrl = "https://drunz.stzapp.net";
		if (StzBuildConfig.SERVER_MODE === EServerMode.STAGE) {
			//_baseUrl = "https://webgame-stage.stzapp.net";
			_baseUrl = "https://drunz.stzapp.net";
		} else if (StzBuildConfig.SERVER_MODE === EServerMode.LIVE) {
			_baseUrl = "https://drunz.stzapp.net";
		}
		
		var _baseLogUrl = "https://hyperlog.stzgame.net/logs";
		if (StzBuildConfig.SERVER_MODE === EServerMode.STAGE) {
			//_baseUrl = "https://webgame-stage.stzapp.net";
			_baseLogUrl = "https://hyperlog.stzgame.net/logs";
		} else if (StzBuildConfig.SERVER_MODE === EServerMode.LIVE) {
			_baseLogUrl = "https://hyperlog.stzgame.net/logs";
		}
	}
	
	this.sendMessage = function(inServerMethod, inParam, inSuccessCallback, inDoneCallback, inFailCallback, inContext, isLog) {
		
		if (!inParam) {
			inParam = {};
		}
		
		var baseUrl = (isLog === true)? _baseLogUrl : _baseUrl + inServerMethod;
		
		if(isLog === true){
			 $.ajax({
                 type: "POST",
                 url: baseUrl,
                 data: JSON.stringify(inParam),
                 dataType: "json",
                 complete: function(data, status) {
                	 if(data.status === 200){
                         StzLog.print(data.status);
                	 }
                	 else{
                         StzLog.print(data.status);
                	 }
                 }
             });
		}
		else{
			inParam.v_a = StzBuildConfig.VERSION;
			
			$.post(baseUrl, inParam, function(res) {
				var serverTime = Number(res._stm);
				if (isNaN(serverTime) === false) {
					this.serverTime = serverTime;
				}
				if (DEBUG_MODE) {
					console.log("[" + inServerMethod + "] SUCCESS: " + JSON.stringify(res));
				}			
				
				if (res && res.data && res.data.error) {
					if (inFailCallback) {
						inFailCallback.call(inContext, res);
					}
					return;
				}
				
				if (inSuccessCallback) {
					inSuccessCallback.call(inContext, res);
				}
			}.bind(this)).done(function(res) {
				if (DEBUG_MODE) {
					console.log("[" + inServerMethod + "] DONE: " + JSON.stringify(res));
				}
				
				if (res && res.data && res.data.error) {
					if (inFailCallback) {
						inFailCallback.call(inContext, res);
					}
					return;
				}
				
				if (inDoneCallback) {
					inDoneCallback.call(inContext, res);
				}
			}).fail(function(err) {
				if (DEBUG_MODE) {
					console.log("[" + inServerMethod + "] DONE: " + JSON.stringify(err));
				}
				if (inFailCallback) {
					inFailCallback.call(inContext, err);
				}
			});
		}
		
	};
	
	this.getOsType = function(inOsType) {
		if (inOsType == "IOS") {
			return "i";
		} 
		return "a";
	};
	
	this.ErrorLogger = function(inErrorMessageType) {
		
		if (inErrorMessageType === EErrorMessageType.INVALID_PARAM) {
			return {
				show: function(inFuncName, inParamName, inRecommendType) {
					var message = "[ServerManager] " + inFuncName + "- Invalid parameter type: " + inParamName + " should be " + inRecommendType + " type.";
					return message;
				}
			}
		} else if (inErrorMessageType === EErrorMessageType.USER_NOT_INITIALIZED) {
			return {
				show: function(inPlatformId) {
					var message = "[ServerManager] User(" + inPlatformId + ") not initialized!";
					return message;
				}
			}
		}
		
	};
	
	
	/**
	 * EServerMethod.USER_INIT
	 * 플랫폼 아이디에 따라 만들어진 서버 아이디와 스태틱 정보를 로드 
	 * 
	 * @param inPlatformId (string) 
	 * @param inOsType (string)
	 * @param inLanguage (string)
	 * @param inDoneCallback (function)
	 * @param inFailCallback (function)
	 * @param inContext 
	 */
	this.userInit = function(inPlatformId, inOsType, inLanguage, inDoneCallback, inFailCallback, inContext) {
		
		StzLog.assert(typeof inPlatformId === "string", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("userInit", "inPlatformId", "string"));
		StzLog.assert(typeof inOsType === "string", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("userInit", "inOsType", "string"));
		StzLog.assert(typeof inLanguage === "string", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("userInit", "inLanguage", "string"));
		StzLog.assert(typeof inDoneCallback === "function", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("userInit", "inDoneCallback", "function"));
		StzLog.assert(typeof inFailCallback === "function", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("userInit", "inFailCallback", "function"));

		this.platformId = inPlatformId;
		
		var tzOffset = Math.floor((new Date()).getTimezoneOffset() / 60) * -1;
		var userInitParam = {
				v_s: "{}", // Load all static data
				v_a: StzBuildConfig.VERSION, 
				platform_id: inPlatformId,
				player_id: inPlatformId,
				os: this.getOsType(inOsType), 
				device_id: this.getOsType(inOsType), 
				lang: inLanguage, 
				country: tzOffset.toString()
		};
		this.sendMessage(EServerMethod.USER_INIT, userInitParam, null, function(res) {
			// DONE
			// Check responsed data
			if (!res.data || StzUtil.hasOwnProperties(res.data, ["user_info", "statics"]) === false) {
				if (inFailCallback) {
					inFailCallback.call(inContext, res);
				}
				return;
			}
			
			// GameServer User Id
			if (!res.data.user_info.id || isNaN(Number(res.data.user_info.id))) {
				if (inFailCallback) {
					inFailCallback.call(inContext, res);
				}
				return;
			}
			this.serverId = Number(res.data.user_info.id);
			
			if (inDoneCallback) {
				inDoneCallback.call(inContext, res);
			}
		}, function(err) {
			// FAIL
			if (inFailCallback) {
				inFailCallback.call(inContext, err);
			}
		}, this);
	};
	
	/**
	 * <setAdLog>
	 * EServerMethod.SET_AD_LOG
	 * 광고데이터 서버에 저장 
	 * 
	 * @param inDoneCallback (function)
	 * @param inFailCallback (function)
	 * @param inContext
	 */
	this.setAdLog = function(inAdType, inPlace, inUserAction, inDoneCallback, inFailCallback, inContext) {
		StzLog.assert(this.serverId > 0, this.ErrorLogger(EErrorMessageType.USER_NOT_INITIALIZED).show(this.platformId));
		StzLog.assert(typeof inDoneCallback === "function", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("setAdData", "inDoneCallback", "function"));
		StzLog.assert(typeof inFailCallback === "function", this.ErrorLogger(EErrorMessageType.INVALID_PARAM).show("setAdData", "inFailCallback", "function"));

		var setAdLogParam = {
			user_id			: this.serverId,
			ad_agency		: 'audience_network',
			tier 			: 1,
			is_tier_change	: false,
			ad_type			: inAdType,
			place			: inPlace,
			user_action		: inUserAction
		};
		this.sendMessage(EServerMethod.SET_AD_LOG, setAdLogParam, null, function(res) {
			// DONE
			if (!res.data) {
				if (inFailCallback) {
					inFailCallback.call(inContext, res);
				}
				return;
			}
			if (inDoneCallback) {
				inDoneCallback.call(inContext, res);
			}
		}, function(err) {
			// FAIL
			if (inFailCallback) {
				inFailCallback.call(inContext, err);
			}
		}, this);
	};
	
///////////////////////// 로그 ///////////////////////////
	this.setLog = function(inMsg, inVars, inDoneCallback, inFailCallback, inContext){
		var setLogParam = {
			logs	: {
				game			: '29',
				user_id			: this.serverId,
				msg 			: inMsg,
				vars			: inVars
			}
		};
		this.sendMessage(setLogParam, setLogParam, null, null, null, this, true);
	};
};

