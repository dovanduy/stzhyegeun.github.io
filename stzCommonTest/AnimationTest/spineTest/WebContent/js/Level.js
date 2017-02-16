/**
 * Level state.
 */
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

Level.prototype.preload = function(){
	  this.game.plugins.add(PhaserSpine.SpinePlugin);
	  this.game.stage.disableVisibilityChange = true;

	  //this.game.load.spine('buddy', "assets/buddy_skeleton.json");
	  this.game.load.spine('buddy', "assets/sheep_hood.json");
	  //this.game.load.image('button1', "assets/btn_01.png");
	  //this.game.load.image('button2', "assets/btn_02.png");      
};