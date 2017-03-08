EmoticonManager.prototype = {
		inGame:null,
		aParent:null,
		scene:null,
		emoticon:null,
		callBackFunc:null,
		tween:null
};

/**
 * 
 * @param ingame		게임 객체
 * @param aParent		부모 객체
 * @param atlasName		이모티콘의 atlas 키값
 * @param options		옵션 
 * scaleX	:스캐일 x값 
 * scaleY	:스캐일 y값
 * callBackFunc : 이모티콘 출력이 끝난 후 동작하는 콜백 함수
 */
function EmoticonManager(inGame, aParent, atlasName, options) {
	
	if(!(this instanceof EmoticonManager)){
		return new EmoticonManager(inGame, aParent, atlasName, options);
	}
	
	this.inGame = inGame;
	this.aParent = aParent;
	this.scene = aParent.scene;
	this.callBackFunc = null;
	this.tween = null;
	
	this.emoticon = this.inGame.add.sprite(0, 0, atlasName);

	if(options.scaleX !== undefined){
		this.emoticon.scale.x = options.scaleX;
	}
	
	if(options.scaleY !== undefined){
		this.emoticon.scale.y = options.scaleY;
	}
	
	if(options.callBackFunc !== undefined){
		this.callBackFunc = options.callBackFunc.bind(this.aParent);
	}
	
	this.emoticon.visible = false;
}

/**
 * 이모티콘을 띄울 위치 지정
 * @param x		이모티콘 x값
 * @param y		이모티콘 y값
 */
EmoticonManager.prototype.setPos = function(x,y){
	this.emoticon.x = x;
	this.emoticon.y = y;
};

/**
 * 이모티콘을 show
 * @param imageName	atals내부의 이모티콘의 이미지의 이름
 */
EmoticonManager.prototype.show = function(imageName){
	this.emoticon.frameName = imageName;
	this.emoticon.visible = true;
	this.emoticon.alpha = 0;
	
	if(this.tween !== null){
		this.inGame.tweens.remove(this.tween);
		this.tween = null;
	}
	
	//사라졌다가 나타나는 트윈 적용
	this.tween = this.inGame.add.tween(this.emoticon);
	this.tween.to( { alpha: 1 }, 1500, Phaser.Easing.Linear.None, true, 0, 0, true);
	
	this.tween.onComplete.addOnce(function() {
		this.tween = this.inGame.add.tween(this.emoticon);
		this.tween.to( { alpha: 0 }, 800, Phaser.Easing.Linear.None, true, 0, 0, true);
		
		this.tween.onComplete.addOnce(function() {
			this.emoticon.visible = false;
			if(this.callBackFunc !== null){
				this.callBackFunc();
				this.inGame.tweens.remove(this.tween);
				this.tween = null;
			}
			
		},this);
	},this);
};