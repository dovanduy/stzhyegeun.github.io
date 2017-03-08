function Lobby() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
Lobby.prototype = proto;

Lobby.prototype.init = function() {
	this.game.add.plugin(PhaserInput.Plugin);
};

Lobby.prototype.preload = function() {
	
};

Lobby.prototype.create = function() {
	
	var txtStyle = {
		font: 'bold 32px Arial', 
		fill: '#000000', 
		boundsAlignH: 'center',
		boundsAlignV: 'middle'
	};
	var noticeText = this.game.add.text(0, 0, '아이디를 입력해주세요', txtStyle);
	noticeText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
	noticeText.setTextBounds(0, 0, this.game.width, this.game.height / 2);
	
	this._inputField = this.game.add.inputField(this.game.width / 4 , this.game.height / 3, {
		font: '18px Arial', 
		fill: '#212121', 
		fontWeight: 'bold', 
		width: this.game.width / 2, 
		padding: 8, 
		borderWidth: 1, 
		borderColor: '#000', 
		borderRadius: 6,
		placeHolder: '아이디를 영어로 입력하세요.', 
		type: PhaserInput.InputType.text
	});
	
	var groupBtnDone = this.game.add.group();
	groupBtnDone.position.setTo(this.world.centerX - 100, this.world.centerY);
	// play button            
	this._btnInputDone = this.game.add.graphics(0, 0);            
	// draw a rectangle            
	this._btnInputDone.lineStyle(2, 0x000000, 1);            
	this._btnInputDone.beginFill(0xffffff, 1);            
	this._btnInputDone.drawRoundedRect(0, 0, 200, 50, 20);            
	this._btnInputDone.endFill();
	groupBtnDone.add(this._btnInputDone);
	// input            
	this._btnInputDone.inputEnabled = true;            
	this._btnInputDone.events.onInputDown.add(function () {                
		StzCommon.StzLog.print("[Lobby] Pressed by: " + this._inputField.text.text);
		
		if (this._inputField.text.text === undefined || this._inputField.text.text === '') {
			alert('아이디를 정확히 입력해주세요!');
			return;
		}
		
		this.game.state.start('Level', true, false, this._inputField.text.text);
	}, this);
	
	var txtBtnDone = this.game.add.text(0, 0, 'Done', {
		font: 'bold 24px Arial', 
		fill: '#000000', 
		boundsAlignH: 'center',
		boundsAlignV: 'middle'
	});
	txtBtnDone.setTextBounds(0, 0, 200, 50);
	groupBtnDone.add(txtBtnDone);
	
	this.game.state.add('Level', Level);
};

Lobby.prototype.update = function() {
	this._inputField.update();
};

Lobby.prototype.ConnectToServer = function() {
	
};