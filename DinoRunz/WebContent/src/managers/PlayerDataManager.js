var MAX_LOAD_FRIENDS_COUNT = 100;

var PlayerDataManager_proto  = function() {
	if (!(this instanceof PlayerDataManager_proto)) {
		return new PlayerDataManager_proto();
	}
	
	var _platformId = null;
	this.setPlatformId = function(inPlatformId) {
		_platformId = inPlatformId;
	};
	this.getPlatformId = function() {
		return _platformId;
	};
	
	{
		this.profileInfo = null;
		this.saveData = null;
		this.lederBoardData = null;
		this.friendCount = 0;
		this.contextLederBoardData = null;
		this.contextFriendCount = 0;

		this.ESortOrder = {
			DESCEND	: "Descend",
			ASCEND	: "Ascend"
		};
	}
	
	var _friends = [];
	var _contextFriends = [];
	
///// Player Data /////
	this.getPlayer = function() {
		return {
			profileInfo: this.profileInfo, 
			bestStage : this.saveData.getBestStage()
		};
	};
	
	this.initFriends = function(inCompleteCallback, inFailCallback){
		var count = (MAX_LOAD_FRIENDS_COUNT < this.friendCount)? MAX_LOAD_FRIENDS_COUNT:this.friendCount;
		this.lederBoardData.getEntriesAsync(count, 0)
		.then(function(entries){
			for(var i = 0; i < entries.length; i++){
				var playerName = (window.FBInstant ? entries[i].getPlayer().getName() : "GUEST");
				var playerPhoto = (window.FBInstant ? entries[i].getPlayer().getPhoto() : "NONE"); 

				var fallenBlockId = null;
				try{
					fallenBlockId = JSON.parse(entries[i].getExtraData()).fallenBlockId;
				}
				catch(err){
					fallenBlockId = this.extraDataParse(entries[i].getExtraData()).fallenBlockId;
				}

				_friends.push({'profileInfo' : new ProfileInfoModel(0, entries[i].getPlayer().getID(), playerName, playerPhoto, 0), 
					bestStage : entries[i].getScore(), fallenBlockId: fallenBlockId});
			}
			
			if(inCompleteCallback){
				inCompleteCallback();
			}
		}.bind(this))
		.catch(function(err){
			if(inFailCallback){
				inFailCallback(err);
			}
		});
	};
	
	this.initFriendsLocal = function(){
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10, fallenBlockId: 10});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30, fallenBlockId: 12});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50, fallenBlockId: 15});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '4', 'AHURA', 'default_thumb', 0), bestStage : 55, fallenBlockId: 16});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '5', 'SUN', 'default_thumb', 0), bestStage : 27, fallenBlockId: 3});
	};

	this.sortFriends = function (inSortKey, inStrSortOrder) {
		if (inStrSortOrder === this.ESortOrder.ASCEND) {
			_friends.sort(function (a, b) {
				return a[inSortKey] - b[inSortKey];
			});
		}
		else if (inStrSortOrder === this.ESortOrder.DESCEND) {
			_friends.sort(function (a, b) {
				return b[inSortKey] - a[inSortKey];
			});
		}
	};
	
	this.getFriends = function(){
		return _friends;
	};
	
	this.setFriedsCount = function(inValue){
		this.friendCount = inValue;
	};
	
	this.initContextFriends = function(inCompleteCallback, inFailCallback){
		var count = (MAX_LOAD_FRIENDS_COUNT < this.contextFriendCount)? MAX_LOAD_FRIENDS_COUNT:this.contextFriendCount;
		this.contextLederBoardData.getEntriesAsync(count, 0)
		.then(function(entries){
			for(var i = 0; i < entries.length; i++){
				var playerName = (window.FBInstant ? entries[i].getPlayer().getName() : "GUEST");
				var playerPhoto = (window.FBInstant ? entries[i].getPlayer().getPhoto() : "NONE");
				
				var fallenBlockId = null;
				try{
					fallenBlockId = JSON.parse(entries[i].getExtraData()).fallenBlockId;
				}
				catch(err){
					fallenBlockId = this.extraDataParse(entries[i].getExtraData()).fallenBlockId;
				}

				_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, entries[i].getPlayer().getID(), playerName, playerPhoto, 0), 
				bestStage : entries[i].getScore(), fallenBlockId: fallenBlockId});
			}
			
			if(inCompleteCallback){
				inCompleteCallback();
			}
		}.bind(this))
		.catch(function(err){
			if(inFailCallback){
				inFailCallback(err);
			}
		});
	};
	
	this.initContextFriendsLocal = function(){
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10, fallenBlockId : 10});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30, fallenBlockId : 12});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50, fallenBlockId : 15});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '4', 'AHURA', 'default_thumb', 0), bestStage : 55, fallenBlockId : 16});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '5', 'SUN', 'default_thumb', 0), bestStage : 27, fallenBlockId : 3});
	};

	this.sortContextFriends = function (inSortKey, inStrSortOrder) {
		if (inStrSortOrder === this.ESortOrder.ASCEND) {
			_contextFriends.sort(function (a, b) {
				return a[inSortKey] - b[inSortKey];
			});
		}
		else if (inStrSortOrder === this.ESortOrder.DESCEND) {
			_contextFriends.sort(function (a, b) {
				return b[inSortKey] - a[inSortKey];
			});
		}
	};
	
	this.getContextFriends = function(){
		return _contextFriends;
	};
	
	this.setContextFriedsCount = function(inValue){
		this.contextFriendCount = inValue;
	};
	
	this.saveLederBoardData = function(extraData, resolve){
		if(window.FBInstant){
			var leaderBoardSetData = this.lederBoardData.setScoreAsync(DinoRunz.Storage.UserData.lastClearedStage, extraData);
			
			leaderBoardSetData
			.then(function(entry){
				StzLog.print("score: " + entry.getScore());
				StzLog.print("extraData: " + entry.getExtraData());
			})
			.catch(function(err){
				//리더보드 세이브 실패
				StzLog.print(JSON.stringify(err));
			});
			
			if(this.contextLederBoardData){
				var contextLeaderBoardSetData = this.contextLederBoardData.setScoreAsync(DinoRunz.Storage.UserData.lastClearedStage, extraData);

				contextLeaderBoardSetData
				.then(function(entry){
					StzLog.print("score: " + entry.getScore());
					StzLog.print("extraData: " + entry.getExtraData());
				})
				.catch(function(err){
					//리더보드 세이브 실패
					StzLog.print(JSON.stringify(err));
				});
			}

			// if(resolve){
			// 	if(this.contextLederBoardData) {
			// 		Promise.all([leaderBoardSetData, contextLeaderBoardSetData]).then(function() {
			// 			resolve();
			// 		});
			// 	}
			// 	else {
			// 		Promise.all([leaderBoardSetData]).then(function() {
			// 			resolve();
			// 		});
			// 	}
			// }
		}
	};

	this.extraDataParse = function(extraData) {
		extraData = extraData.replace(/{/g, "{\"");
		extraData = extraData.replace(/:/g, "\":");
		extraData = extraData.replace(/, /g, ",\"");
		
		return JSON.parse(extraData);
	};
};
