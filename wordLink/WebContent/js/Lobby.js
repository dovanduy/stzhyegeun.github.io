function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.isWaiting = false;
	this.waitingTimer = this.game.time.create(false);
	this.remainWaitingTime = StzServerConfig.EXPIRE_SECONDS;
};

Lobby.prototype.preload = function() {
	this.scene = new LobbyScene(this.game);
};

Lobby.prototype.create = function() {
	this.scene.fBtn_stage.events.onInputDown.add(this.OnClickGameStart, this);
	this.game.state.start("InGame");
};

Lobby.prototype.OnClickGameStart = function(sprite, pointer) {
	StzLog.print("[Lobby (OnClickGameStart)]");
	
	
	if (this.isWaiting == false) {
		this.isWaiting = true;
		this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
		this.waitingTimer.loop(1000, function(){
			if (this.isWaiting == false) {
				return;
			}
			this.remainWaitingTime--;
			this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
			
			if (this.remainWaitingTime <= 30) {
				this.game.state.start("InGame");
				//this.cancelWaitingPeer();
			}
		}, this);
		
		this.waitingTimer.start();
	}
};
