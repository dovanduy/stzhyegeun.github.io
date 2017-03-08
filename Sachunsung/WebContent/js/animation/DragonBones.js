DragonBones.prototype.ingame = null;
DragonBones.prototype.armature;
DragonBones.prototype.animationData = {
		imageName:"",
		imagePath:"",
		textureName:"",
		texturePath:"",
		skelontonName:"",
		skelontonPath:"",
		atlasName:""
};

function DragonBones(ingame, imageObject, textureObject, atalsName, skeletonObject) {
	this.ingame = ingame;
	
	this.animationData = {};
	
	this.animationData.imageName = imageObject.name;
	this.animationData.imagePath = imageObject.path;
	
	this.animationData.textureName = textureObject.name;
	this.animationData.texturePath = textureObject.path;
	
	this.animationData.skelontonName = skeletonObject.name;
	this.animationData.skelontonPath = skeletonObject.path;
	
	this.animationData.atlasName = atalsName;
	
	this.animationLoad();
}

DragonBones.prototype.animationLoad = function(){
	this.ingame.load.image(this.animationData.imageName, this.animationData.imagePath);
	 // the texture atlas data (TexturePacker JSON Array format) for the dragon bones sprite 
	 // (loaded independently to make it easily accessible to dragonbones)
	this.ingame.load.json(this.animationData.textureName, this.animationData.texturePath);
	 // load the texture atlas again so that it's content is registered in the atlas frame cache
	this.ingame.load.atlas(this.animationData.atlasName, this.animationData.imagePath, this.animationData.texturePath);  
	 // the dragonbones skeleton data
	this.ingame.load.json(this.animationData.skelontonName, this.animationData.skelontonPath);
};

DragonBones.prototype.loadAnimation = function(x, y, label){
//give dragonBones a reference to the game object
// fetch the skeletonData from cache
var skeletonJSON = this.ingame.cache.getJSON(this.animationData.skelontonName);
// fetch the atlas data from cache
var atlasJson = this.ingame.cache.getJSON(this.animationData.textureName);

//hardcoded ids for the dragonBones elements to target
var armatureName = atlasJson.name;//PigDragonBones";
var skeletonId = skeletonJSON.name;//piggy";
var animationId = label;//run";

var partsList = [];

for(var i = 0; i < atlasJson.SubTexture.length; i++){
	partsList.push(atlasJson.SubTexture[i].name);
}
// make an array listing the names of which images to use from the atlas
//var partsList = ["arm_front", "head_ninja", "body", "fore_leg", "rear_leg", "rear arm"];
 
// fetch the atlas image
var texture = this.ingame.cache.getImage(this.animationData.imageName);
// and the atlas id
var atlasId = this.animationData.atlasName;
// pass the variables all through to a utility method to generate the dragonBones armature

var config = {
  armatureName: armatureName,
  skeletonId: skeletonId,
  animationId: animationId,
  atlasId: atlasId,
  partsList: partsList
};

this.armature = dragonBones.makeArmaturePhaser(config, skeletonJSON, atlasJson, texture);
//var armature = dragonBones.makePhaserArmature(armatureName, skeletonId, animationId, skeletonData, atlasJson, texture, partsList, atlasId);
 //get the root display object from the armature
var bonesBase = this.armature.getDisplay();
// position it
bonesBase.x = x;
bonesBase.y = y;
// add it to the display list
this.ingame.world.add(bonesBase);
};

DragonBones.prototype.getBoneBase = function(){
	return this.armature.getDisplay();
};

DragonBones.prototype.getAnimationData = function(){
	return this.armature.animation;
};

DragonBones.prototype.gotoAndPlay = function(label){
	this.armature.animation.gotoAndPlay(label);
};