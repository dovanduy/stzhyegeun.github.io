function FbManager_proto () {
	if (!(this instanceof FbManager_proto)) {
		return new FbManager_proto();
	}
	this.init = function(inGame){
		this.game = inGame;
	};

	this.shareResult = function (inData) {
		if (window.FBInstant) {
			FBInstant.context.chooseAsync().then(function () {
				StzLog.print("share result");
				this.updateAsyncByInviteUpdateView(EShareType.RESULT, inData);
			}.bind(this)).catch(function() {
				
			});
		}
	};
	
	this.inviteFriend = function(inCompleteCallback, inFailCallback, inContext){
		if (window.FBInstant) {
			FBInstant.context.chooseAsync().then(function() {
				this.game.input.enabled = false;
				StzLog.print("Invite friends.");
				this.updateAsyncByInviteUpdateView(EShareType.INVITE);
				
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
					this.game.input.enabled = true;
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
	};
	
	this.updateAsyncByInviteUpdateView = function(inType, inData){
		var ctrText = "";
		var decText = "";

		if(inType === EShareType.INVITE){
			ctrText = StzTrans.translate(StaticManager.ELocale.share_msg_invite_button);
			decText = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_invite_text), 
					{player_name: PlayerDataManager.getPlayer().profileInfo.getName(), game_name : "Dino Runz"});
		}
		else if(inType === EShareType.CHARACTER){
			ctrText = StzTrans.translate(StaticManager.ELocale.share_msg_character_button);
			decText = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_character_text), 
					{character_name : inData.name});
		}
		else if(inType === EShareType.RESULT){
			ctrText = StzTrans.translate(StaticManager.ELocale.share_msg_fail_button);
			decText = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_fail_text), 
				{stage_num: inData.stage});
		}
		else if(inType === EShareType.CROWN){
			ctrText = StzTrans.translate(StaticManager.ELocale.share_msg_crown_button);
			decText = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_crown_text),
				{player_name: PlayerDataManager.getPlayer().profileInfo.getName(), stage_num: inData.stage, 
					crown_grade: (inData.crown === 2) ? StzTrans.translate(StaticManager.ELocale.gold_crown) : StzTrans.translate(StaticManager.ELocale.silver_crown)});
		}
		else if(inType === EShareType.CLEAR){
			ctrText = StzTrans.translate(StaticManager.ELocale.share_msg_clear_button);
			decText = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_clear_text),
				{player_name: PlayerDataManager.getPlayer().profileInfo.getName(), stage_num: inData.stage, game_name: "Dino Runz"});
		}

		Server.setLog(EServerLogMsg.SHARE, {'p1' : inType, 'p2' : 'try'});

		if (window.FBInstant) {
			if (inType !== EShareType.INVITE) {
				if(!FBInstant.context.getID()) return;//친구 초대를 제외한 나머지 메시지는 컨텍스트 소속일 때에만 전송.
			}

			var captureCanvas = new InviteUpdateView(this.game);
			captureCanvas.setData(inType, inData);

			var captured = StzUtil.getScreenCapture(this.game, 0, 0, captureCanvas.width, 380, null, captureCanvas); //캐릭터 앵글을 돌리면 스프라이트 영역이 커지면서 캐릭터를 적절한 위치에 놓을 시 배경 이미지의 높이 380을 넘어버려 (넘은 값 - 380) 영역만큼 검은 배경이 더 그려져서 380으로 고정.
			FBInstant.updateAsync({
				action: "CUSTOM", 
				template: "invite", 
				cta: ctrText,
				image: captured, 
				text: {
					default : decText
				}, 
				data: {}, 
				strategy: "IMMEDIATE", 
				notification: "PUSH"
			}).then(function() {
				Server.setLog(EServerLogMsg.SHARE, {'p1' : inType, 'p2' : 'complete'});
				StzLog.print("invite message sent.");
			}).catch(function(e) {
				StzLog.print("updateAsync error: " + JSON.stringify(e));
			 }.bind(this));	
		}
	};
}
