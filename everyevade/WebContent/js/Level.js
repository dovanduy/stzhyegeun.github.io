/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Level.prototype = proto;

Level.prototype.init = function(inId) {
	this.player_info = {
		id: inId,
		score: 0, 
		corner_offset: 5,
		forward_offset: 3, 
		backward_offset: 1
	};
	
	this.meteor_info = {
		list: [],
		secDuration: 0,
		MAX_COUNT: 20, 
		MAX_SPEED: 3,
		MAX_DURATION_SECOND: 5
	};
};

Level.prototype.preload = function() {
	this.scene = new LevelScene(this.game);
};

Level.prototype.create = function() {
	this.addIdTag();
	
	this.cursors = this.input.keyboard.createCursorKeys();
	this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
	
	this.weapon = this.game.add.weapon(30, 'bullet');
	this.weapon.bulletSpeed = 500;
	this.weapon.fireRate = 250;
	this.weapon.trackSprite(this.scene.fSpaceship, 0, 0, true);
};

Level.prototype.update = function() {
	
	this.createMeteor();
	this.updateMeteor();
	
	if (this.cursors.left.isDown) {
		this.scene.fSpaceship.angle -= this.player_info.corner_offset;
	} 
	
	if (this.cursors.right.isDown) {
		this.scene.fSpaceship.angle += this.player_info.corner_offset;
	} 

	var posX = this.scene.fPlayer.position.x;
	var posY = this.scene.fPlayer.position.y;
	if (this.cursors.up.isDown) {
		posX = this.scene.fPlayer.position.x + this.player_info.forward_offset * Math.cos(this.scene.fSpaceship.angle * Math.PI / 180);
		posY = this.scene.fPlayer.position.y + this.player_info.forward_offset * Math.sin(this.scene.fSpaceship.angle * Math.PI / 180); 
	} 

	if (this.cursors.down.isDown) {
		posX = this.scene.fPlayer.position.x - this.player_info.backward_offset * Math.cos(this.scene.fSpaceship.angle * Math.PI / 180);
		posY = this.scene.fPlayer.position.y - this.player_info.backward_offset * Math.sin(this.scene.fSpaceship.angle * Math.PI / 180);
	}

	// world wrap
	if (posX > this.game.width) {
		posX = 0;
	} else if (posX < 0) {
		posX = this.game.width;
	}
	
	if (posY > this.game.height) {
		posY = 0;
	} else if (posY < 0) {
		posY = this.game.height;
	}
	this.scene.fPlayer.position.setTo(posX, posY);
	
	if (this.fireButton.isDown) {
		this.weapon.fire();
	}
};


Level.prototype.updateMeteor = function() {
	
	for (var index = this.meteor_info.list.length - 1; index >= 0; index--) {
		var currentMeteor = this.meteor_info.list[index];
		
		if (currentMeteor.hasOwnProperty('position') == false || currentMeteor.position.x < 0 || currentMeteor.position.x > this.game.width) {
			this.meteor_info.list.splice(index++, 1);
			currentMeteor.kill();
			continue;
		}
		
		if (currentMeteor.hasOwnProperty('position') == false || currentMeteor.position.y < 0 || currentMeteor.position.y > this.game.height) {
			this.meteor_info.list.splice(index++, 1);
			currentMeteor.kill();
			continue;
		}
		
		if (Phaser.Rectangle.intersects(this.scene.fSpaceship.getBounds(), currentMeteor.getBounds())) {
		//if (this.scene.fSpaceship.body.intersects(currentMeteor.body)) {
			this.scene.fSpaceship.kill();
			this.meteor_info.list.splice(index++, 1);
			currentMeteor.kill();
			continue;
		}
		
		
		currentMeteor.position.x += currentMeteor.offsetPosX;
		currentMeteor.position.y += currentMeteor.offsetPosY;
	}
}

Level.prototype.createMeteor = function() {
	var numMeteor = StzCommon.StzUtil.createRandomInteger(20);
	// duration 계산
	if (this.meteor_info.secDuration > 0) {
		this.meteor_info.secDuration -= (this.game.time.elapsedMS / 1000);
		console.log("meteor duration: " + this.meteor_info.secDuration);
		return;
	}
	
	for (var index = numMeteor; index >= 0; index--) {
		// 시작 위치 지정 (상, 하, 좌, 우)
		var startPosition = StzCommon.StzUtil.createRandomInteger(4);
		
		var posX = 0;
		var posY = 0;
		
		switch (startPosition) {
		case 1: // 상
			posX = StzCommon.StzUtil.createRandomInteger(this.game.width) - 1;		
			posY = 0;
			break;
		case 2: // 하
			 posX = StzCommon.StzUtil.createRandomInteger(this.game.width) - 1;
			 posY = this.game.height;
			 break;
		case 3: // 좌
			posX = 0;
			posY = StzCommon.StzUtil.createRandomInteger(this.game.height) - 1;
			break;
		case 4: // 우
			posX = this.game.width;
			posY = StzCommon.StzUtil.createRandomInteger(this.game.height) - 1;
			break;
		}
		
		// 시작 위치에 따른 랜덤 포지션 설정
		var imgMeteor = this.game.add.sprite(posX, posY, 'meteor');
		var thisMeteorSpeed = StzCommon.StzUtil.createRandomInteger(this.meteor_info.MAX_SPEED);
		var radianMeteorToPlayer = Math.atan2(this.scene.fPlayer.position.y - posY, this.scene.fPlayer.position.x - posX);
		imgMeteor.offsetPosX = thisMeteorSpeed * Math.cos(radianMeteorToPlayer);
		imgMeteor.offsetPosY = thisMeteorSpeed * Math.sin(radianMeteorToPlayer);
		this.meteor_info.list.push(imgMeteor);
	}
	
	this.meteor_info.secDuration = StzCommon.StzUtil.createRandomInteger(this.meteor_info.MAX_DURATION_SECOND);
};

Level.prototype.addIdTag = function() {
	var txtId = this.game.add.text(0, 25, this.player_info.id, {
		font: '10px Arial', 
		fill: '#ffffff', 
		fontWeight: 'bold', 
		boundsAlignH: 'center', 
		boundsAlignV: 'middle'
	});
	this.scene.fPlayer.add(txtId);
};