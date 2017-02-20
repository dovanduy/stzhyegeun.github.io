SpineAnimation.prototype.ingame;
SpineAnimation.prototype.name;

SpineAnimation.prototype.spineData;

function SpineAnimation(inGame,spineName,spineJsonPath){
	 this.ingame = inGame;
	 this.name = spineName;
	 
	 this.ingame.load.spine(this.name, spineJsonPath);
}

SpineAnimation.prototype.loadAnimation = function(x, y){
	this.spineData =  this.ingame.add.spine(x, y, this.name);
};

SpineAnimation.prototype.getSpineData = function(){
	return this.spineData;
};

SpineAnimation.prototype.gotoAndPlay = function(label, loop){
	this.spineData.setAnimationByName(0, label, loop);
};

