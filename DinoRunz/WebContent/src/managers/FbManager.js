
function FbManager_proto () {
	if (!(this instanceof FbManager_proto)) {
		return new FbManager_proto();
	}
	this.init = function(inGame){
		this.game = inGame;
	};
	
	this.inviteFriend = function(inCompleteCallback, inFailCallback, inContext){
		if (window.FBInstant) {
			FBInstant.context.chooseAsync().then(function() {
				this.game.input.enabled = false;
				StzLog.print("Invite friends.");
				this.updateAsyncByInviteUpdateView();
				
				if(FBInstant.context && FBInstant.context.getID()){
					FBInstant.getLeaderboardAsync(InGameConfig.SCORE_LEADER_BOARD_CONTEXT + FBInstant.context.getID())
					.then(function(leaderboard){
						PlayerDataManager.contextLederBoardData = leaderboard;
						StzLog.print('contextLeaderboard is loaded');
						leaderboard.getEntryCountAsync()
						.then(function(count){
							PlayerDataManager.setContextFriedsCount(count);
							PlayerDataManager.initContextFriends(function(){
								this.game.input.enabled = true;
								PlayerDataManager.saveData.updateShareCount(1);
								if(inCompleteCallback){
									inCompleteCallback.call(inContext);
								}
							}.bind(this), 
							function(err){
								this.game.input.enabled = true;
								StzLog.print(JSON.stringify(err));
								PlayerDataManager.saveData.updateShareCount(1);
								if(inFailCallback){
									inFailCallback.call(inContext);
								}
							}.bind(this));
						}.bind(this))
						.catch(function(err){
							this.game.input.enabled = true;
							StzLog.print(JSON.stringify(err));
							PlayerDataManager.saveData.updateShareCount(1);
							if(inFailCallback){
								inFailCallback.call(inContext);
							}
						}.bind(this));
					}.bind(this)).catch(function(err){
						this.game.input.enabled = true;
						StzLog.print(JSON.stringify(err));
						PlayerDataManager.saveData.updateShareCount(1);
						if(inFailCallback){
							inFailCallback.call(inContext);
						}
					}.bind(this));
				}
				else{
					PlayerDataManager.saveData.updateShareCount(1);
					if(inFailCallback){
						inFailCallback.call(inContext);
					}
				}
			}.bind(this))
			.catch(function(err){
				this.game.input.enabled = true;
				PlayerDataManager.saveData.updateShareCount(1);
				if(inFailCallback){
					inFailCallback.call(inContext);
				}
			}.bind(this));
		}
		else{
			PlayerDataManager.saveData.updateShareCount(1);
			if(inCompleteCallback){
				inCompleteCallback.call(inContext);
			}
		}
	}
	
	this.updateAsyncByInviteUpdateView = function(){
		if (window.FBInstant) {
			var captureCanvas = new InviteUpdateView(this.game);
			var captured = StzUtil.getScreenCapture(this.game, 0, 0, captureCanvas.width, captureCanvas.height, null, captureCanvas);
			FBInstant.updateAsync({
				action: "CUSTOM", 
				template: "invite", 
				cta: 'text',
				image: captured, 
				text: 'test', 
				data: {}, 
				strategy: "IMMEDIATE", 
				notification: "PUSH"
			}).then(function() {
				StzLog.print("invite message sent.");
			}).catch(function(e) {
				StzLog.print("updateAsync error: " + JSON.stringify(e));
			 }.bind(this));	
		}
	};
};
