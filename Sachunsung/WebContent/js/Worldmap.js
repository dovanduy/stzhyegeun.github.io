function Worldmap() {
	Phaser.State.call(this);
	
	this.currentEpisode = 1;
}

/** @type Phaser.State */
var worldmapBmd;

var proto = Object.create(Phaser.State);
Worldmap.prototype = proto;

var speedMult = 0.7;

var cursors;

Worldmap.prototype.preload = function() {
	
};

Worldmap.prototype.create = function() {

	this.makeWorldMap();

	cursors = this.game.input.keyboard.createCursorKeys();
	 
	this.makeButton();
};

Worldmap.prototype.update = function() {
	
    if (cursors.up.isDown)
    {    	
    	if(this.scrollingMap.y - 5 < -403*(repeatConut-2)){
    		return;
    	}
    	
    	this.scrollingMap.y -= 4;
    }
    else if (cursors.down.isDown)
    {
    	this.scrollingMap.y += 4;
    }

	 //this.game.y += 5;
	 //this.mountainsBack.tilePosition.y += 5;
};

var repeatConut;

Worldmap.prototype.makeWorldMap = function() {
	
	repeatConut = StzGameConfig.TOTAL_EPISODE_COUNT/4;
	var temp = this.game.make.bitmapData(this.game.width, 403);
	worldmapBmd = this.game.make.bitmapData(this.game.width, 403*(repeatConut));

	for(var i =5; i < repeatConut - 4; i++){
		var str = 'worldmap'+(5+((i-1)%4));
		temp.copy(str);
		worldmapBmd.draw(temp,0,  403*(repeatConut-i));
	}
	
	temp.copy('worldmap4');
	worldmapBmd.draw(temp,0,  403*(repeatConut-4));

	temp.copy('worldmap3');
	
	worldmapBmd.draw(temp,0,  403*(repeatConut-3));
	
	temp.copy('worldmap2');
	
	worldmapBmd.draw(temp,0,  403*(repeatConut-2));
	
	temp.copy('worldmap1');
	
	worldmapBmd.draw(temp,0,  403*(repeatConut-1));
	
	
	this.scrollingMap = this.game.add.image(0, 0, worldmapBmd);
	this.scrollingMap.y = -403*(repeatConut-2);
};

Worldmap.prototype.makeButton = function() {

	var button = this.game.add.button(150, 403*(repeatConut-2), 'btnStage', null, this, 'disableStage.png', 'disableStage.png', 'disableStage.png');
	
	var button1 = this.game.add.button(150, 100, 'disableStage.png', 
			null, this, 2, 1, 0);
	
	var button2 = this.game.add.button(200, 200, 'disableStage.png', 
			null, this, 2, 1, 0);
	
	this.scrollingMap.addChild(button);
	this.scrollingMap.addChild(button1);
	this.scrollingMap.addChild(button2);
};