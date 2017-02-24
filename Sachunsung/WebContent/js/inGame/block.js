
/**
* 
* @class Phaser.Plugin.block
*/

Phaser.Plugin.block = function(inGame, aParent, posBlock) {
	Phaser.Plugin.call(this, inGame, aParent);
	
	this.posBlock = posBlock;
	this.block = inGame.add.sprite(0, 0, 'block', 'blankBlock.png');
	this.blockIcon = inGame.add.sprite(0, 0, 'block', 'readyBlock.png');

	var posY = Math.floor(this.posBlock/10);
	var posX = this.posBlock%10;
	
	this.block.width = StzGameConfig.BLOCK_WIDTH;
	this.block.height = StzGameConfig.BLOCK_HEIGHT;
	
	this.block.x = StzGameConfig.BLOCK_MARGIN_X + (posX*this.block.width);
	this.block.y = StzGameConfig.BLOCK_MARGIN_Y + (posY*this.block.height);
	
	aParent.scene.fGroupUI.add(this.block);
	aParent.scene.fGroupUI.bringToTop(this.block);
	this.block.addChild(this.blockIcon);
};

Phaser.Plugin.block.prototype = {
		pattern:0,
		option:0,
		posBlock:0,
		blockType:0,
		blockIcon:null,
		block:null
};

Phaser.Plugin.block.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.block.prototype.constructor = Phaser.Plugin.block;

Phaser.Plugin.block.prototype.readyBlockShow = function(){
	this.blockIcon.frameName = 'readyBlock.png';
};

Phaser.Plugin.block.prototype.setBlockType = function(blockType){
	this.blockType = blockType;
};

