function Ball(inParentContext, contaniner, ballPos) {
	if(!(this instanceof Ball)){
		return new Ball(inParentContext);
	}
	
	var _viewContext = inParentContext;
	
	var _ballSprite = _viewContext.game.add.sprite(ballPos.x, ballPos.y, 'ball');
	var _isMoveBall = false;
	
	_ballSprite.anchor.set(0.5, 0.5);
	_ballSprite.scale.set(0.5, 0.5);
	//_ballSprite.visible = false;
	contaniner.add(_ballSprite);
	var self = {
			isMoveBall:false
			};
	
	self.getSprite = function(){
		return _ballSprite;
	};
	
	self.shoot = function(inputPos, PlayerPos, speed, delay){

		var angle = StzUtil.twoPointCalcAngle(inputPos, PlayerPos);
		console.log("ball angel: " + angle);
		_ballSprite.visible = true;
		//_ballSprite.body.moveUp(10000);
		_viewContext.game.time.events.add(delay, function(){
			 self.isMoveBall = true;
			_ballSprite.body.moveTo(speed, angle);	
		}.bind(this));
		
	};
	
	self.retrunBall = function(moveX, moveY){
		self.isMoveBall = false;
		_viewContext.game.add.tween(_ballSprite.body).to({x:moveX, y:moveY}, 300, Phaser.Easing.Linear.None, true)
		.onComplete.addOnce(function() {
			_ballSprite.body.setZeroVelocity();
		}.bind(self));
	};
	
	return self;
};