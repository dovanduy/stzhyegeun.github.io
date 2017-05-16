	
function PopupLevelUp(inGame, aParent, options){
	if(!(this instanceof PopupLevelUp)){
		return new PopupLevelUp(inGame, aParent, options);
	}
	
	this.viewContext = aParent;
	this.scene = new PopupLevelUpScene(inGame);
	
	this.capturePosition = {
		'badge': {'x': 65, 'y': 350, 'width': 584, 'height': 534}, 
	};
	
	Phaser.Plugin.PopupManager.apply(this, arguments);

	this.scene.fBtnClose.inputEnabled = true;
	this.scene.fBtnClose.events.onInputUp.add(this.onClose, this);
	
	this.scene.fBtnShare.inputEnabled = true;
	this.scene.fBtnShare.events.onInputUp.add(this.OnClickShareButton, this);
}

PopupLevelUp.prototype = Object.create(Phaser.Plugin.PopupManager.prototype);
PopupLevelUp.prototype.constructor = PopupLevelUp;

/**
 * 
 * @param preBadgeData 게임 플레이 전 뱃지 데이터
 * @param curBadgeData 게임 플레이 후 뱃지 데이터
 */
PopupLevelUp.prototype.setData = function(preBadgeData, curBadgeData, isBadgeUp){
	var starAnimNum = preBadgeData.starCount*4;
	
	this.scene.fAnimBadgeStar.frame = starAnimNum;
	this.scene.fBigBadge.frame = preBadgeData.badgeGrade;
	this.scene.setText(preBadgeData);
	
	if(isBadgeUp === true){
		//뱃지 변경 애니매이션
		this.scene.createBadgeAnim(preBadgeData);
		//팝업 오픈 끝 난후 호출 되는 콜백에 뱃지 애니매이션 등록
		this.postPopupOpenCallback = this.scene.onPlayBadgeAnim.bind(this.scene, curBadgeData);
	}
	else{
		//별 증가 애니매이션
		this.scene.createStarAnim(preBadgeData.starCount);
		//팝업 오픈 끝 난후 호출 되는 콜백에 별 증가 애니매이션 등록
		this.postPopupOpenCallback = this.scene.onPlayStarAnim.bind(this.scene, curBadgeData);
	}
};

PopupLevelUp.prototype.OnClickShareButton = function() {
	if (window.FBInstant === null) {
		return;
	}
	
	if (FBInstant.getSDKVersion().indexOf('3.') >= 0) {
		var base64Picture = StzUtil.getScreenCapture(this.viewContext.game, this.capturePosition.badge.x, this.capturePosition.badge.y, this.capturePosition.badge.width, this.capturePosition.badge.height);
		FBInstant.shareAsync({
			intent: 'INVITE', 
			image: base64Picture,
			text: 'Play with ME!!', 
		}).then(function() {
			StzLog.print("[Result (OnClickShareButton)] Share Success!!");
		}).catch(function(err) {
			console.log('err: ' + err);
		});	
	} else {
		FBInstant.takeScreenshotAsync();
		FBInstant.endGameAsync().then(function() {
			this.popupClose();
		});
	}
};

PopupLevelUp.prototype.onClose = function(){
	this.popupClose();
};