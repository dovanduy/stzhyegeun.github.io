
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * InviteUpdateView.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.
    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function InviteUpdateView(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _characterContainer = this.game.add.group(this);
	
	this.game.add.sprite(0, 0, 'shareAtlas', 'GET.png', _characterContainer);
	
	var _sprCharacter = this.game.add.sprite(492, 184, 'titleAtlas', '01.png', _characterContainer);
	_sprCharacter.angle = 239.99999999999997;
	_sprCharacter.anchor.setTo(0.5, 0.5);
	
	var _inviteContainer = this.game.add.group(this);
	
	this.game.add.sprite(0, 0, 'shareAtlas', 'CHATBOT_invite.png', _inviteContainer);
	
	var _crownContainer = this.game.add.group(this);
	
	this.game.add.sprite(0, 0, 'shareAtlas', 'STAGEGOLECROWN.png', _crownContainer);
	
	var _txtCrown = this.game.add.text(360, 325, 'STAGE 999 GOLD CROWN', {"font":"bold 50px Blogger Sans","fill":"#ffffff"}, _crownContainer);
	_txtCrown.anchor.setTo(0.5, 0.5);
	
	var _sprCrown = this.game.add.sprite(371, 169, 'titleAtlas', 'img_crown_02.png', _crownContainer);
	_sprCrown.anchor.setTo(0.5, 0.5);
	
	var _clearContainer = this.game.add.group(this);
	
	this.game.add.sprite(0, 0, 'shareAtlas', 'STAGECLEAR.png', _clearContainer);
	
	var _sprClearCharacter = this.game.add.sprite(517, 152, 'titleAtlas', '01.png', _clearContainer);
	_sprClearCharacter.angle = 238.0;
	_sprClearCharacter.anchor.setTo(0.5, 0.5);
	
	var _txtClear = this.game.add.text(360, 325, 'STAGE 999 CLEAR', {"font":"bold 50px Blogger Sans","fill":"#ffffff"}, _clearContainer);
	_txtClear.anchor.setTo(0.5, 0.5);
	
	var _resultContainer = this.game.add.group(this);
	
	this.game.add.sprite(0, 0, 'shareAtlas', 'IMONSTAGE.png', _resultContainer);
	
	var _txtResult = this.game.add.text(360, 325, 'I\'M ON STAGE 999', {"font":"bold 50px Blogger Sans","fill":"#ffffff"}, _resultContainer);
	_txtResult.anchor.setTo(0.5, 0.5);
	
	var _sprResultCharacter = this.game.add.sprite(521, 155, 'titleAtlas', '01.png', _resultContainer);
	_sprResultCharacter.angle = 238.99999999999997;
	_sprResultCharacter.anchor.setTo(0.5, 0.5);
	
	
	
	// public fields
	
	this.fCharacterContainer = _characterContainer;
	this.fSprCharacter = _sprCharacter;
	this.fInviteContainer = _inviteContainer;
	this.fCrownContainer = _crownContainer;
	this.fTxtCrown = _txtCrown;
	this.fSprCrown = _sprCrown;
	this.fClearContainer = _clearContainer;
	this.fSprClearCharacter = _sprClearCharacter;
	this.fTxtClear = _txtClear;
	this.fResultContainer = _resultContainer;
	this.fTxtResult = _txtResult;
	this.fSprResultCharacter = _sprResultCharacter;
	
}

/** @type Phaser.Group */
var InviteUpdateView_proto = Object.create(Phaser.Group.prototype);
InviteUpdateView.prototype = InviteUpdateView_proto;
InviteUpdateView.prototype.constructor = InviteUpdateView;

/* --- end generated code --- */
// -- user code here --

InviteUpdateView.prototype.setData = function(inType, inData){
	this.fInviteContainer.visible = false;
	this.fCharacterContainer.visible = false;
	this.fResultContainer.visible = false;
	this.fCrownContainer.visible = false;
	this.fClearContainer.visible = false;
	
	if(inType === EShareType.INVITE){
		this.fInviteContainer.visible = true;
	}
	else if(inType === EShareType.CHARACTER){
		this.fCharacterContainer.visible = true;
		this.fSprCharacter.loadTexture("titleAtlas", (inData.charId < 10) ? ("0"+inData.charId + ".png"): (inData.charId.toString() + ".png"));
	}
	else if(inType === EShareType.RESULT) {
		this.fResultContainer.visible = true;
		this.fSprResultCharacter.loadTexture("titleAtlas", (inData.charId < 10) ? ("0"+inData.charId + ".png") : (inData.charId.toString() + ".png"));
		this.fTxtResult.text = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_fail_img),
		{stage_num: inData.stage});
	}
	else if (inType === EShareType.CROWN) {
		this.fCrownContainer.visible = true;

		switch(inData.crown) {
			case 2:
			this.fSprCrown.loadTexture("titleAtlas", "img_crown_02.png");
			break;
			case 1:
			this.fSprCrown.loadTexture("titleAtlas", "img_crown_01.png");
			break;
		}

		this.fTxtCrown.text = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_crown_img),
		{stage_num: inData.stage, crown_grade: (inData.crown === 2) ? StzTrans.translate(StaticManager.ELocale.gold_crown) : StzTrans.translate(StaticManager.ELocale.silver_crown)});
	}
	else if (inType === EShareType.CLEAR) {
		this.fClearContainer.visible = true;
		this.fSprClearCharacter.loadTexture("titleAtlas", (inData.charId < 10) ? ("0"+inData.charId + ".png") : (inData.charId.toString() + ".png"));
		this.fTxtClear.text = StzUtil.strFormatObj(StzTrans.translate(StaticManager.ELocale.share_msg_clear_img),
		{stage_num: inData.stage});
	}
};