function Worldmap() {
	Phaser.State.call(this);
	
	this.currentEpisode = 1;
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Worldmap.prototype = proto;

var cursors;

Worldmap.prototype.preload = function() {
	
};

Worldmap.prototype.create = function() {
	this.game.world.setBounds(0, 0, 0, 2000);
	
	this.game.add.sprite(0, 480, 'worldmap1');
	
	 cursors = this.game.input.keyboard.createCursorKeys();
};

Worldmap.prototype.update = function() {

    if (cursors.left.isDown)
    {
    	this.game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
    	this.game.camera.x += 4;
    }

    if (cursors.up.isDown)
    {
    	this.game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
    	this.game.camera.y += 4;
    }
}