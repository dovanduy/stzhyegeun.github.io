function InGameController_proto(){
	if (!(this instanceof InGameController_proto)) {
		return new InGameController_proto();
	}
	var _targetModel = null;

	var _isPlay = false;
	
	var _isCollisonConfirm = false;
	var _collisonCheckTimer = null;
	
	var CHARACTER_SPEED = 0;
	this.continueCount	= 0;
	//발사 끝난 캐릭터
	this.endFirecharacters = [];
	var _remainCount = 0;
	this.getRemainCount = function(){return _remainCount;}
	
    this.setIsPlay = function(inValue){
        if(inValue === true){
        	if(StageManager.getStageData(PlayerDataManager.saveData.getBestStage()).mode === 'N'){
        		window.sounds.sound('bgm_normal').play("", 0, PlayerDataManager.saveData.getMusic(), true);
        	}
        	else if(StageManager.getStageData(PlayerDataManager.saveData.getBestStage()).mode === 'H'){
        		window.sounds.sound('bgm_boss').play("", 0, PlayerDataManager.saveData.getMusic(), true);
        	}
        }
        else{
            window.sounds.allStop();
        }
        
        _isPlay = inValue;
    };

	this.getIsPlay = function(){return _isPlay;};
	
	this.getIsEnd = function(){return _isEndGame;};
	this.getMaxCount = function(){return _maxCount;};
	
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
		this.continueCount = Math.ceil(StaticManager.dino_thornz_base.get('continue_knife') ? 
				StaticManager.evaluate(StaticManager.dino_thornz_base.get('continue_knife').value, 1, {_max_knife : _maxCount}) : 1)
		if(!this.popupContinue){
			this.popupContinue = new PopupAd(this.game, _inGameContext.commonScene.fPopupContainer);
		}
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

		if(_remainCount === 0){
			//성공
			_isEndGame = true;
			this.fCharacterMarker.visible = false;
			this.game.time.events.add(500, function(){
				 //FbManager.updateAsyncByInviteUpdateView(EShareType.)
				_inGameContext.setEndLog(EResultType.CLEAR, _remainCount);
				_inGameContext.skipCheckCount = 0;
				_inGameContext.tryCount = 0;
				_inGameContext.toggleResultScene(true);
			}.bind(this));
			return;
		}
	};
	
	this.getObjCollison = function(inFireCharacter){
		var obstacleArray = _targetModel.getObstacleArray();
		var coinArray = _targetModel.getCoinArray();

		var endFireCharacter = inFireCharacter;
		for (var j = 0; j < coinArray.length; j++) {
			var coin = coinArray[j];
			var coinDist = Phaser.Math.distance(coin.collider.world.x, coin.collider.world.y, 
					endFireCharacter.world.x, _targetModel.getMainTarget().world.y + (200*_targetModel.getTargetScale()));
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
				_targetModel.playCoinAnim(coin);
				return null;
			}
		}
		
		for (var j = 0; j < this.endFirecharacters.length; j++) {
			var endFireTempCharacter = this.endFirecharacters[j];
			var tempDist = Phaser.Math.distance(endFireTempCharacter.world.x, endFireTempCharacter.world.y, 
					endFireCharacter.world.x, _targetModel.getMainTarget().world.y + (200*_targetModel.getTargetScale()));
			if (tempDist< endFireTempCharacter.hitArea.radius + endFireCharacter.hitArea.radius) {
				window.sounds.sound('sfx_crash').play();
				return endFireTempCharacter;
			}
		}
		
		for (var j = 0; j < obstacleArray.length; j++) {
			var obstacle = obstacleArray[j];
			var obstacleDist = Phaser.Math.distance(obstacle.collider.world.x, obstacle.collider.world.y, 
					endFireCharacter.world.x,_targetModel.getMainTarget().world.y + (200*_targetModel.getTargetScale()));
			if (obstacleDist < obstacle.collider.hitArea.radius + endFireCharacter.hitArea.radius) {
				window.sounds.sound('sfx_crash').play();
				return endFireCharacter;
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

		var fireTween = this.game.add.tween(_character).to({y:mainTarget.world.y}, CHARACTER_SPEED, Phaser.Easing.Linear.None, true);
		fireTween.onUpdateCallback(function(inParam, inCharacter){
			if(inCharacter.isCollison === true){
				this._checkGame(inParam, inCharacter);
			}
			else{
				var distByStartFire = Phaser.Math.distance(inCharacter.world.x, inCharacter.world.y, 
						mainTarget.world.x, mainTarget.world.y);
			
				if (distByStartFire < mainTarget.hitArea.radius + inCharacter.hitArea.radius) {
					this.game.time.events.add(CHARACTER_SPEED, function(){
						window.sounds.sound('sfx_nailed').play();
				}.bind(this));

					inCharacter.isCollison = true;
					
					if(_characterCount !== 0){
						this.fCharacterMarker.visible = true;
					}
				
					this.game.camera.shake(0.003, 100, true, Phaser.Camera.SHAKE_VERTICAL);
					_targetModel.collisonEffect();
				}
			}
		}.bind(this, fireTween, _character));
		fireTween.onComplete.addOnce(function(inParam, inCharacter){
			this._checkGame(inParam, inCharacter);
		}.bind(this, fireTween, _character));
		this.fCharacterMarker.visible = false;
	};
	
	this._checkGame = function(inParam, inCharacter){
		var mainTarget = _targetModel.getMainTarget();
		
		inCharacter.y = mainTarget.world.y;
		inCharacter.pivot.y = -200*_targetScale;

		if (inParam) {
			this.game.tweens.remove(inParam);
		}
		var collisonCharacter = this.getObjCollison(inCharacter);
		if( collisonCharacter !== null){
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

			if(_isPlay === false || _isEndGame === true){
				this.endFirecharacters.push(inCharacter);
				return;
			}
			
			_inGameContext.skipCheckCount++;
			if(_maxCount === _remainCount){
				_isPlay = false;
				_inGameContext.setEndLog(EResultType.OOPS, _remainCount);
				_inGameContext.gameScene.playOops();
			}
			else if(_remainCount <= this.continueCount){
				_inGameContext.showBlindFunc(this.popupContinue.fBlindContainer);
				_isPlay = false;
				if(_inGameContext.isUseContinue === true){
					_inGameContext.setEndLog(EResultType.FAIL, _remainCount);
					_inGameContext.toggleResultScene(false);
				}
				else{
					this.popupContinue.setData(EpopupAdType.AD_POPUP_CONTINUE, function(){
						_isPlay = true;
						_isEndGame = false;
						_characterCount = _remainCount;
						this.fCharacterMarker.visible = true;
						_inGameContext.isUseContinue = true;
					}.bind(this), function(){
						_inGameContext.setEndLog(EResultType.FAIL, _remainCount);
						_inGameContext.toggleResultScene(false);
					}.bind(this));
				}
			}
			else{
				this.game.time.events.add(500, function(){
					_inGameContext.setEndLog(EResultType.FAIL, _remainCount);
					_inGameContext.toggleResultScene(false);
				}.bind(this));
			}
			_isEndGame = true;
		}
		else{
			_targetModel.fTextRemainCount.text = --_remainCount;
		}
		this.endFirecharacters.push(inCharacter);
	};
	
	this.destroyObject = function(){
		if(this.endFirecharacters){
			for(var i = 0; i < this.endFirecharacters.length; i++){
				PoolManager.pool[PoolObjectName.CHARACTER].unloadView(this.endFirecharacters[i]);
				this.endFirecharacters[i] = null;
			}
		}
		this.endFirecharacters = [];
	};
	
	this.destroy = function(){
		this.destroyObject();
		this.popupContinue = null;
	};
};

var InGameController = new InGameController_proto();
