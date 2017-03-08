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

Level.prototype.create = function() {
	 //create the spine object
	
    buddy = this.game.add.spine(400, 300, "buddy");

    // play animation
    buddy.setAnimationByName(0, "BlockSelect", true);
    
    //call setup method for dragon bones
	this.addDragonBones();
    //start a run-loop for dragonbones, firing every 20ms
	this.game.time.events.loop(20, this.update, this);
//    var newSkin = buddy.createCombinedSkin('outfit02', 'vest', 'mask');
//
//    var button1 = this.game.add.button(20, 20, 'button1', function () {
//        buddy.setSkinByName('outfit01');
//        buddy.setToSetupPose();
//    });
//
//    var button1 = this.game.add.button(20, 130, 'button2', function () {
//        buddy.setSkinByName('outfit02');
//        buddy.setToSetupPose();
//    });
};

Level.prototype.update = function(){
	  // call advanceTime on the dragonBones world clock
  // to progress the animation.
  // For simplicity just using a hardcoded value of 0.02 secs
  // but ideally should evaluate how much time has really passed since last call
  // and send that value through instead
//	StzCommon.StzAnimation.advanceTime(0.02);
//	
//	StzCommon.StzAnimation.advanceTime = function() {
//		dragonBones.animation.WorldClock.clock.advanceTime(0.02);	
//	}
//	
//	StzCommon.StzAnimation.init(this.game);
//	StzCommon.StzAnimation.init = function(inGame) {
//		var dragonBones = new DragonBoes();
//		
//		dragonBones.game = inGame;
//	}
	dragonBones.animation.WorldClock.clock.advanceTime(0.02);	
};

Level.prototype.preload = function(){
	  this.game.plugins.add(PhaserSpine.SpinePlugin);
	  this.game.stage.disableVisibilityChange = true;
//
//	  //this.game.load.spine('buddy', "assets/buddy_skeleton.json");
	  this.game.load.spine('buddy', "assets/sheep_hood.json");
	  
	  this.game.load.image('fish_image', 'assets/texture.png');
	    // the texture atlas data (TexturePacker JSON Array format) for the dragon bones sprite 
	    // (loaded independently to make it easily accessible to dragonbones)
	  this.game.load.json('fish_atlas', 'assets/texture.json');
	    // load the texture atlas again so that it's content is registered in the atlas frame cache
	  this.game.load.atlas('atlas1', 'assets/texture.png', 'assets/texture.json');  
	    // the dragonbones skeleton data
	  this.game.load.json('fish', 'assets/skeleton.json');        
	  //this.game.load.image('button1', "assets/btn_01.png");
	  //this.game.load.image('button2', "assets/btn_02.png");      
};

Level.prototype.addDragonBones = function(){
	   //give dragonBones a reference to the game object
 dragonBones.game = this.game;

 // hardcoded ids for the dragonBones elements to target
 var armatureName = "fish_10001";//PigDragonBones";
 var skeletonId = "fish_10001";//piggy";
 var animationId = "gold";//run";
 // fetch the skeletonData from cache
 var skeletonJSON = this.game.cache.getJSON('fish');
 // fetch the atlas data from cache
 var atlasJson = this.game.cache.getJSON('fish_atlas');
 // make an array listing the names of which images to use from the atlas
 //var partsList = ["arm_front", "head_ninja", "body", "fore_leg", "rear_leg", "rear arm"];
 var partsList = [
             "m_eyef",
             "m_b3",
             "m_b2",
             "m_b1",
             "g_eyef",
             "g_b3",
             "g_b2",
             "g_b1",
             "g_eyeb",
             "eyef",
             "b3",
             "b2",
             "b1",
             "eyeb",
             "m_front",
             "g_front",
             "front",
             "m_head",
             "g_head",
             "head",
             "m_body",
             "g_body",
             "body",
             "m_top",
             "g_top",
             "top01",
             "m_tail",
             "g_tail",
             "tail",
             "m_rear01",
             "g_rear01",
             "rear01",
             "m_rear02",
             "g_rear02",
             "rear02",
             "m_top02",
             "g_top02",
             "top02"
             ];
 // fetch the atlas image
 var texture = this.game.cache.getImage("fish_image");
 // and the atlas id
 var atlasId = 'atlas1';
 // pass the variables all through to a utility method to generate the dragonBones armature

 var config = {
     armatureName: armatureName,
     skeletonId: skeletonId,
     animationId: animationId,
     atlasId: atlasId,
     partsList: partsList
 };

 var armature = dragonBones.makeArmaturePhaser(config, skeletonJSON, atlasJson, texture);

 //var armature = dragonBones.makePhaserArmature(armatureName, skeletonId, animationId, skeletonData, atlasJson, texture, partsList, atlasId);
 // get the root display object from the armature
 var bonesBase = armature.getDisplay();
 // position it
 bonesBase.x = 300;
 bonesBase.y = 500;
 // add it to the display list
 this.game.world.add(bonesBase);
};