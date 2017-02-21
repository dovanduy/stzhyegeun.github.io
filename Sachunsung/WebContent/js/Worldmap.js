
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
Worldmap.prototype.stageDataArray = [];
Worldmap.prototype.worldMapPointArray = [{x:243, y:334} ,{x:221, y:230} ,{x:218, y:98}, {x:225, y:31}, //2
                                      {x:159, y:356}, {x:324, y:356}, {x:309, y:162}, {x:172, y:67}, //3
                                      {x:138, y:337}, {x:321, y:336}, {x:260, y:173}, {x:147, y:80}, //4
                                      {x:205, y:350}, {x:218, y:98}, {x:315, y:140}, {x:142, y:82}, //5
                                      {x:341, y:339}, {x:95, y:301}, {x:299, y:181}, {x:409, y:80}, //6
                                      {x:343, y:370}, {x:181, y:216}, {x:383, y:169}, {x:229, y:61}, //7
                                      {x:193, y:363}, {x:137, y:168}, {x:304, y:282}, {x:325, y:73}, //8
                                      ];
		

Worldmap.prototype.makeButton = function() {

	for(var i=0; i <= StzGameConfig.TOTAL_EPISODE_COUNT; i++){
		var stageData = {name:"", isClear:false,x:0,y:0};
		
		stageData = this.setStageData(i+1, stageData);
		stageData = this.setStagePoint(Math.floor(i/4)+1, (i%4)+1, stageData);
		
		this.stageDataArray.push(stageData);
	}

	for(var i =0; i < this.stageDataArray.length; i++){
		if(this.stageDataArray[i].x === -1) continue;
		
		var button = this.game.add.button(this.stageDataArray[i].x, this.stageDataArray[i].y, 'btnStage', null, this, 
				'disableStage.png', 'disableStage.png', 'disableStage.png');
		
		button.x = button.x - button.width/2;
		button.y = button.y - button.height/2;
		
		this.scrollingMap.addChild(button);
	}
	
//    
//	var button1 = this.game.add.button(150, 100, 'disableStage.png', 
//			null, this, 2, 1, 0);
//	
//	var button2 = this.game.add.button(200, 200, 'disableStage.png', 
//			null, this, 2, 1, 0);
//	
//	this.scrollingMap.addChild(button);
//	this.scrollingMap.addChild(button1);
//	this.scrollingMap.addChild(button2);
};

Worldmap.prototype.setStageData = function(stageNum, stageData){
	stageData.name = stageNum;
	stageData.isClear = this.currentEpisode > stageNum? true: false;
	
	return stageData;
};

Worldmap.prototype.setStagePoint = function(worldmapNum, worldmapInNum, stageData){

	var test = worldmapNum;
	if(test >= 8){
		 test = 4 + worldmapNum%4;
	}
	var test2 = 4*(test-1) + worldmapInNum-1;
	stageData.x = this.worldMapPointArray[test2].x;
	stageData.y = 403*(repeatConut-(worldmapNum+1)) + this.worldMapPointArray[test2].y;
	
	return stageData;
};

