function Result() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Result.prototype = proto;

Result.prototype.init = function() {
	
	
	this.isPlayAgain = {
		'me': null,
		'rival': null
	};
	
	if (window.realjs) {
		realjs.event.messageListener.removeAll();
		realjs.event.messageListener.add(function(data) {
			if (data.sid === realjs.getMySessionId()) {
				return;
			}
			
			var rivalData = JSON.parse(data.m);
			this.isPlayAgain.rival = rivalData.isPlayAgain;
			
			if (this.isPlayAgain.me === null) {
				return;
			}
			
			if (this.isPlayAgain.me === true && this.isPlayAgain.rival === true) {
				realjs.event.messageListener.removeAll();
				this.game.state.start("InGame");
			} else {
				
				realjs.event.messageListener.removeAll();
				realjs.realJoinLobby(false);
				this.game.state.start("Lobby");
			}
			
		}, this);
	}
};

Result.prototype.preload = function() {
	
};

Result.prototype.create = function() {
	this.game.stage.backgroundColor = "#4BC1CE";
	
	var titleStyle = { font: 'bold 64px Arial', fill: '#ffffff', boundsAlignH: 'center', boundsAlignV: 'middle' };
	var winnerTitle = this.game.add.text(0, 0, "WINNER", titleStyle);
	winnerTitle.setShadow(3, 3, 'rgb(0,0,0)', 2);
	winnerTitle.setTextBounds(0, 0, this.game.width, this.game.height / 8);
	
	var loserTitle = this.game.add.text(0, 0, "loser", titleStyle);
	loserTitle.setShadow(3, 3, 'rgb(0,0,0)', 2);
	loserTitle.setTextBounds(0, this.game.height / 2, this.game.width, this.game.height / 8);

	var buttonStyle = { font: '32px Arial', fill: '#ffffff', boundsAlignH: 'center', boundsAlignV: 'middle' };
	var txtPlayAgain = this.game.add.text(0, 0, "PLAY AGAIN", buttonStyle);
	txtPlayAgain.setTextBounds(0, this.game.height - 100, this.game.width / 2, 100);
	txtPlayAgain.inputEnabled = true;
	txtPlayAgain.events.onInputUp.add(this.OnClickPlayAgain, this);
	
	var txtJoinLobby = this.game.add.text(0, 0, "EXIT", buttonStyle);
	txtJoinLobby.setTextBounds(this.game.width / 2, this.game.height - 100, this.game.width / 2, 100);
	txtJoinLobby.inputEnabled = true;
	txtJoinLobby.events.onInputUp.add(this.OnClickExitToLobby, this);
	
	var winnerPosition = {
		x: this.game.width / 2, 
		y: this.game.height / 4
	};
	
	var loserPosition = {
		x: this.game.width / 2,
		y: this.game.height / 4 * 3
	};
	
	var profileSize = {
			width: 200, 
			height: 200
	};
};

Result.prototype.OnClickExitToLobby = function(item) {
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'isPlayAgain': false}), false);
		realjs.event.messageListener.removeAll();
		realjs.realJoinLobby(false);
	}
	this.game.state.start("Lobby");
};

Result.prototype.OnClickPlayAgain = function(item) {
	
	if (window.realjs) {
		realjs.realSendMessage(JSON.stringify({'isPlayAgain': true}), false);
	}
	
	this.isPlayAgain.me = true;
	
	if (this.isPlayAgain.rival === null) {
		return;
	}
	
	if (this.isPlayAgain.me === true && this.isPlayAgain.rival === true) {
		realjs.event.messageListener.removeAll();
		this.game.state.start("InGame");
	} else {
		realjs.event.messageListener.removeAll();
		this.game.state.start("Lobby");
	}
};


