/**
 *
 */
function Preload () {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Preload.prototype = proto;

Preload.prototype.init = function() {
	
};

Preload.prototype.preload = function() {
	this.game.load.onFileComplete.add(this.fileComplete, this);
	this.game.load.onLoadComplete.add(this.loadComplete, this);
	this.game.load.pack("inGame", "assets/pack.json");
};

Preload.prototype.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
   var prog = 15 + Math.floor(70 * (totalLoaded - 1) / totalFiles);
    if (window.FBInstant) {
    	FBInstant.setLoadingProgress(prog);
   }
};

Preload.prototype.loadComplete = function () {
	// 바인딩을 제거하지 않으면 다른 스테이트의 로딩 완료 시, 여기서 또 처리됨.
	this.game.load.onLoadStart.removeAll();
	this.game.load.onFileComplete.removeAll();
	this.game.load.onLoadComplete.removeAll();

	
	leaderboard.onInviteFriendCallback = function() {
		FbManager.updateAsyncByInviteUpdateView(EShareType.INVITE);
		PlayerDataManager.saveData.updateShareCount(1);
	}.bind(this);
	
	leaderboard.onPlayWithFriendCallback = function(inFriend, inBoardType){
		FbManager.updateAsyncByInviteUpdateView(EShareType.INVITE);
		PlayerDataManager.saveData.updateShareCount(1);
	}.bind(this);
	
	window.sounds.createSound(this.game);
	if(window.FBInstant){
		window.FBInstant.startGameAsync().then(function() {
			this.commonScene = new CommonScene(this.game);
			this.commonScene.updateUIByTilte();
			
			var getSaveData = new Promise(function (resolve, reject) {
				FBInstant.player.getDataAsync(['stageNum', 'coin', 'characterID', 'freeCoinTimeStamp', 'shareCount', 'settingData'])
				.then(function(data){
					StzLog.print('data is loaded');
					resolve(data);
				}).catch(function(err){
					resolve({});
				});
			});

			var getCharacterData = new Promise(function (resolve, reject) {
				FBInstant.player.getDataAsync(['unLockCharacterID', 'unLcokCharactersValue'])
				.then(function(data){
					StzLog.print('data is loaded');
					resolve(data);
				}).catch(function(err){
					resolve({'unLockCharacterID' : '1', 'unLcokCharactersValue': null});
				});
			});
			
			var getFBFriends = new Promise(function (resolve, reject) {
				FBInstant.player.getConnectedPlayersAsync()
				.then(function(FBFriends){
					var i;
					var length = FBFriends.length;
					for(i=0;i<length;++i){
						leaderboard.friendList.push({
							name: FBFriends[i].getName(), 
							platform_id: FBFriends[i].getID(), 
							image: FBFriends[i].getPhoto(), 
						});
					}
					resolve(true);
				}).catch(function(err){
					resolve(true);
				});
			});
			
			var getInitLeaderboard = new Promise(function (resolve, reject) {
				FBInstant.getLeaderboardAsync(InGameConfig.SCORE_LEADER_BOARD_NOMAL)
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
				if(FBInstant.context && FBInstant.context.getID()){
					//리더보드 불러오는 부분
					FBInstant.getLeaderboardAsync(InGameConfig.SCORE_LEADER_BOARD_CONTEXT + FBInstant.context.getID())
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
						reject(err);
					});
				}
				else{
					PlayerDataManager.contextLederBoardData = null;
					resolve(true);
				}
			});
			
			Promise.all([getSaveData, getCharacterData, getFBFriends, getInitLeaderboard, getInitContextLeaderboard]).then(function (values) {
		
				var playerName = (window.FBInstant ? FBInstant.player.getName() : "GUEST");
				var playerPhoto = (window.FBInstant ? FBInstant.player.getPhoto() : "default_thumb"); 
				
				PlayerDataManager.profileInfo = new ProfileInfoModel(Server.serverId, FBInstant.player.getID(), playerName, 
						playerPhoto, 0);
				PlayerDataManager.saveData = new SaveDataModel();
				PlayerDataManager.saveData.setData(values[0]);
				
				var unLockCharacterID = (values[1] && values[1].hasOwnProperty('unLockCharacterID'))? values[1].unLockCharacterID : '1';
				var unLcokCharactersValue = (values[1] && values[1].hasOwnProperty('unLcokCharactersValue'))? values[1].unLcokCharactersValue : '';
				
				CharacterManager.init();
				CharacterManager.setIsOwenCharacters(unLockCharacterID);
				CharacterManager.setUnlockValue(unLcokCharactersValue);
				this.game.state.start("InGame", true, false, ESceneState.GO_TITLE_SCENE);
			}.bind(this));

		}.bind(this));
	}
	else{
		this.commonScene = new CommonScene(this.game);
		this.commonScene.updateUIByTilte();
		
		PlayerDataManager.profileInfo = new ProfileInfoModel(Server.serverId, PlayerDataManager.getPlatformId(), 'GUEST', 
				'default_thumb', 0);
		PlayerDataManager.saveData = new SaveDataModel();
		PlayerDataManager.initFriendsLocal();
		PlayerDataManager.initContextFriendsLocal();
		var unLockCharacterID = '1:5';
		var unLcokCharactersValue = '8:3, 1:1';
		
		CharacterManager.init();
		CharacterManager.setIsOwenCharacters(unLockCharacterID);
		CharacterManager.setUnlockValue(unLcokCharactersValue);
		
		this.game.state.start("InGame", true, false, ESceneState.GO_TITLE_SCENE);
	}
};

