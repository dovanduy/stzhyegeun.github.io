/**
 * Level.
 */
function TestLevel() {

	Phaser.State.call(this);

}

/** @type Phaser.State */
var TestLevel_proto = Object.create(Phaser.State.prototype);
TestLevel.prototype = TestLevel_proto;
TestLevel.prototype.constructor = TestLevel;

TestLevel.prototype.init = function() {

	// BLOCK SETTING
	this.BLOCK_COUNT = 1;
	this.BLOCK_HP_OFFSET = 5;
	this.blocks = [];
	this.graphics = this.game.add.graphics(0, 0);

	// BALL SETTING
	this.ballCount = 1;
	
	this.isMouseDown = false;
	this.isBallLanding = true;
	this.firePosition = {
		"x" : this.game.world.centerX, 
		"y" : this.game.world.height - 100
	};
};

TestLevel.prototype.preload = function() {
	
};

TestLevel.prototype.create = function() {
	this.game.stage.backgroundColor = "#ffffff";
	
	this.ball = this.game.add.sprite(this.firePosition.x, this.firePosition.y, 'ball');
	this.ball.anchor.set(0.5, 0.5);

	// physics system enable
	this.game.physics.startSystem(Phaser.Physics.NINJA);
	this.game.physics.ninja.setBounds(0, 0, this.game.width, this.game.height);
	this.game.physics.ninja.gravity = 0;
	
	// create blocks 
	this.createBlocks();
	
	// ball sprite physics setting 
	this.game.physics.ninja.enableCircle(this.ball, 30);
	this.ball.body.bounce = 1;
	this.ball.body.friction = 0;
	this.game.input.keyboard.addKeyCapture([
	    Phaser.Keyboard.LEFT,
	    Phaser.Keyboard.RIGHT,
	    Phaser.Keyboard.UP,
	    Phaser.Keyboard.DOWN
	]);
	
	this.game.input.onDown.add(this.OnMouseDown, this);
	this.game.input.onUp.add(this.OnMouseUp, this);
};

TestLevel.prototype.OnCollisionBlock = function(inParam) {
	if (inParam) {
		inParam.hp--;
		inParam.updateHp();
		
		if (inParam.hp <= 0) {
			//this.blocks.splice(this.blocks.indexOf(inParam), 1);
		}
	}
};

TestLevel.prototype.update = function() {
	for (var i = this.blocks.length - 1; i >= 0; i--) {
		var currentBlock = this.blocks[i];
		if (currentBlock) {
			
			if (currentBlock.hp > 0) {
				this.game.physics.ninja.collide(this.ball, currentBlock, this.OnCollisionBlock.bind(this, currentBlock), null, this);	
			} else {
				currentBlock.destroy();
			}
		}
	}
	
	 if (this.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		 this.ball.body.moveUp(2000);
	 }
	 if (this.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
		 this.ball.body.moveLeft(2000);
	 }
	 if (this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
		 this.ball.body.moveRight(2000);
	 }
	 if (this.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
		 this.ball.body.setZeroVelocity();
		 this.ball.body.moveDown(2000);
	 }
	 if (this.ball.body.y >= this.firePosition.y) {
		 this.isBallLanding = true;
		 this.ball.body.setZeroVelocity();
		 this.firePosition.x = this.ball.body.x;
		 this.firePosition.y = this.ball.body.y;
	 }
	 
	 
	 if (this.isMouseDown && this.isBallLanding) {
		 if (this.guideLine) {
			 this.guideLine.setTo(this.firePosition.x, this.firePosition.y, this.game.input.x, this.game.input.y)
		 } else {
			 this.guideLine = new Phaser.Line(this.firePosition.x, this.firePosition.y, this.game.input.x, this.game.input.y);
		 }
	 }
};

TestLevel.prototype.render = function() {
	if (this.guideLine) {
		this.game.debug.geom(this.guideLine);
	}
};

TestLevel.prototype.createBlocks = function() {
	/*
	for (var i = this.BLOCK_COUNT; i > 0; i--) {
		var tempBlock = new block(100, 100, 13, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game);
		this.blocks.push(tempBlock);
	}
	*/
	
	this.blocks.push(new block(100, 200, 13, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(170, 200, 4, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(240, 200, 1, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(310, 200, 5, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(450, 200, 29, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(520, 200, 12, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
	this.blocks.push(new block(590, 200, 32, StzUtil.createRandomInteger(((this.ballCount - this.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - this.BLOCK_HP_OFFSET), this.ballCount + this.BLOCK_HP_OFFSET), this.game));
};


TestLevel.prototype.OnMouseDown = function() {
	
	if (this.isBallLanding === false) {
		return;
	}
	
	this.isMouseDown = true;
};

TestLevel.prototype.OnMouseUp = function() {
	
	if (this.isBallLanding === false) {
		return;
	}
	
	if (this.guideLine) {
		this.guideLine.setTo(this.firePosition.x, this.firePosition.y, this.firePosition.x, this.firePosition.y);
	}
	
	if (this.isMouseDown) {
		this.shoot();	
	}
	this.isMouseDown = false;
};

TestLevel.prototype.shoot = function() {
	var angle = Math.atan2(this.game.input.y - this.firePosition.y, this.game.input.x - this.firePosition.x) * (180/Math.PI);
	console.log("ball angel: " + angle);
	this.isBallLanding = false;
	this.ball.body.moveTo(1000, angle);	
}
