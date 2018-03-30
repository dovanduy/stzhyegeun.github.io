/**
 *
 */
var EChageSoundListByEvent = [];
function Sounds (inAssets) {
	this.soundNameList = [];
	this.soundList = {};
	
	this.bgmList = [];
	this.effectSoundList = [];
	
	this.addAssetKeys(inAssets);
}

Sounds.prototype.addAssetKeys = function(inObject) {
	if (!inObject || typeof inObject != 'object') {
		return;
	}
	
	for (var keyValue in inObject) {
		
		if (typeof inObject[keyValue] != 'object') {
			continue;
		}
		
		if (inObject[keyValue].hasOwnProperty('key') === false) {
			this.addAssetKeys(inObject[keyValue]);
		} else {
			if (inObject[keyValue].hasOwnProperty('type') === false) {
				continue;
			}
			
			if (inObject[keyValue].type == 'audio') {
				this.soundNameList.push(inObject[keyValue].key);
			}
		}
	}
};

Sounds.prototype.createSound = function(game){
	StzLog.assert((this.soundNameList.length > 0), "사운드가 없습니다.");
	this.game = game;
	
	for(var i =0; i < this.soundNameList.length; i++){
		this.soundList[this.soundNameList[i]] =  this.game.add.audio(this.soundNameList[i]);
		var temp = this.soundNameList[i].split('_');
		if(temp[0] && temp[0] === 'bgm'){
			this.bgmList.push(this.soundNameList[i]);
		}
		else{
			this.effectSoundList.push(this.soundNameList[i]);
		}
	}
};


Sounds.prototype.sound = function(name){
	StzLog.assert((this.soundList[name]), "사운드가 없습니다.");
	
	if(EChageSoundListByEvent.indexOf(name) !== -1){
		name = this._changeSoundNameByEvent(name);
	}
	
	return this.soundList[name];
};

Sounds.prototype.toggleMusic = function(isValue){
	for(var i = 0; i<this.bgmList.length; i++){
		this.soundList[this.bgmList[i]].volume = isValue;
	}
};

Sounds.prototype.toggleSound = function(isValue){
	for(var i = 0; i<this.effectSoundList.length; i++){
		this.soundList[this.effectSoundList[i]].volume = isValue;
	}
};

Sounds.prototype._changeSoundNameByEvent = function(inCurName){
	var name = inCurName;
	
	if(EventManager.getEventByType(EEventType.EVENT_INGAME_BACKGROUND)){
		var changeName = inCurName + "_" + EventManager.getEventByType(EEventType.EVENT_INGAME_BACKGROUND).getEtc();
		if(this.soundList[changeName]){
			name = changeName;
		}
	}

	return name;
};

Sounds.prototype.allStop = function(isBgmFadeOut){
	isBgmFadeOut = false;
	for(var i =0; i < this.bgmList.length; i++){
		if(this.sound(this.bgmList[i]).isPlaying === true){
			if(isBgmFadeOut === true){
				this.game.add.tween(this.soundList[this.bgmList[i]]).to({volume : 0}, 300, Phaser.Easing.Linear.None, true)
				.onComplete.addOnce(function(bgm){
					bgm.stop();
				}.bind(this, this.soundList[this.bgmList[i]]));
			}
			else{
				this.soundList[this.bgmList[i]].stop();
			}
		}
	}
	
	for(var i =0; i < this.effectSoundList.length; i++){
		if(this.sound(this.effectSoundList[i]).isPlaying === true){
			this.sound(this.effectSoundList[i]).stop();
		}
	}
};