DinoRunz.isLoadNeedData = false;

DinoRunz.Storage = {
	UserData : {
		lastClearedStage: 1, 
		lastCharacterId: 1,//마지막으로 선택된 캐릭터 인덱스.
		lastFallenBlockId: 0,//떨어진 블록 인덱스.
		shareCount: 0,//공유카운트.
		isAllClearList: [],
		isCurGetValueList: [],//공룡을 얻기 위해 조건을 수행한 카운트 저장.
		
		isGetDinoList: [],//서버 저장 안함.
		lockDinoData: []//서버 저장 안함.
	}, 
	
	updateIsAllClear: function(inStage, isAllJewelClear, isAllPathClear) {
		if (!DinoRunz.Storage.UserData.isAllClearList) {
			DinoRunz.Storage.UserData.isAllClearList = [];
		}
		
		var clearValue = 0;
		if (isAllJewelClear) {
			clearValue++;
			if(isAllPathClear) clearValue++;
		}
		
		if (DinoRunz.Storage.UserData.isAllClearList[inStage - 1]) {
			if (DinoRunz.Storage.UserData.isAllClearList[inStage - 1] >= clearValue) {
				return;
			}
		}
		
		DinoRunz.Storage.UserData.isAllClearList[inStage - 1] = clearValue;
	}, 
	
	isAllClear: function(inStage) {
		if (!DinoRunz.Storage.UserData.isAllClearList[inStage - 1]) {
			return false;
		} 
		return (DinoRunz.Storage.UserData.isAllClearList[inStage - 1] === 1 ? true : false);
	}, 
	
	getAllClearValue: function(inStage) {
	    if (!DinoRunz.Storage.UserData.isAllClearList[inStage - 1]) {
            return 0;
        } 
        return DinoRunz.Storage.UserData.isAllClearList[inStage - 1];
	}, 
	
	getUserData: function() {
		return new Promise(function(resolve, reject) {
			var lastStageItem = 1;
			var lastCharacterId = 1;
			var lastFallenBlockId = 0;
			var shareCount = 0;
			var isAllClearListItem = [];
			var isCurGetValueList = [];
			if (typeof(Storage) !== "undefined") {
				lastStageItem = parseInt(localStorage.getItem("lastClearedStage"));
				lastStageItem = (isNaN(lastStageItem) === true ? 1 : lastStageItem);
				isAllClearListItem = JSON.parse(localStorage.getItem("isAllClearList"));
				lastCharacterId = parseInt(localStorage.getItem("lastCharacterId"));
				lastCharacterId = (isNaN(lastCharacterId) === true ? 1 : lastCharacterId);
				isCurGetValueList = JSON.parse(localStorage.getItem("isCurGetValueList"));
				lastFallenBlockId = parseInt(localStorage.getItem("lastFallenBlockId"));
				lastFallenBlockId = (isNaN(lastFallenBlockId) === true ? 1 : lastFallenBlockId);
				shareCount = parseInt(localStorage.getItem("shareCount"));
				shareCount = (isNaN(shareCount) === true ? 0 : shareCount);

				if (isAllClearListItem === null) {
					isAllClearListItem = [];
				}

				if (isCurGetValueList === null) {
					isCurGetValueList = [];
					
					var i, length = StaticManager.dino_runz_character.length;
					for(i=0;i<length;++i){
						var curData = StaticManager.dino_runz_character.get(i+1);
						if(curData.unlock_condition === ECharacter.UnlockCondition.VIDEO){

							isCurGetValueList.push((i+1)+"|"+0);
						}
					}
				}
			} 
			
			var result = {
				lastClearedStage: lastStageItem, 
				isAllClearList: isAllClearListItem,
				lastCharacterId: lastCharacterId,
				shareCount: shareCount,
				isCurGetValueList: isCurGetValueList,
				lastFallenBlockId: lastFallenBlockId
			};
			
			if (window.FBInstant) {
				FBInstant.player.getDataAsync(["lastClearedStage", "isAllClearList", "lastFallenBlockId", "shareCount", "isCurGetValueList"]).then(function(data) {
					var fbLastStage = parseInt(data.lastClearedStage);
					fbLastStage = (isNaN(fbLastStage) === true ? 1 : fbLastStage);
					if (fbLastStage > result.lastClearedStage) {
						result.lastClearedStage = fbLastStage;
					}
					
					if (data.hasOwnProperty("isAllClearList")) {
						var fbIsAllClearList = JSON.parse(data.isAllClearList);
						if (fbIsAllClearList !== null && fbIsAllClearList.length > result.isAllClearList.length) {
							result.isAllClearList = fbIsAllClearList;
						}
					} 
					resolve(result);
				}).catch(function(err) {
					reject(err);
				});
			} else {
				resolve(result);
			}
		});
	}, 
	
	setUserData: function() {
		return new Promise(function(resolve, reject) {
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem("lastClearedStage", DinoRunz.Storage.UserData.lastClearedStage);
				if (!DinoRunz.Storage.UserData.isAllClearList) {
					DinoRunz.Storage.UserData.isAllClearList = [];
				}

				DinoRunz.Storage.UserData.isAllClearList = DinoRunz.Storage.UserData.isAllClearList.map(function(inItem) {
					if (inItem === null || inItem === undefined) {
						return 0;
					}
					return inItem;
				});

				
				localStorage.setItem("isAllClearList", JSON.stringify(DinoRunz.Storage.UserData.isAllClearList));
				localStorage.setItem("lastCharacterId", DinoRunz.Storage.UserData.lastCharacterId);
				localStorage.setItem("lastFallenBlockId", DinoRunz.Storage.UserData.lastFallenBlockId);
				localStorage.setItem("isCurGetValueList",  JSON.stringify(DinoRunz.Storage.UserData.isCurGetValueList));
				localStorage.setItem("shareCount",  DinoRunz.Storage.UserData.shareCount);
			}
			
			var result = {
				lastClearedStage: DinoRunz.Storage.UserData.lastClearedStage, 
				isAllClearList: JSON.stringify(DinoRunz.Storage.UserData.isAllClearList),
				lastCharacterId: DinoRunz.Storage.UserData.lastCharacterId,
				shareCount: DinoRunz.Storage.UserData.shareCount,
				lastFallenBlockId: DinoRunz.Storage.UserData.lastFallenBlockId,
				isCurGetValueList: JSON.stringify(DinoRunz.Storage.UserData.isCurGetValueList)
			};
			
			if (window.FBInstant) {
				FBInstant.player.setDataAsync(result).then(function() {
					var extraData = {fallenBlockId: DinoRunz.Storage.UserData.lastFallenBlockId};
					extraData = JSON.stringify(extraData);
					
					PlayerDataManager.saveLederBoardData(extraData, resolve);
				}).catch(function(err) {
					reject(err);
				});
			} else {
				resolve(result);
			}
		});
	}, 
	
	updateShareCount: function(inValue) {
		this.UserData.shareCount += inValue;
	}, 
	
	resetUserData: function() {
		this.UserData.lastClearedStage = 1, 
		this.UserData.lastCharacterId = 1,//마지막으로 선택된 캐릭터 인덱스.
		this.UserData.lastFallenBlockId = 0,//떨어진 블록 인덱스.
		this.UserData.shareCount = 0,//공유카운트.
		this.UserData.isAllClearList = [],
		this.UserData.isCurGetValueList = [],//공룡을 얻기 위해 조건을 수행한 카운트 저장.
		
		this.UserData.isGetDinoList = [],//서버 저장 안함.
		this.UserData.lockDinoData = [];//서버 저장 안함.
					
		var i, length = StaticManager.dino_runz_character.length;
		var curData = null;
		for(i=0;i<length;++i){
			curData = StaticManager.dino_runz_character.get(i+1);
			if(curData.unlock_condition === ECharacter.UnlockCondition.VIDEO){
				this.UserData.isCurGetValueList.push((i+1)+"|"+0);
			}
		}
		
		length = this.UserData.isCurGetValueList.length;
		for(i=0;i<length;++i){
			curData = this.UserData.isCurGetValueList[i];
			curData = curData.split("|");
			DinoRunz.Storage.UserData.lockDinoData[i] = {charId:parseInt(curData[0]), curValue:parseInt(curData[1])};
		}

		this.setUserData();
	},
	
	getBestStage: function () {
		return this.UserData.lastClearedStage;
	},

	setGetDinoList : function (charId, isGetDino) {
		this.UserData.isGetDinoList[charId - 1] = isGetDino;
	}
};

DinoRunz.Preloader = function (game) {};
var Preloader_proto = Object.create(Phaser.State);
DinoRunz.Preloader.prototype = Preloader_proto;

DinoRunz.Preloader.prototype.init = function() {	
	DinoRunz.Storage.UserData.lastClearedStage = 0;
	Server.setLog(EServerLogMsg.INIT_STEP, {'p1' : EInitStep.INSTANT});
};

DinoRunz.Preloader.prototype.preload = function() {
	this.game.load.onFileComplete.add(this.fileComplete, this);
	this.game.load.pack("title", "assets/assets-pack.json");
};

DinoRunz.Preloader.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
	var prog = 15 + Math.floor(70 * (totalLoaded - 1) / totalFiles);
    if (window.FBInstant) {
    	FBInstant.setLoadingProgress(prog);
   	}
};

DinoRunz.Preloader.prototype.create = function() {
	this.game.load.onFileComplete.removeAll();

	leaderboard.onPlayWithFriendCallback = function (inFriend, inBoardType) {
		FbManager.updateAsyncByInviteUpdateView(EShareType.INVITE);
		DinoRunz.Storage.updateShareCount(1);
		DinoRunz.Storage.setUserData();
	};

	leaderboard.onInviteFriendCallback = function() {
		FbManager.updateAsyncByInviteUpdateView(EShareType.INVITE);
		DinoRunz.Storage.updateShareCount(1);
		DinoRunz.Storage.setUserData();
	};

	window.sounds.createSound(this.game);

	this.game.state.start("Title", true, false, DinoRunz.InGame.EGameMode.RUN, DinoRunz.Storage.UserData.lastClearedStage);
	
	if(FBInstant){
		FBInstant.startGameAsync().then(function() {
			var fbEntryPointData = FBInstant.getEntryPointData();
		     if (fbEntryPointData) {
		         // 게임 진입 경로 체크 
		         if (fbEntryPointData.hasOwnProperty("logEventName") && typeof fbEntryPointData.logEventName === "string") {
		             if (fbEntryPointData.logEventName.indexOf(ELogEvent.SEND_MESSAGE_SHARE_RANKING) >= 0) {
		            	 Server.setLog(EServerLogMsg.GAME_INIT, {'p1' : 'user_share', 'p2' : 'rank'});
		             }
		             if (fbEntryPointData.logEventName.indexOf(ELogEvent.SEND_MESSAGE_SHARE_RESULT) >= 0) {
		            	 Server.setLog(EServerLogMsg.GAME_INIT, {'p1' : 'update_share', 'p2' : 'result'});
		             }
		             if (fbEntryPointData.logEventName.indexOf(ELogEvent.SEND_MESSAGE_SHARE_TITLE) >= 0) {
		            	 Server.setLog(EServerLogMsg.GAME_INIT, {'p1' : 'update_share', 'p2' : 'title'});
		             }
		             if (fbEntryPointData.logEventName.indexOf(ELogEvent.SEND_MESSAGE_SHARE_CHARACTER) >= 0) {
		            	 Server.setLog(EServerLogMsg.GAME_INIT, {'p1' : 'update_share', 'p2' : 'character'});
		             }
		             if (fbEntryPointData.logEventName.indexOf(ELogEvent.SEND_MESSAGE_SHARE_FREECOIN) >= 0) {
		            	 Server.setLog(EServerLogMsg.GAME_INIT, {'p1' : 'update_share', 'p2' : 'freecoin'});
		             }
		       }
			}
			
			var getUserData = DinoRunz.Storage.getUserData();
			getUserData.then(function(inUserData) {
				DinoRunz.Storage.UserData.lastClearedStage = inUserData.lastClearedStage;
				DinoRunz.Storage.UserData.lastCharacterId = inUserData.lastCharacterId;
				DinoRunz.Storage.UserData.isAllClearList = (inUserData.isAllClearList === null ? [] : inUserData.isAllClearList);
				DinoRunz.Storage.UserData.isCurGetValueList = inUserData.isCurGetValueList;
				DinoRunz.Storage.UserData.lastFallenBlockId = inUserData.lastFallenBlockId;
				DinoRunz.Storage.UserData.shareCount = inUserData.shareCount;

				var i, j, length = inUserData.isCurGetValueList.length, curData, compareData;
				
				for(i=0;i<length;++i){
					curData = inUserData.isCurGetValueList[i];
					curData = curData.split("|");
					DinoRunz.Storage.UserData.lockDinoData[i] = {charId:parseInt(curData[0]), curValue:parseInt(curData[1])};
				}
			}.bind(this));
			
			var getInitLeaderboard = new Promise(function (resolve, reject) {
				FBInstant.getLeaderboardAsync(InGameConfig.SCORE_LEADER_BOARD_NORMAL)
				.then(function(leaderboard){
					PlayerDataManager.lederBoardData = leaderboard;
					StzLog.print('leaderboard is loaded');
					leaderboard.getEntryCountAsync()
					.then(function(count){
						PlayerDataManager.setFriedsCount(count);
						PlayerDataManager.initFriends(function(){
							resolve(true);
						}.bind(this), 
						function(err){
							reject(err);
						}.bind(this));
					})
					.catch(function(err){
						reject(err);
					});
				}).catch(function(err){
					reject(err);
				});
			});
			
			var getInitContextLeaderboard = new Promise(function (resolve, reject) {
				var contextID = FBInstant.context.getID();
				if(FBInstant.context && FBInstant.context.getID()){
					//리더보드 불러오는 부분
					var leaderboardName = InGameConfig.SCORE_LEADER_BOARD_CONTEXT + FBInstant.context.getID();
					FBInstant.getLeaderboardAsync(leaderboardName)
					.then(function(leaderboard){
						PlayerDataManager.contextLederBoardData = leaderboard;
						StzLog.print('contextLeaderboard is loaded');
						//리더보드에 친구 숫자 불러오는 부분
						leaderboard.getEntryCountAsync()
						.then(function(count){
							PlayerDataManager.setContextFriedsCount(count);
							//리더보드 정보 가져오는 부분
							PlayerDataManager.initContextFriends(function(){
								resolve(true);
							}.bind(this), 
							function(err){
								reject(err);
							}.bind(this));
						})
						.catch(function(err){
							reject(err);
						});
					}).catch(function(err){
						StzLog.print(err);
						reject(err);
					});
				}
				else{
					PlayerDataManager.contextLederBoardData = null;
					resolve(true);
				}
			});
			
			var getFBFriends = FBInstant.player.getConnectedPlayersAsync();
			getFBFriends.then(function(FBFriends) {
				var i;
				var length = FBFriends.length;
				for(i=0;i<length;++i){
					leaderboard.friendList.push({
						name: FBFriends[i].getName(), 
						platform_id: FBFriends[i].getID(), 
						image: FBFriends[i].getPhoto(), 
					});
				}
			});
			
			Promise.all([getUserData, getInitContextLeaderboard, getFBFriends]).then(function (values) {
				PlayerDataManager.setPlatformId((window.FBInstant ? FBInstant.player.getID() : "103112311"));
				
				var playerName = (window.FBInstant ? FBInstant.player.getName() : "GUEST");
				var playerPhoto = (window.FBInstant ? FBInstant.player.getPhoto() : "default_thumb"); 
				
				PlayerDataManager.saveData = DinoRunz.Storage;
				PlayerDataManager.profileInfo = new ProfileInfoModel(0, FBInstant.player.getID(), playerName, 
						playerPhoto, 0);//set player profile info
				
				// this.game.state.start("Title", true, false, DinoRunz.InGame.EGameMode.RUN, DinoRunz.Storage.UserData.lastClearedStage);
				var contextFriends = PlayerDataManager.getContextFriends();
				var worldFriends = PlayerDataManager.getFriends();

				if(contextFriends.length === 1 || contextFriends.length === 2) {
					//add dummyFriends
					PlayerDataManager.initContextFriendsLocal();
				}

				if(worldFriends.length === 1 || worldFriends.length === 2) {
					//add dummyFriends
					PlayerDataManager.initFriendsLocal();
				}

				PlayerDataManager.sortFriends("bestStage", PlayerDataManager.ESortOrder.DESCEND);
				PlayerDataManager.sortContextFriends("bestStage", PlayerDataManager.ESortOrder.DESCEND);				

				DinoRunz.isLoadNeedData = true;
			}.bind(this));
		}.bind(this));
	} 
	else {
		DinoRunz.Storage.getUserData().then(function(inUserData) {
			DinoRunz.Storage.UserData.lastClearedStage = inUserData.lastClearedStage;
			DinoRunz.Storage.UserData.lastCharacterId = inUserData.lastCharacterId;
			DinoRunz.Storage.UserData.isAllClearList = (inUserData.isAllClearList === null ? [] : inUserData.isAllClearList);
			DinoRunz.Storage.UserData.isCurGetValueList = inUserData.isCurGetValueList;
			DinoRunz.Storage.UserData.lastFallenBlockId = inUserData.lastFallenBlockId;
			DinoRunz.Storage.UserData.shareCount = inUserData.shareCount;

			var i, j, length = inUserData.isCurGetValueList.length, curData, compareData;
				
			for(i=0;i<length;++i){
				curData = inUserData.isCurGetValueList[i];
				curData = curData.split("|");
				DinoRunz.Storage.UserData.lockDinoData[i] = {charId : parseInt(curData[0]), curValue : parseInt(curData[1])};
			}

			if (false) {
				$.get("/maps", function(data) {
					if (!data) {
						// this.game.state.start("Title", true, false, DinoRunz.InGame.EGameMode.EDIT, DinoRunz.Storage.UserData.lastClearedStage);
					} else {
						DinoRunz.InGame.MAPS = {};
						var maxStage = 0;
						for (var i = 0; i < data.length; i++) {
							var currentData = data[i];
							DinoRunz.InGame.MAPS[currentData.stage] = {
								speed: currentData.speed,
								path: currentData.path
							};
							if (maxStage < currentData.stage) {
								maxStage = currentData.stage;
							}
						}
						DinoRunz.InGame.MAPS.length = maxStage;
					}
					
					// this.game.state.start("Title", true, false, DinoRunz.InGame.EGameMode.EDIT, DinoRunz.Storage.UserData.lastClearedStage);
				}.bind(this));
			} else {
				
				var playerId = (window.FBInstant ? FBInstant.player.getID() : "103112311");
				var playerName = (window.FBInstant ? FBInstant.player.getName() : "GUEST");
				var playerPhoto = (window.FBInstant ? FBInstant.player.getPhoto() : "default_thumb"); 
				
				PlayerDataManager.saveData = DinoRunz.Storage;
				PlayerDataManager.profileInfo = new ProfileInfoModel(0, playerId, playerName, 
						playerPhoto, 0);//set player profile info

				// PlayerDataManager.initFriendsLocal();
				// PlayerDataManager.sortFriends("bestStage", PlayerDataManager.ESortOrder.DESCEND);

				// PlayerDataManager.initContextFriendsLocal();
				// PlayerDataManager.sortContextFriends("bestStage", PlayerDataManager.ESortOrder.DESCEND);
				DinoRunz.isLoadNeedData = true;
			}
		}.bind(this));
	}
};

