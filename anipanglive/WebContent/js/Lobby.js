
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
	this.createListItemView();
	
	this.scene.fBitmap_5_png.inputEnabled = true;
	this.scene.fBitmap_5_png.events.onInputUp.add(this.onStartGame, this);
};

Lobby.prototype.createListItemView = function() {
	var maskW = 600
    var maskH = 200
    var boxW = maskW
    var boxH = 50

   this.listView = new ListView(this.game, this.world, new Phaser.Rectangle(60, 180, 375, 266), {
      direction: 'x',
      padding: 10,
      searchForClicks:true
    });

    for (var i = 0; i < 10; i++) {
    	
//      var img = this.game.add.image(0, 0, this.scene.fGroupItemList.generateTexture());
//      img.inputEnabled = true;
//      img.events.onInputUp.add(this.test, this);
      var group = this.game.make.group(this.scene);
      
      var buttonUP = this.game.add.sprite(0,0,"mainUI", "btnItemBg.png", group);
      buttonUP.name = "up"+ i;
      buttonUP.inputEnabled = true;
      buttonUP.events.onInputUp.add(this.test, this);
      buttonUP.scale.set(0.9, 0.9);
      
      var buttonDown = this.game.add.sprite(0,110,"mainUI", "btnItemBg.png", group);
      buttonDown.name = "down"+ i;
      buttonDown.inputEnabled = true;
      buttonDown.events.onInputUp.add(this.test, this);
      buttonDown.scale.set(0.9, 0.9);
      
      var starUP = this.game.add.sprite(22,25,"mainUI", "ico_item_star.png", group);
      var starDown = this.game.add.sprite(22,135,"mainUI", "ico_item_star.png", group);
     
      group.add(buttonUP);
      group.add(buttonDown);
      group.add(starUP);
      group.add(starDown);
      //this.scene.fGroupItemList.z = 0;
      //var test=[buttonUP,buttonDown];
      this.listView.add(group);
     
      //this.listView.addListeners(onUpdate, this.test);
      //listView.inputEnabled = true;
     //listView.addMultiple(buttonUP, buttonDown);
    }
};

Lobby.prototype.test = function(sprite, pointer) {
	StzCommon.StzLog.print("[Menu] onBtnClick - sprite: " + sprite.name);
	 //this.listView.setPosition(pointer);
	if(sprite.frameName === "btnItemBg.png"){
		sprite.frameName = "btnItemClickedBg.png";
	}
	else{
		sprite.frameName = "btnItemBg.png";
	}
};

Lobby.prototype.onStartGame = function() {
	this.game.state.add("InGame", InGame);
	this.game.state.start("InGame");
};