
function Worldmap() {
	Phaser.State.call(this);
	
	this.currentEpisode = 1;
}

/** @type Phaser.State */
var worldmapBmd;

var proto = Object.create(Phaser.State);
Worldmap.prototype = proto;

var speedMult = 0.7;
var friction = 0.99;

var cursors;

Worldmap.prototype.preload = function() {
	
};

Worldmap.prototype.create = function() {

	this.makeWorldMap();

	cursors = this.game.input.keyboard.createCursorKeys();
	 
	this.makeButton();
};

Worldmap.prototype.update = function() {
	
//    if (cursors.up.isDown)
//    {    	
//    	if(this.scrollingMap.y - 5 < -403*(repeatConut-2)){
//    		return;
//    	}
//    	
//    	this.scrollingMap.y -= 4;
//    }
//    else if (cursors.down.isDown)
//    {
//    	this.scrollingMap.y += 4;
//    }

	 //this.game.y += 5;
	 //this.mountainsBack.tilePosition.y += 5;
	
	 if(this.scrollingMap.isBeingDragged){
         // save current map position
         this.scrollingMap.savedPosition = new Phaser.Point(this.scrollingMap.x, this.scrollingMap.y);
    }
	 else{
         // if the moving speed is greater than 1...
         if(this.scrollingMap.movingSpeed > 1){
              // adjusting map x position according to moving speed and angle using trigonometry
              this.scrollingMap.x += this.scrollingMap.movingSpeed * Math.cos(this.scrollingMap.movingangle);
              // adjusting map y position according to moving speed and angle using trigonometry
              this.scrollingMap.y += this.scrollingMap.movingSpeed * Math.sin(this.scrollingMap.movingangle);
              // keep map within boundaries
              if(this.scrollingMap.x < this.game.width - this.scrollingMap.width){
                   this.scrollingMap.x = this.game.width - this.scrollingMap.width;
              }
              // keep map within boundaries
              if(this.scrollingMap.x > 0){
                   this.scrollingMap.x = 0;
              }
              // keep map within boundaries
              if(this.scrollingMap.y < this.game.height - this.scrollingMap.height){
                   this.scrollingMap.y = this.game.height - this.scrollingMap.height;
              }
              // keep map within boundaries
              if(this.scrollingMap.y > 0){
                   this.scrollingMap.y = 0;
              }
              // applying friction to moving speed
              this.scrollingMap.movingSpeed *= friction;
              // save current map position
              this.scrollingMap.savedPosition = new Phaser.Point(this.scrollingMap.x, this.scrollingMap.y);
         }
         // if the moving speed is less than 1...
         
         else{
              // checking distance between current map position and last saved position
              // which is the position in the previous frame
              var distance = this.scrollingMap.savedPosition.distance(this.scrollingMap.position);
              // same thing with the angle
              var angle = this.scrollingMap.savedPosition.angle(this.scrollingMap.position);
              // if the distance is at least 4 pixels (an arbitrary value to see I am swiping)
              if(distance > 4){
                   // set moving speed value
                   this.scrollingMap.movingSpeed = distance * speedMult;
                   // set moving angle value
                   this.scrollingMap.movingangle = angle;
              }
         }
	 }
};

var repeatConut;

Worldmap.prototype.makeWorldMap = function() {
	
	repeatConut = StzGameConfig.TOTAL_EPISODE_COUNT/4;
	var temp = this.game.make.bitmapData(this.game.width, 403);
	worldmapBmd = this.game.make.bitmapData(this.game.width, 403*(repeatConut));

	for(var i =4; i <= repeatConut; i++){
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
	
	 this.scrollingMap.inputEnabled = true;
     // map can be dragged
     this.scrollingMap.input.enableDrag(false);
     // custom property: we save map position
     this.scrollingMap.savedPosition = new Phaser.Point(this.scrollingMap.x, this.scrollingMap.y);
     // custom property: the map is not being dragged at the moment
     this.scrollingMap.isBeingDragged = false; 
     // custom property: map is not moving (or is moving at no speed)
     this.scrollingMap.movingSpeed = 0; 
     // map can be dragged only if it entirely remains into this rectangle
     this.scrollingMap.input.boundsRect = new Phaser.Rectangle(this.game.width - this.scrollingMap.width, 
    		 this.game.height - this.scrollingMap.height, this.scrollingMap.width * 2 - this.game.width, 
    		 this.scrollingMap.height * 2 - this.game.height);
     // when the player starts dragging...
     this.scrollingMap.events.onDragStart.add(function(){
          // set isBeingDragged property to true
          this.scrollingMap.isBeingDragged = true;
          // set movingSpeed property to zero. This will stop moving the map
          // if the player wants to drag when it's already moving
          this.scrollingMap.movingSpeed = 0;
     }, this);
     // when the player stops dragging...
     this.scrollingMap.events.onDragStop.add(function(){
          // set isBeingDragged property to false
          this.scrollingMap.isBeingDragged = false;
     }, this);
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

