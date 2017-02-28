function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	/*
	this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
	this.game.kineticScrolling.configure({
		kineticMovement: true,
	    timeConstantScroll: 325, //really mimic iOS
	    horizontalScroll: false,
	    verticalScroll: true,
	    horizontalWheel: false,
	    verticalWheel: true,
	    deltaWheel: 40
	});
	*/
	
	this.isWaiting = false;
	this.waitingTimer = this.game.time.create(false);
	this.remainWaitingTime = StzServerConfig.EXPIRE_SECONDS;
	
	window.connected = function(c) {
		window.peerConn = c;
    	// 다른 Peer 클라이언트가 접속해 온 경우
    	StzCommon.StzLog.print("[Peer (connected)] c: " + c);
    	$.get(StzServerConfig.getUpdateUrl(window.stz_peerId, EConnectStatus.GAMING), (function(data, status){
			this.game.state.start("InGame",  true, false, ETurn.BLACK);
		}).bind(this));
    };
	
	window.stz_peer.on('connection', window.connected, this);
    
    window.stz_peer.on('error', function(err) {
    	StzCommon.StzLog.print("[Peer] err: " + err);
    });
    
    
	
    this.peerList = [];
};

Lobby.prototype.preload = function() {
};

Lobby.prototype.create = function() {
	
	this.game.backgroundColor = "#ffffff";
	this.scene = new LobbyScene(this.game);
	this.scene.fBtn_stage.events.onInputDown.add(this.OnClickGameStart, this);
	
	
	//this.game.kineticScrolling.start();
	
	//this.scrollList = [];
	
};

Lobby.prototype.OnClickGameStart = function(sprite, pointer) {
	StzCommon.StzLog.print("[Lobby (OnClickGameStart)]");
	//this.game.state.start("InGame");
	
	if (this.isWaiting == false) {
		this.isWaiting = true;
		this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
		this.waitingTimer.loop(1000, function(){
			if (this.isWaiting == false) {
				return;
			}
			this.remainWaitingTime--;
			this.scene.fTxt_stage.text = "Waiting : " + this.remainWaitingTime + " sec";
			
			if (this.remainWaitingTime <= 0) {
				this.cancelWaitingPeer();
			}
		}, this);
		
		// 먼저 상대를 선택한다. 
		$.get(StzServerConfig.getRetrievePeerIdListUrl(), (function(data, status) {
			StzCommon.StzLog.print(data);
			if (data.hasOwnProperty("rowCount") && data.hasOwnProperty("rows")) {
				
				for (var row in data.rows) {
					// self
					if (data.rows[row].status == window.stz_peerId) {
						continue;
					}
					// not waiting status
					if (data.rows[row].status != EConnectStatus.WAITING) {
						continue;
					}
					// Expired data
					if (window.is_peer_expired(data.rows[row].updated) == true) {
						continue;
					}
					
					this.peerList.push(data.rows[row]);
				}
				
				if (this.peerList.length <= 0) {
					
					this.waitingTimer.start();
					// 만약 상대가 없으면 자신의 정보를 서버에 등록하고 기다린다.
					$.get(StzServerConfig.getUpdateUrl(window.stz_peerId, EConnectStatus.WAITING), function(data, status) {
						StzCommon.StzLog.print("[Lobby (WaitingPeer)]");
					});
				} else {
					// 상대중 하나를 선택한 후, 접속 시도. 
					var randomIndex = 0;
					var oponentData = this.peerList[randomIndex];
					
					window.peerConn = window.stz_peer.connect(oponentData.peer_id);
					window.peerConn.on("open", function() {
						StzCommon.StzLog.print("[Lobby (PeerConnect)]");
						$.get(StzServerConfig.getUpdateUrl(this.stz_peerId, EConnectStatus.GAMING), (function(data, status){
							this.game.state.start("InGame", true, false, ETurn.WHITE);
						}).bind(this));
					}, this);
				}
			}
		}).bind(this));
		
		
	} else {
		// 기다리는 중이라면 대기 취소
		this.cancelWaitingPeer();
	}
};


Lobby.prototype.cancelWaitingPeer = function() {

	$.get(StzServerConfig.getUpdateUrl(window.stz_peerId, EConnectStatus.LOGIN), (function(data, status){
		StzCommon.StzLog.print("[Lobby (Cancel Waiting)]");
		this.isWaiting = false;
		this.waitingTimer.stop(true);
		this.scene.fTxt_stage.text = "START!";
		this.remainWaitingTime = StzServerConfig.EXPIRE_SECONDS;
	}).bind(this));
};
/*
Lobby.prototype.OnClickItem = function(sprite, pointer) {
	StzCommon.StzLog.print("[Lobby (OnClickItem)] click " + sprite.name);
	
	window.peerConn = window.stz_peer.connect(sprite.name);
	window.peerConn.on("open", function(){
		StzCommon.StzLog.print("[Lobby] (PeerConnect) ")
	});
	
};

Lobby.prototype.createPeerView = function(x, y, w, h, inText) {
	
	var btnGroup = this.game.add.group();
	btnGroup.position.setTo(x, y);

	var sprite = this.game.add.graphics(0, 0);
	sprite.beginFill(Phaser.Color.getRandomColor(100, 255), 1);
	sprite.bounds = new PIXI.Rectangle(0, 0, w, h);
	sprite.drawRect(0, 0, w, h);
	btnGroup.add(sprite);
	
	var txtPeerId = this.game.add.text(w / 2, h / 2, inText, {font: 'bold 32px Arial', fill: "#fff", align: 'center'});
	txtPeerId.anchor.set(0.5);
	btnGroup.add(txtPeerId);

	sprite.name = inText;
	sprite.inputEnabled = true;
	sprite.events.onInputDown.add(this.OnClickItem, this);
	//btnGroup.events.onInputDown.add(this.OnClickItem, this);
	return btnGroup;
};
*/