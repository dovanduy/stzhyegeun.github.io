/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Level.prototype = proto;

Level.SETTING = {
	METEOR_SCORE: 1000
};

/////////////////
// ENTITY Class
/////////////////
var Entity = function() {
	
	var self = {
		x: 0, 
		y: 0,
		speed: 0,
		angle: 0,
		id: "", 
		name: ""
	};
	
	self.update = function() {
		self.updatePosition();
	};
	
	self.updatePosition = function() {
		self.x = self.x + self.speed * Math.cos(self.angle * Math.PI / 180);
		self.y = self.y + self.speed * Math.sin(self.angle * Math.PI / 180);
	};
	
	return self;
};


////////////////
// PLAYER Class
////////////////
var Player = function(inId) {
	var self = Entity();
	self.id = inId;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingFire = false;
	self.speedForward = 3;
	self.speedBackward = -1;
	self.speedCorner = 5;
	self.fireRate = 0;
	self.toRemove = false;
	
	var super_update = self.update;
	self.update = function() {
		self.updateSpeed();
		super_update();
	};
	
	self.updateSpeed = function() {
		if (self.pressingLeft) {
			self.angle -= self.speedCorner;
		} 
		
		if (this.pressingRight) {
			self.angle += self.speedCorner;
		}
		
		if (self.pressingUp) {
			self.speed = self.speedForward;
		} else if (self.pressingDown) {
			self.speed = self.speedBackward;
		} else {
			self.speed = 0;
		}
	};
	
	Player.list[self.id] = self;
	Player.scoreList[self.id] = 0;
	return self;
};

Player.list = {};
Player.scoreList = {};

Player.update = function() {
	for (var index in Player.list) {
		var currentPlayer = Player.list[index];
		currentPlayer.update();
	}
};


////////////////
// Bullet Class
////////////////
var Bullet = function(inAngle) {
	var self = Entity();
	self.id = Math.random();
	self.speed = 6;
	self.angle = inAngle;
	
	self.toRemove = false;
	
	Bullet.list[self.id] = self;
	return self;
};
Bullet.list = {};
Bullet.SETTING = {
	FIRE_RATE_MS: 250
};

Bullet.update = function() {
	for (var index in Bullet.list) {
		var currentBullet = Bullet.list[index];
		currentBullet.update();
	}
};

////////////////
// Meteor Class
////////////////
var Meteor = function(inX, inY, inSpeed) {
	var self = Entity();
	self.id = Math.random();
	self.x = inX;
	self.y = inY;
	self.speed = inSpeed;
	self.angle = (function() {
		var randPlayerIndex = StzCommon.StzUtil.createRandomInteger(Object.keys(Player.list).length) - 1;
		var targetPlayer = Player.list[Object.keys(Player.list)[randPlayerIndex]];
		if (targetPlayer === undefined || targetPlayer === null) {
			targetPlayer = {x: 640, y: 360};
		}
		var radAngle = Math.atan2(targetPlayer.y - self.y, targetPlayer.x - self.x); 
		return radAngle * 180 / Math.PI;
	}).call(this);
	
	self.toRemove = false;
	
	Meteor.list[self.id] = self;
	return self;
};
Meteor.list = {};
Meteor.SETTING = {
	MAX_COUNT: 20, 
	MAX_SPEED: 3, 
	MAX_FIRE_RATE_S: 5
};
Meteor.staticFireRate = 0;
Meteor.update = function() {
	for (var index in Meteor.list) {
		var currentMeteor = Meteor.list[index];
		currentMeteor.update();
	}
}

Level.prototype.init = function(inId) {
	this.playerId = inId;

	window.socket.on('newPosition', (function(data) {



		if (data.hasOwnProperty('player')) {
			for (var key in data.player) {
				Player.list[key] = data.player.key;
			}
		} else {
		
			for (var meteorIndex in Meteor.list) {
				Meteor.list[meteorIndex].sprite.kill();
				delete Meteor.list[meteorIndex];
			}
			
			for (var bulletIndex in Bullet.list) {
				Bullet.list[bulletIndex].sprite.kill();
				delete Bullet.list[bulletIndex];
			}
		
			Player.scoreList = {};
		
			this.game.state.start('Lobby');
			return;
		}

		if (data.hasOwnProperty('bullet')) {
			for (var key in data.bullet) {
				Bullet.list[key] = data.bullet.key;
			}
		}

		if (data.hasOwnProperty('meteor')) {
			for (var key in data.meteor) {
				Meteor.list[key] = data.meteor.key;
			}
		}

		this.updateMeteorView();
		this.updateBulletView();
		this.updatePlayerView();
	}).bind(this));
};

Level.prototype.preload = function() {
	this.scene = new LevelScene(this.game);
};

Level.prototype.create = function() {
	
	for (var playerIndex in Player.list) {
		var currentPlayer = Player.list[playerIndex];
		currentPlayer.x = this.scene.fPlayer.position.x;
		currentPlayer.y = this.scene.fPlayer.position.y;
		
		var txtId = this.game.add.text(0, 25, currentPlayer.id, {
			font: '12px Arial', 
			fill: '#ffffff', 
			fontWeight: 'bold', 
			boundsAlignH: 'center', 
			boundsAlignV: 'middle'
		});
		this.scene.fPlayer.add(txtId);
	}
	
	this.cursors = this.input.keyboard.createCursorKeys();
	this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

	this.game.input.keyboard.onDownCallback = (fucntion() {
		if (this.game.input.keyboard.event.KeyCode.up) {
			window.socket.emit('keyPress', {inputId: 'up', state: true});
		} else if (this.game.input.keyboard.event.KeyCode.down) {
			window.socket.emit('keyPress', {inputId: 'down', state: true});
		} else if (this.game.input.keyboard.event.KeyCode.left) {
			window.socket.emit('keyPress', {inputId: 'left', state: true});
		} else if (this.game.input.keyboard.event.KeyCode.right) {
			window.socket.emit('keyPress', {inputId: 'right', state: true});
		} else if (this.game.input.keyboard.event.KeyCode.space) {
			window.socket.emit('keyPress', {inputId: 'fire', state: true});
		}
	}).bind(this);

	this.game.input.keyboard.onUpCallback = (function() {
		if (this.game.input.keyboard.event.KeyCode.up) {
			window.socket.emit('keyPress', {inputId: 'up', state: false});
		} else if (this.game.input.keyboard.event.KeyCode.down) {
			window.socket.emit('keyPress', {inputId: 'down', state: false});
		} else if (this.game.input.keyboard.event.KeyCode.left) {
			window.socket.emit('keyPress', {inputId: 'left', state: false});
		} else if (this.game.input.keyboard.event.KeyCode.right) {
			window.socket.emit('keyPress', {inputId: 'right', state: false});
		} else if (this.game.input.keyboard.event.KeyCode.space) {
			window.socket.emit('keyPress', {inputId: 'fire', state: false});
		}
	}).bind(this);
};

Level.prototype.update = function() {
	if (Object.keys(Player.list).length <= 0) {
		
		for (var meteorIndex in Meteor.list) {
			Meteor.list[meteorIndex].sprite.kill();
			delete Meteor.list[meteorIndex];
		}
		
		for (var bulletIndex in Bullet.list) {
			Bullet.list[bulletIndex].sprite.kill();
			delete Bullet.list[bulletIndex];
		}
		
		Player.scoreList = {};
		
		this.game.state.start('Lobby');
		return;
	}
	
	// View update
	this.updateBulletView();
	this.updateMeteorView();
	this.updatePlayerView();
	this.updateScoreList();
};

Level.prototype.updateScoreList = function() {
	var style = {
		font: "16px Arial", fill: '#fff', 
		align: 'right', 
		boundsAlignH: 'right', 
		boundsAlignV: 'top', 
		wordWrap: true, 
		wordWrapWidth: 300
	};
	
	var keyValues = [];
	for (var key in Player.scoreList) {
		keyValues.push([key, Player.scoreList[key]]);
	}
	
	keyValues.sort(function compare(kv1, kv2) {
		return kv2[1] - kv1[1];
	});

	var txtValue = '';
	for (var index = 0; index < keyValues.length; index++) {
		txtValue += '[' + (index + 1) + '] ' + keyValues[index][0] + ': ' + keyValues[index][1] + '\n';
	}
	
	if (this.scoreText === undefined || this.scoreText === null) {
		this.scoreText = this.game.add.text(0, 0, txtValue, style);
		this.scoreText.setTextBounds(0, 0, this.game.width, this.game.height);
	}
	this.scoreText.text = txtValue;
	
	
};

Level.prototype.createMeteorModel = function() {
	
	var numMeteor = StzCommon.StzUtil.createRandomInteger(Meteor.SETTING.MAX_COUNT);
	
	if (Meteor.staticFireRate <= 0) {

		for (var index = numMeteor; index >= 0; index--) {
			// set start position (top, bottom, left, right)
			var startPosition = StzCommon.StzUtil.createRandomInteger(4);
			
			var posX = 0;
			var posY = 0;
			
			switch (startPosition) {
			case 1: // top
				posX = StzCommon.StzUtil.createRandomInteger(this.game.width) - 1;		
				posY = 0;
				break;
			case 2: // bottom
				 posX = StzCommon.StzUtil.createRandomInteger(this.game.width) - 1;
				 posY = this.game.height;
				 break;
			case 3: // left
				posX = 0;
				posY = StzCommon.StzUtil.createRandomInteger(this.game.height) - 1;
				break;
			case 4: // right
				posX = this.game.width;
				posY = StzCommon.StzUtil.createRandomInteger(this.game.height) - 1;
				break;
			}
			
			var newMeteor = Meteor(posX, posY, StzCommon.StzUtil.createRandomInteger(Meteor.SETTING.MAX_SPEED));
		}
		Meteor.staticFireRate = StzCommon.StzUtil.createRandomInteger(Meteor.SETTING.MAX_FIRE_RATE_S);
	} else {
		Meteor.staticFireRate -= (this.game.time.elapsedMS / 1000);
	}
};

Level.prototype.updateMeteorView = function() {
	for (var meteorIndex in Meteor.list) {
		var currentMeteor = Meteor.list[meteorIndex];
		
		if (currentMeteor.hasOwnProperty('sprite') === false) {
			var currentMeteorView = this.game.add.sprite(currentMeteor.x, currentMeteor.y, 'meteor');
			currentMeteorView.anchor.setTo(0.5);
			currentMeteorView.hitArea = new Phaser.Rectangle(-3, -3, 6, 6);
			currentMeteor.sprite = currentMeteorView;
		}
		
		currentMeteor.sprite.position.setTo(currentMeteor.x, currentMeteor.y);
		
		// Model Update
		if (currentMeteor.x < 0 || currentMeteor.x > this.game.width 
				|| currentMeteor.y < 0 || currentMeteor.y > this.game.width) {
			currentMeteor.toRemove = true;
		}
		
		for (var bulletIndex in Bullet.list) {
			var currentBullet = Bullet.list[bulletIndex];
			if (currentBullet.hasOwnProperty['sprite'] === false) {
				continue;
			}
			
			if (Phaser.Rectangle.intersects(currentBullet.sprite.getBounds(), currentMeteor.sprite.getBounds())) {
				currentMeteor.toRemove = true;
				currentBullet.toRemove = true;
				Player.scoreList[this.PlayerModel.id] = Player.scoreList[this.PlayerModel.id] + Level.SETTING.METEOR_SCORE;
			}
		}
		
		for (var playerIndex in Player.list) {
			var currentPlayer = Player.list[playerIndex];
			if (currentPlayer.hasOwnProperty['sprite'] === false) {
				continue;
			}
			
			if (Phaser.Rectangle.intersects(this.getSpaceshipHitArea(currentPlayer.sprite), this.getMeteorHitArea(currentMeteor.sprite))) {
				currentMeteor.toRemove = true;
				currentPlayer.toRemove = true;
			}
		}
		
		if (currentMeteor.toRemove === true) {
			delete Meteor.list[meteorIndex];
			currentMeteor.sprite.kill();
		}
	}
};

Level.prototype.createBulletModel = function() {
	
	var currentPlayer = Player.list[this.PlayerModel.id];

	if (currentPlayer === undefined || currentPlayer === null) {
		return;
	}
	
	if (currentPlayer.fireRate <= 0) {
		var newBullet = Bullet(currentPlayer.angle);
		newBullet.x = currentPlayer.x;
		newBullet.y = currentPlayer.y;
		
		currentPlayer.fireRate = Bullet.SETTING.FIRE_RATE_MS;
	} else {
		currentPlayer.fireRate -= this.game.time.elapsedMS;
	}
};

Level.prototype.updateBulletView = function() {
	for (var bulletIndex in Bullet.list) {
		var currentBullet = Bullet.list[bulletIndex];
		
		if (currentBullet.hasOwnProperty('sprite') === false) {
			var currentBulletView = this.game.add.sprite(currentBullet.x, currentBullet.y, 'bullet');
			currentBulletView.anchor.setTo(0.5);
			currentBulletView.angle = currentBullet.angle;
			currentBullet.sprite = currentBulletView;
		}
		
		currentBullet.sprite.position.setTo(currentBullet.x, currentBullet.y);
		
		// Model Update
		if (currentBullet.x < 0 || currentBullet.x > this.game.width 
				|| currentBullet.y < 0 || currentBullet.y > this.game.height) {
			currentBullet.toRemove = true;
		}
		
		if (currentBullet.toRemove === true) {
			delete Bullet.list[bulletIndex];
			currentBullet.sprite.kill();
		}
	}
};

Level.prototype.updatePlayerView = function(inPlayerList) {
	for (var playerIndex in inPlayerList) {
		if (Player.list[playerIndex].x > this.game.width) {
			Player.list[playerIndex].x = 0;
		} else if (Player.list[playerIndex].x < 0) {
			Player.list[playerIndex].x = this.game.width;
		}
		
		if (Player.list[playerIndex].y > this.game.height) {
			Player.list[playerIndex].y = 0;
		} else if (Player.list[playerIndex].y < 0) {
			Player.list[playerIndex].y = this.game.height;
		}
		this.scene.fSpaceship.angle = Player.list[playerIndex].angle;
		this.scene.fPlayer.position.setTo(Player.list[playerIndex].x, Player.list[playerIndex].y);
		
		Player.scoreList[this.PlayerModel.id] = Player.scoreList[this.PlayerModel.id] + this.game.time.elapsedMS;
		
		if (Player.list[playerIndex].toRemove === true) {
			Player.list[playerIndex].sprite.kill();
			delete Player.list[playerIndex];
		}
		
	}
};

Level.prototype.getSpaceshipHitArea = function(inSpaceship) {
	var newArea = new Phaser.Rectangle(inSpaceship.getBounds().x + inSpaceship.hitArea.x, 
										inSpaceship.getBounds().y + inSpaceship.hitArea.y, 
										inSpaceship.hitArea.width, inSpaceship.hitArea.height);
	return newArea;
};

Level.prototype.getMeteorHitArea = function(inMeteor) {
	var newArea = new Phaser.Rectangle(inMeteor.getBounds().x + inMeteor.hitArea.x, 
										inMeteor.getBounds().y + inMeteor.hitArea.y, 
										inMeteor.hitArea.width, inMeteor.hitArea.height);
	return newArea;
};

