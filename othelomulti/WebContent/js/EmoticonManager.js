EmoticonManager.prototype = {
		inGame:null,
		aParent:null,
		scene:null,
		emoticon:null,
		callBackFunc:null,
		tween:null
};

function EmoticonManager(ingame, aParent, atlasName, options) {
	this.inGame = ingame;
	this.aParent = aParent;
	this.scene = aParent.scene;
	this.callBackFunc = null;
	this.tween = null;
	
	this.emoticon = this.inGame.add.sprite(0, 0, atlasName);
	this.scene.fGroupChip.add(this.emoticon);
	
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

EmoticonManager.prototype.setPos = function(x,y){
	this.emoticon.x = x;
	this.emoticon.y = y;
};

EmoticonManager.prototype.show = function(imageName){
	this.emoticon.frameName = imageName;
	this.emoticon.visible = true;
	this.emoticon.alpha = 0;
	
	if(this.tween !== null){
		this.inGame.tweens.remove(this.tween);
		this.tween = null;
	}
	
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