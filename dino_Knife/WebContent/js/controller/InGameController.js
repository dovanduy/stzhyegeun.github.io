function InGameController_proto(){
	if (!(this instanceof InGameController_proto)) {
		return new InGameController_proto();
	}
	var _targetModel = null;

	var _isPlay = false;
	
	var _isCollisonConfirm = false;
	var _collisonCheckTimer = null;
	var CHARACTER_SPEED = 0;
	//발사 중인 캐릭터
	this.startFireCharacters = [];
	//발사 끝난 캐릭터
	this.endFirecharacters = [];
	var _remainCount = 0;
	this.getRemainCount = function(){return _remainCount;}
	
    this.setIsPlay = function(inValue){
        if(inValue === true){
            window.sounds.sound('bgm_normal').play("", 0, PlayerDataManager.saveData.getMusic(), true);
        }
        else{
            window.sounds.allStop();
        }
        
        _isPlay = inValue;
    };

	this.getIsPlay = function(){return _isPlay;};
	
	this.getIsEnd = function(){return _isEndGame;};

	this.init = function(inGame, inTargetModel, inTargetCount){
		this.game = inGame;
		//성능 개선 필요할 경우 여기 수정
		this.destroyObject();
		_inGameContext = this.game.state.getCurrentState();
		_maxCount = inTargetCount;
		_remainCount = inTargetCount;
		_characterCount = inTargetCount;
		_targetModel = inTargetModel;
		_isEndGame = false;
		_targetScale = _targetModel.getTargetScale();
		this.fCharacterMarker = _inGameContext.gameScene.fCharacterMarker;
		this.fCharacterMarker.visible = false;
		
		CHARACTER_SPEED = (StaticManager.dino_thornz_base.get("base_speed") ? StaticManager.dino_thornz_base.get("base_speed").value : InGameConfig.CHARACTER_SPEED);
	};
	
	this.update = function(){
		//인게임 시작
		if(_isPlay === false){
			return;
		}
		//회전 속도 업데이트
		_targetModel.updateRotate(this.endFirecharacters);

		//게임 종료
		if(_isEndGame === true){
			return;
		}
		
		var mainTarget = _targetModel.getMainTarget();
		
		//캐릭터, 장애물 충돌 체크
		var collisonCharacter = this.getObjCollison();
		if( collisonCharacter !== null){
			_isEndGame = true;
			//실패
			var isLeft = (_targetModel.getRotateSpeed() <= 0)? false : true;

			//메인 타겟 회전에 따라 팅겨나가는 방향 결정
			var moveX = (isLeft === true) ? collisonCharacter.world.x - 500 : collisonCharacter.world.x + 500;
			var moveY = collisonCharacter.world.y + 500;

			collisonCharacter.y -= collisonCharacter.pivot.y;
			collisonCharacter.pivot.y = 0;
			collisonCharacter.anchor.set(0.5);
		
			this.game.add.tween(collisonCharacter).to({x:moveX, y:moveY}, 1000, Phaser.Easing.Linear.None, true)
			.onUpdateCallback(function(inParam){
				inParam.target.rotation += 0.25;
			}.bind(this));

			if(_maxCount === _remainCount + 1){
				_isPlay = false;
				_inGameContext.setEndLog(EResultType.OOPS, _remainCount + 1);
				_inGameContext.gameScene.playOops();
			}
			else{
				this.game.time.events.add(500, function(){
					_inGameContext.setEndLog(EResultType.FAIL, _remainCount + 1);
					_inGameContext.toggleResultScene(false);
				}.bind(this));
			}
			return;
		}

		if(_remainCount === 0 && _isCollisonConfirm === false){
			//성공
			_isEndGame = true;
			this.fCharacterMarker.visible = false;
			this.game.time.events.add(500, function(){
				_inGameContext.setEndLog(EResultType.CLEAR, _remainCount);
				_inGameContext.tryCount = 0;
				_inGameContext.toggleResultScene(true);
			}.bind(this));
			return;
		}
		
		//발사 중인 케릭터와 타겟의 충돌 체크
		for (var i = 0; i < this.startFireCharacters.length; i++) {
			var startFireCharacter = this.startFireCharacters[i];
			var distByStartFire = Phaser.Math.distance(startFireCharacter.world.x, startFireCharacter.world.y, 
						mainTarget.world.x, mainTarget.world.y);
			
			if (distByStartFire < mainTarget.hitArea.radius + startFireCharacter.hitArea.radius) {
					this.game.time.events.add(CHARACTER_SPEED, function(){
						window.sounds.sound('sfx_nailed').play();
					}.bind(this));
		
					this.startFireCharacters.splice(i, 1);
					startFireCharacter.y =  mainTarget.world.y;
					startFireCharacter.pivot.y = -200*_targetScale;
					this.endFirecharacters.push(startFireCharacter);
					
					_targetModel.fTextRemainCount.text = --_remainCount;

					this.fCharacterMarker.visible = true;
					this.game.camera.shake(0.003, 100, true, Phaser.Camera.SHAKE_VERTICAL);
					_targetModel.collisonEffect();
					
					_isCollisonConfirm = true;
					
					if(_collisonCheckTimer){
						this.game.time.events.remove(_collisonCheckTimer);
						_collisonCheckTimer = null;
					}
					_collisonCheckTimer = this.game.time.events.add(500, function(){
						_isCollisonConfirm = false;
					}.bind(this));
			}
		}
	};
	
	this.getObjCollison = function(){
		if(_isCollisonConfirm === false){
			return null;
		}
		//성능 안 좋을 경우 여기 수정 ...
		var obstacleArray = _targetModel.getObstacleArray();
		var coinArray = _targetModel.getCoinArray();

		for (var i = 0; i < this.endFirecharacters.length; i++) {
			var endFireCharacter = this.endFirecharacters[i];
			
			for (var j = 0; j < coinArray.length; j++) {
				var coin = coinArray[j];
				var coinDist = Phaser.Math.distance(coin.collider.world.x, coin.collider.world.y, 
						endFireCharacter.world.x, endFireCharacter.world.y);
				if (coinDist < coin.collider.hitArea.radius + endFireCharacter.hitArea.radius) {
					window.sounds.sound('sfx_flower').play();
					PlayerDataManager.saveData.updateCoin(1);
					coinArray.splice(j, 1);
					if(coin.image){
						PoolManager.pool[PoolObjectName.COIN].unloadView(coin.image);
					}
					
					if(coin.collider){
						PoolManager.pool[PoolObjectName.COLLIDER].unloadView(coin.collider);
					}
					return null;
				}
			}
			
			for (var j = 0; j < this.endFirecharacters.length; j++) {
				if(i === j){
					continue;
				}
				var endFireTempCharacter = this.endFirecharacters[j];
				var tempDist = Phaser.Math.distance(endFireTempCharacter.world.x, endFireTempCharacter.world.y, 
						endFireCharacter.world.x, endFireCharacter.world.y);
				if (tempDist< endFireTempCharacter.hitArea.radius + endFireCharacter.hitArea.radius) {
					window.sounds.sound('sfx_crash').play();
					return endFireTempCharacter;
				}
			}
			
			for (var j = 0; j < obstacleArray.length; j++) {
				var obstacle = obstacleArray[j];
				var obstacleDist = Phaser.Math.distance(obstacle.collider.world.x, obstacle.collider.world.y, 
						endFireCharacter.world.x, endFireCharacter.world.y);
				if (obstacleDist < obstacle.collider.hitArea.radius + endFireCharacter.hitArea.radius) {
					window.sounds.sound('sfx_crash').play();
					return endFireCharacter;
				}
			}
		}
		return null;
	};
	
	this.onClickedMouse = function(){
		if(_isPlay === false || _isEndGame === true || _characterCount === 0){
			return;
		}
		//케릭터 발사
		window.sounds.sound('sfx_throw').play();
		_characterCount--;
		var _character = PoolManager.pool[PoolObjectName.CHARACTER].loadView(this.game);
		
		var mainTarget = _targetModel.getMainTarget();
		this.startFireCharacters.push(_character);
		
		var fireTween = this.game.add.tween(_character).to({y:mainTarget.world.y}, CHARACTER_SPEED, Phaser.Easing.Linear.None, true);
		fireTween.onComplete.addOnce(function(inParam){
			if (inParam) {
				this.game.tweens.remove(inParam);
			}
		}.bind(this, fireTween));
		
		this.fCharacterMarker.visible = false;
	};
	
	this.destroyObject = function(){
		if(this.startFireCharacters){
			for(var i = 0; i < this.startFireCharacters.length; i++){
				PoolManager.pool[PoolObjectName.CHARACTER].unloadView(this.startFireCharacters[i]);
				
			}
		}
		
		if(this.endFirecharacters){
			for(var i = 0; i < this.endFirecharacters.length; i++){
				PoolManager.pool[PoolObjectName.CHARACTER].unloadView(this.endFirecharacters[i]);
				this.endFirecharacters[i] = null;
			}
		}
		
		this.startFireCharacters = [];
		this.endFirecharacters = [];
	};
};

var InGameController = new InGameController_proto();
