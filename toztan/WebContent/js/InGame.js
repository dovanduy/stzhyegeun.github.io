
/**
 * InGame.
 */
function InGame() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
InGame.prototype = proto;
InGame.prototype.init = function () {
	
	
};

InGame.prototype.preload = function () {

};

InGame.prototype.create = function () {
	// to change this code: Canvas editor > Configuration > Editor > userCode > Create
	this.scene = new InGameScene(this);
	this.game.stage.backgroundColor = "#ff8040";
	
	this.createPlayer();
	
	this.game.physics.startSystem(Phaser.Physics.NINJA);
	this.game.physics.ninja.setBounds(0, 0, this.game.width, this.game.height);
	this.game.physics.ninja.gravity = 0;

	this.ballArray = [];
	this.ballCount = 0;
	this.txtBallCount = this.game.add.text(500, 1100, "공 개수 : " +this.ballCount);
	this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
	
	// init UserInteraction
	this.controller = new InGameController(this);
	this.game.input.onDown.add(this.controller.clickMouse, this.controller);
	this.game.input.addMoveCallback(this.controller.moveMouse, this.controller);
	this.game.input.onUp.add(this.controller.unClickMouse, this.controller);
	
	
	this.blocks = [];
	
	this.createBlock();
	
	this.player.getSprite().inputEnabled = true;
	this.player.getSprite().events.onInputUp.add(this.AllReturnBall, this);
	
	this.isAllReturn = false;
};

/* --- end generated code --- */
// -- user code here --
InGame.prototype.getBallCount = function() {
	return ballCount;
};

InGame.prototype.upBallCount = function() {
	this.ballCount++;
};

InGame.prototype.AllReturnBall = function() {
	for(var i =0; i < this.ballArray.length; i++){
		if(this.ballArray[i].isMoveBall === true){
			console.log("떨어져");
			this.isAllReturn = true;
			this.ballArray[i].getSprite().body.setZeroVelocity();
			this.ballArray[i].getSprite().body.moveTo(2000, 90);
		}
	}
};

InGame.prototype.createBlock = function() {
	for(var i = 0; i < 7; i++){
		if(StzUtil.createRandomInteger(1,3) === 1){
			continue;
		}
		var randomNum = StzUtil.createRandomInteger(1, 30);
		
		if(randomNum > 13){
			randomNum = 1;
		}
		this.blocks.push(new block(50 + i*100, 100, randomNum, StzUtil.createRandomInteger(((this.ballCount - InGameConfig.BLOCK_HP_OFFSET) <= 0 ? 1 : this.ballCount - InGameConfig.BLOCK_HP_OFFSET), this.ballCount + InGameConfig.BLOCK_HP_OFFSET), this.game));
	}
}

InGame.prototype.update = function() {
	if(this.isAllReturn === false){
		for (var i = this.blocks.length - 1; i >= 0; i--) {
			var currentBlock = this.blocks[i];
			if (currentBlock) {
				
				if (currentBlock.hp > 0) {
					for(var j =0; j < this.ballArray.length; j++){
						this.game.physics.ninja.collide(this.ballArray[j].getSprite(), currentBlock, this.OnCollisionBlock.bind(this, currentBlock), null, this);	
					}
				} else {
					this.blocks.splice(i, 1);
					currentBlock.destroy();
				}
			}
		}
	}
	
	this.controller.updateView();
};

InGame.prototype.OnCollisionBlock = function(inParam) {
	if (inParam) {
		inParam.hp--;
		inParam.updateHp();
		
		if (inParam.hp <= 0) {
//			var destoryBlock = this.blocks.splice(this.blocks.indexOf(inParam), 1);
//			destoryBlock[0].destroy();
		}
	}
};

InGame.prototype.createPlayer = function() {
	this.player = new Player(this);
	
	this.scene.fPlayerContainer.add(this.player.getSprite());
};

InGame.prototype.createBall = function(ballPos) {
	var ball = new Ball(this, this.scene.fBallContainer,ballPos);
	
	this.game.physics.ninja.enableCircle(ball.getSprite(), 20);
	ball.getSprite().body.bounce = 1;
	ball.getSprite().body.friction = 0;
	
	this.ballArray.push(ball);
	this.upBallCount();
	
	this.txtBallCount.text = "공 개수 : " +this.ballCount;
};

InGame.prototype.playerMoveTo = function(moveX) {
	this.game.add.tween(this.scene.fPlayerContainer).to({x:moveX}, 200, Phaser.Easing.Linear.None, true)
	.onComplete.addOnce(function() {
		this.controller.setState(EControllerState.RETURN_BALL_TURN);
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
		this.createBall({x:this.scene.fPlayerContainer.x, y:this.scene.fPlayerContainer.y});
	}.bind(this));
};

var EControllerState = {
		NONE_TURN				: "NONE_TURN",
		USER_INPUT_TURN 		: "USER_INPUT_TURN",
		MOVE_BALL_TURN 			: "MOVE_BALL_TURN",
		PLAYER_MOVING_TURN		: "PLAYER_MOVING_TURN",
		RETURN_BALL_TURN		: "RETURN_BALL_TURN",
		MOVE_BLOCK_TUEN			: "MOVE_BLOCK_TUEN"
};


var InGameController = function(inViewContext) {
	var self = {
			viewContext: inViewContext,
		};
	
	var _state = EControllerState.NONE_TURN;

	var _destination = {x:0, y:0};
	var _start = {x:0, y:0};
	
	var _lineGraphics = self.viewContext.game.add.graphics(0, 0);
	var _player = self.viewContext.player;
	
	self.setState = function(state) {
		_state = state;
	};
	
	self.updateView = function() {
		if(_state === EControllerState.USER_INPUT_TURN){
			//첫 클릭 시작 지점이 현재 마우스 포인트 보다 값이 크면 라인 삭제
			if(Math.floor(_start.y) > Math.floor(self.viewContext.game.input.y)){
				_lineGraphics.clear();
			}
			else{
				//첫 클릭 지점이 현재 마우스 포인트 지점 보다 MIN_MOUSE_MOVE_POINT 클 경우 라인 생성
				if(Math.floor(self.viewContext.game.input.y) - Math.floor(_start.y) > InGameConfig.MIN_MOUSE_MOVE_POINT){
					self._drawLine();
				}
			}
		}
		else if(_state === EControllerState.MOVE_BALL_TURN){
			for(var i =0; i < self.viewContext.ballArray.length; i++){
				if(self.viewContext.ballArray[i].isMoveBall === true){
					if (self.viewContext.ballArray[i].getSprite().body.y >= _player.getSprite().world.y) {
						 self.setState(EControllerState.PLAYER_MOVING_TURN);
						 self.viewContext.ballArray[i].getSprite().body.setZeroVelocity();
						 self.viewContext.playerMoveTo(self.viewContext.ballArray[i].getSprite().body.x);
						 //self.viewContext.ballArray[i].isMoveBall = false;
						 
						 break;
					 }
				}
			}
		}
		else if(_state === EControllerState.RETURN_BALL_TURN
				||_state === EControllerState.PLAYER_MOVING_TURN){
			if(self.isAllBallMoveCompleteCheck() === true && _state === EControllerState.RETURN_BALL_TURN){
				self.blocksMove();
				
				self.setState(EControllerState.MOVE_BLOCK_TUEN);
				return;
			}
			
			for(var i =0; i < self.viewContext.ballArray.length; i++){
				if(self.viewContext.ballArray[i].isMoveBall === true){
					if (self.viewContext.ballArray[i].getSprite().body.y >= _player.getSprite().world.y) {
						if(_state === EControllerState.PLAYER_MOVING_TURN){
							self.viewContext.ballArray[i].getSprite().body.setZeroVelocity();
						}
						else{
							self.viewContext.ballArray[i].retrunBall(_player.getSprite().world.x,_player.getSprite().world.y);
						}
					 }
				}
			}
			
		}
		
		else if(_state === EControllerState.MOVE_BLOCK_TUEN){
			if(self.isAllBlockMoveCompleteCheck() === true){
				self.viewContext.isAllReturn = false;
				self.viewContext.createBlock();
				self.setState(EControllerState.NONE_TURN);
			}
		}
	};
	
	self.isAllBallMoveCompleteCheck = function() {
		for(var i =0; i < self.viewContext.ballArray.length; i++){
			if(self.viewContext.ballArray[i].isMoveBall === true){
				return false;
			}
		}
		return true;
	};
	
	self.isAllBlockMoveCompleteCheck = function() {
		for(var i =0; i < self.viewContext.blocks.length; i++){
			if(self.viewContext.blocks[i].isMove === true){
				return false;
			}
		}
		return true;
	};
	
	self.clickMouse = function() {
		if(_state === EControllerState.NONE_TURN){
			self.setState(EControllerState.USER_INPUT_TURN);
		}
		else{
			return;
		}
		
		_start.x = self.viewContext.game.input.x;
		_start.y = self.viewContext.game.input.y;
	};
	
	self.moveMouse = function() {
		if(_state !== EControllerState.USER_INPUT_TURN){
			return;
		}
		
		_lineGraphics.clear();
	};
	
	self.unClickMouse = function() {
		if(_state !== EControllerState.USER_INPUT_TURN){
			return;
		}
		//첫 클릭 지점이 현재 마우스 포인트 지점 보다 MIN_MOUSE_MOVE_POINT 크 지 않을 경우 리턴
		if(Math.floor(self.viewContext.game.input.y) - Math.floor(_start.y) < InGameConfig.MIN_MOUSE_MOVE_POINT){
			self.setState(EControllerState.NONE_TURN);
			return;
		}
		//컨트로러 상태를 공의 이동 턴으로 변경
		self.setState(EControllerState.MOVE_BALL_TURN);
		_lineGraphics.clear();
		//공 발사
		self.ballsShoot();
	};
	
	self.ballsShoot = function(){
		for(var i =0; i < self.viewContext.ballArray.length; i++){
			self.viewContext.ballArray[i].shoot(_destination, {x:_player.getSprite().world.x, y:_player.getSprite().world.y}, 1500, i*100);
		}
	};
	
	self.blocksMove = function(){
		for(var i =0; i < self.viewContext.blocks.length; i++){
			self.viewContext.blocks[i].blockMove();
		}
	};
	
	self._drawLine = function(){
		_lineGraphics.lineStyle(8, 0xffffff, 5);
		_lineGraphics.beginFill(0xFF700B, 1);
		
		_lineGraphics.moveTo(_player.getSprite().world.x, _player.getSprite().world.y);
		_destination.x = _start.x - (self.viewContext.game.input.x - _start.x)*1.5;
		_destination.y = _start.y  - (self.viewContext.game.input.y - _start.y)*1.5;
		
		 _lineGraphics.lineTo(_destination.x, _destination.y);
		 _lineGraphics.endFill();
	};
	return self;
};