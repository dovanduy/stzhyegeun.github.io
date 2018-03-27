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
				
				_friends.push({'profileInfo' : new ProfileInfoModel(0, entries[i].getPlayer().getID(), playerName, playerPhoto, 0), bestStage : entries[i].getScore()});
			}
			
			if(_friends.length <= 3){
				_friends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10});
				_friends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30});
				_friends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50});
			}
			
			if(inCompleteCallback){
				inCompleteCallback();
			}
		})
		.catch(function(err){
			if(inFailCallback){
				inFailCallback(err);
			}
		})
	};
	
	this.initFriendsLocal = function(){
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '4', 'AHURA', 'default_thumb', 0), bestStage : 55});
		_friends.push({'profileInfo' : new ProfileInfoModel(0, '5', 'SUN', 'default_thumb', 0), bestStage : 27});
	};
	
	this.getFriends = function(){
		return _friends;
	};
	
	this.setFriedsCount = function(inValue){
		this.friendCount = inValue;
	}
	
	this.initContextFriends = function(inCompleteCallback, inFailCallback){
		var count = (MAX_LOAD_FRIENDS_COUNT < this.contextFriendCount)? MAX_LOAD_FRIENDS_COUNT:this.contextFriendCount;
		_contextFriends = [];
		
		if(count <= 0){
			this.initContextFriendsLocal();
			
			if(inCompleteCallback){
				inCompleteCallback();
			}
		}
		else{
			this.contextLederBoardData.getEntriesAsync(count, 0)
			.then(function(entries){
				for(var i = 0; i < entries.length; i++){
					var playerName = (window.FBInstant ? entries[i].getPlayer().getName() : "GUEST");
					var playerPhoto = (window.FBInstant ? entries[i].getPlayer().getPhoto() : "NONE"); 
					
					_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, entries[i].getPlayer().getID(), playerName, playerPhoto, 0), bestStage : entries[i].getScore()});
				}
				
				if(_contextFriends.length <= 3){
					_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10});
					_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30});
					_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50});
				}
				
				if(inCompleteCallback){
					inCompleteCallback();
				}
			})
			.catch(function(err){
				if(inFailCallback){
					inFailCallback(err);
				}
			})
		}
		
	};
	
	this.initContextFriendsLocal = function(){
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '1', 'AUHA', 'default_thumb', 0), bestStage : 10});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '2', 'FANTA', 'default_thumb', 0), bestStage : 30});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '3', 'STICK', 'default_thumb', 0), bestStage : 50});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '4', 'AHURA', 'default_thumb', 0), bestStage : 55});
		_contextFriends.push({'profileInfo' : new ProfileInfoModel(0, '5', 'SUN', 'default_thumb', 0), bestStage : 27});
	};
	
	this.getContextFriends = function(){
		return _contextFriends;
	};
	
	this.setContextFriedsCount = function(inValue){
		this.contextFriendCount = inValue;
	}
	
	this.saveLederBoardData = function(){
		if(window.FBInstant){
			this.lederBoardData.setScoreAsync(this.saveData.getBestStage())
			.then(function(entry){
				StzLog.print(entry.getScore());
			})
			.catch(function(err){
				//리더보드 세이브 실패
				StzLog.print(JSON.stringify(err));
			});
			
			if(this.contextLederBoardData){
				this.contextLederBoardData.setScoreAsync(this.saveData.getBestStage())
				.then(function(entry){
					StzLog.print(entry.getScore());
				})
				.catch(function(err){
					//리더보드 세이브 실패
					StzLog.print(JSON.stringify(err));
				});
			}
		}
	};
};

var PlayerDataManager = new PlayerDataManager_proto();