
/**
 * Menu state.
 */
function Lobby() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Lobby.prototype = proto;
var ListView = window.PhaserListView.ListView;

Lobby.prototype.preload = function() {
	this.scene = new lobbyScene(this.game);
};

Lobby.prototype.create = function() {
	var maskW = 600
    var maskH = 200
    var boxW = maskW
    var boxH = 50

    var listView = new ListView(this.game, this.world, new Phaser.Rectangle(60, 185, 375, 266), {
      direction: 'x',
      padding: 10,
      searchForClicks:true
      
    });

    for (var i = 0; i < 10; i++) {
    	
//      var img = this.game.add.image(0, 0, this.scene.fGroupItemList.generateTexture());
//      img.inputEnabled = true;
//      img.events.onInputUp.add(this.test, this);
      var group = this.game.make.group(this.scene);
      var buttonUP = this.game.add.button(0,0,"mainUI", this.test, this, "btnItemBg.png", "btnItemBg.png", 
    		  "btnItemClickedBg.png", "btnItemBg.png");
      buttonUP.name = "up"+ i;
      var buttonDown = this.game.add.button(0,120,"mainUI", this.test, this, "btnItemBg.png", "btnItemBg.png", 
    		  "btnItemClickedBg.png", "btnItemBg.png");
      buttonDown.name = "down"+ i;
      
      this.group.add(buttonUP);
      this.group.add(buttonDown);
      //this.scene.fGroupItemList.z = 0;
      //var test=[buttonUP,buttonDown];
      listView.add(group);
      //listView.inputEnabled = true;
     //listView.addMultiple(buttonUP, buttonDown);
    }

};

Lobby.prototype.test = function(sprite, pointer) {
	StzCommon.StzLog.print("[Menu] onBtnClick - sprite: " + sprite.name);
};

Lobby.prototype.startGame = function() {
	this.game.state.start("Level");
};