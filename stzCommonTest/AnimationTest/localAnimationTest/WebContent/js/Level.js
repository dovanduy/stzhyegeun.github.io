function Level() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Level.prototype = proto;

Level.prototype.init = function(){
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
};

var buddy, game;
var fihsAnimation;
var fihsAnimation1;

var spineAnimation;

Level.prototype.create = function() {
	//note @유영선 스파인 애니매이션 로드(위치)
	spineAnimation.loadAnimation(400, 300);

	//플래시 애니매이션 사용하기 위해서 한번 등록
	dragonBones.game = this.game;
	this.game.time.events.loop(20, this.update, this);
	
	//플래시 애니매이션 로드 (위치, 라벨)
	fihsAnimation.loadAnimation(300, 500, "gold");
	fihsAnimation1.loadAnimation(300, 600, "baby");

    var button1 = this.game.add.button(20, 20, 'button1', function () {
    	//애니매이션 라벨에 따라 플레이
    	fihsAnimation.gotoAndPlay("baby");
    	fihsAnimation1.gotoAndPlay("gold");
    	spineAnimation.gotoAndPlay("BlockSelect", true);
    });
//
    var button2 = this.game.add.button(20, 130, 'button2', function () {
    	fihsAnimation.gotoAndPlay("mutant");
    	fihsAnimation1.gotoAndPlay("baby");
    	spineAnimation.gotoAndPlay("Idle1", true);
    });
};

Level.prototype.update = function(){
	dragonBones.animation.WorldClock.clock.advanceTime(0.02);	
};

Level.prototype.preload = function(){
	  //스파인 애니매이션 사용하기 위해서 한번 추가 
	  this.game.plugins.add(PhaserSpine.SpinePlugin);
	  this.game.stage.disableVisibilityChange = true;
	  
	  //플래시 애니매이션 생성
	  fihsAnimation = new DragonBones(this.game,{name:"fish_image", path:'assets/texture.png'}, 
			  							{name:"fish_atlas", path:'assets/texture.json'},
	  									"atlas1",
	  									{name:"fish", path:'assets/skeleton.json'});
	//플래시 애니매이션 생성
	  fihsAnimation1 = new DragonBones(this.game,{name:"fish_image", path:'assets/texture.png'}, 
				{name:"fish_atlas", path:'assets/texture.json'},
				"atlas1",
				{name:"fish", path:'assets/skeleton.json'});
	  
	//스파인 애니매이션 생성
	  spineAnimation = new SpineAnimation(this.game, 'buddy', "assets/sheep_hood.json");
	       
	  this.game.load.image('button1', "assets/btn_01.png");
	  this.game.load.image('button2', "assets/btn_02.png");      
};
