
/**
* 
* @class Phaser.Plugin.block
*/

Phaser.Plugin.block = function(inGame, aParent, posBlock) {
	Phaser.Plugin.call(this, inGame, aParent);
	this.inGame = inGame;
	this.aParent = aParent;
	
	this.isClicked = false;
	
	this.posBlock = posBlock;
	
	this.block = this.inGame.add.sprite(0, 0, 'block', 'blankBlock.png');
	this.blockIcon = this.inGame.add.sprite(0, 0, 'block', 'readyBlock.png');
	this.blockLine = this.inGame.add.sprite(0, 0, 'block', 'clicekBlock.png');
	this.blockLine.visible = false;
	
	var posY = Math.floor(this.posBlock/10);
	var posX = this.posBlock%10;
	
	this.block.inputEnabled = true;
	this.block.events.onInputDown.add(this.onClickBlock, this);
	
	this.block.width = StzGameConfig.BLOCK_WIDTH;
	this.block.height = StzGameConfig.BLOCK_HEIGHT;
	
	this.block.x = StzGameConfig.BLOCK_MARGIN_X + (posX*this.block.width);
	this.block.y = StzGameConfig.BLOCK_MARGIN_Y + (posY*this.block.height);
	
	aParent.scene.fGroupUI.add(this.block);
	aParent.scene.fGroupUI.bringToTop(this.block);
	
	this.block.addChild(this.blockIcon);
	this.block.addChild(this.blockLine);
};

Phaser.Plugin.block.prototype = {
		inGame:null,
		aParent:null,
		pattern:0,
		option:0,
		posBlock:0,
		blockType:0,
		blockIcon:null,
		blockLine:null,
		block:null,
		isClicked:false
};

Phaser.Plugin.block.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.block.prototype.constructor = Phaser.Plugin.block;

Phaser.Plugin.block.prototype.onClickBlock = function(){
	if(this.isClicked === true){
		this.blockIcon.frameName = 'animal_'+this.blockType+"_1.png";
		this.isClicked = false;
		this.blockLine.visible = false;
	}
	else{
		this.blockIcon.frameName = 'animal_'+this.blockType+"_2.png";
		this.isClicked = true;
		this.blockLine.visible = true;
	}
	
};

Phaser.Plugin.block.prototype.readyBlockShow = function(){
	this.blockIcon.frameName = 'readyBlock.png';
};

Phaser.Plugin.block.prototype.startBlockShow = function(){
	this.blockIcon.frameName = 'animal_'+this.blockType+"_1.png";
};

Phaser.Plugin.block.prototype.setBlockPos = function(posBlock){
	this.posBlock = posBlock;
	
	var posY = Math.floor(this.posBlock/10);
	var posX = this.posBlock%10;
	
	this.block.x = StzGameConfig.BLOCK_MARGIN_X + (posX*this.block.width);
	this.block.y = StzGameConfig.BLOCK_MARGIN_Y + (posY*this.block.height);
};

Phaser.Plugin.block.prototype.getBlockPos = function(){
	return this.posBlock;
};

Phaser.Plugin.block.prototype.setBlockType = function(blockType){
	this.blockType = blockType;
};

