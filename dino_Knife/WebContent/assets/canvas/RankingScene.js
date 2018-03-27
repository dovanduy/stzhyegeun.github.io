
// -- user code here --

/* --- start generated code --- */

// Generated by  1.4.4 (Phaser v2.6.2)


/**
 * RankingScene.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Phaser.Group} aParent The parent Group (or other {@link DisplayObject}) that this group will be added to.    If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
 * @param {string} aName A name for this group. Not used internally but useful for debugging.
 * @param {boolean} aAddToStage If true this group will be added directly to the Game.Stage instead of Game.World.
 * @param {boolean} aEnableBody If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
 * @param {number} aPhysicsBodyType The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
 */
function RankingScene(aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType) {
	
	Phaser.Group.call(this, aGame, aParent, aName, aAddToStage, aEnableBody, aPhysicsBodyType);
	var _listContainer = this.game.add.group(this);
	
	var _itemList = this.game.add.group(this);
	
	var _btnClose = this.game.add.sprite(636, 85, 'mainAtlas', 'x_btn.png', this);
	_btnClose.anchor.setTo(0.5, 0.5);
	_btnClose.tint = 0xc0c0c0;
	
	this.game.add.text(202, 46, 'RANKING', {"font":"bold 72px Lilita One","fill":"#ffffff"}, this);
	
	
	// public fields
	
	this.fListContainer = _listContainer;
	this.fItemList = _itemList;
	this.fBtnClose = _btnClose;
	/* --- post-init-begin --- */
	//리스트 컨트롤
	{
		this.updateItemList();

		this.meIndex = this.getMeIndex(this.totalListData);
		this.listSize = 162;
		
		var listMaskRect = new Phaser.Rectangle(0, 200, 720, 920);
	    var listHitRect = new Phaser.Rectangle(0, 200, 720, 920);
	    
	    var listData = {
				'maskRect' : listMaskRect,
				'hitRect' : listHitRect,
				'listSize' : this.listSize,
				'listOffset' : 200,
				'listType'	 : EListType.VERTICAL_LISTVIEW
				};
	    this.listBox = new ListBoxController(this.game, this.totalListData,  this.fItemList, listData);
	    this.listBox.onDragDown = this.onDragDown.bind(this);
	    this.listBox.onDragUP = this.onDragUp.bind(this);
	    this.listBox.onUpdate = this.onUpdate.bind(this);
	 
	    this.fListContainer.add(this.listBox.getSprite());

	}

	this.fBtnClose.inputEnabled = true;
	this.fBtnClose.events.onInputUp.add(function(){
		window.sounds.sound('sfx_button').play();
		this.game.state.getCurrentState().toggleRankScene();
	}.bind(this));
	/* --- post-init-end --- */
	
	
}

/** @type Phaser.Group */
var RankingScene_proto = Object.create(Phaser.Group.prototype);
RankingScene.prototype = RankingScene_proto;
RankingScene.prototype.constructor = RankingScene;

/* --- end generated code --- */
// -- user code here --
RankingScene.prototype.preMoveCallBack = function(){
	if(this.listBox){
		this.listBox.setDrag(true);
		this.initItemList(this.listBox.drawingList);
	}
};

RankingScene.prototype.updateItemList = function() {
	this.totalListData = this.getListData(PlayerDataManager.getTestFriends());
};


RankingScene.prototype.getListData = function(inFriendArray){
	var totalList = [];
	var friendList = inFriendArray;

	for (var key in friendList) {
		totalList.push(friendList[key]);
	} 
	totalList.push(PlayerDataManager.getPlayer());
	totalList.sort(function(a, b) {
		return b.bestStage - a.bestStage;
	});
	return totalList;
};

RankingScene.prototype.onClose = function(){
	if(this.listBox){
		this.listBox.setDrag(false);
		this.listBox.onClose();
	}
};

RankingScene.prototype.getMeIndex= function(totalList){
	// Find Me Index
	var meIndex = 0;
	while(meIndex < totalList.length) {
		if (PlayerDataManager.profileInfo.getUserId() == totalList[meIndex].profileInfo.getUserId()) {
			break;
		}
		meIndex++;
	}
	
	if (meIndex === totalList.length) {
		return 0;
		//throw new Error("My data not exist in ranking list");
	}
	
	return meIndex;
};

RankingScene.prototype.initItemList = function(drawingList){
	var count = 0;
	var startIndex = 0;
	var endIndex = 0;
	
	for (var index = this.meIndex; index >= 0; index--) {
		if(++count > this.listBox.drawingListMaxCount/2){
			startIndex = index;
			break;
		}
		
		if(index === 0){
			startIndex = index;
		}
	}
	
	for (var index = this.meIndex + 1; index < this.totalListData.length; index++) {
		if(++count > this.listBox.drawingListMaxCount){
			break;
		}
	}
	endIndex = index;
	
	for (var index = startIndex; index < endIndex; index++) {
		var currentItem = new RankingSceneItem(this.game, this.fItemList, "", false);
		currentItem.setData(index + 1, this.totalListData[index]);
		currentItem.position.setTo(0, this.listSize * index + 200);
		drawingList.push({'item' : currentItem, 'index' : index});
	}
	this.isLoading = true;
	this.listBox.updateItem(drawingList);
	this.listBox.movePostion(this.meIndex);
};

RankingScene.prototype.onDragDown = function(_curLastIndex, _endIndex, _drawingList){
	var curLastIndex = _curLastIndex;
	var endIndex = _endIndex;
	var drawingList = _drawingList;
	
	for (var index = curLastIndex; index < endIndex; index++) {
		var currentItem = new RankingSceneItem(this.game, this.fItemList, "", false);
		currentItem.setData(index + 1, this.totalListData[index]);
		currentItem.position.setTo(0, this.listSize * index + 200);
		drawingList.push({'item' : currentItem, 'index' : index});
	}
	this.listBox.updateItem(drawingList);
};

RankingScene.prototype.onDragUp = function(_curFirstIndex, _endIndex, _drawingList){
	var curFirstIndex = _curFirstIndex;
	var endIndex = _endIndex;
	var drawingList = _drawingList;

	for (var index = curFirstIndex; index >= endIndex; index--) {
		var currentItem = new RankingSceneItem(this.game, this.fItemList, "", false);
		currentItem.setData(index + 1, this.totalListData[index]);
		currentItem.position.setTo(0, this.listSize * index + 200);
		drawingList.unshift({'item' : currentItem, 'index' : index});
	}
	this.listBox.updateItem(drawingList);
};

RankingScene.prototype.onUpdate = function(){

};

RankingScene.prototype.superDestroy = RankingScene.prototype.destroy;
RankingScene.prototype.destroy = function(destroyChildren, soft) {
	if (this.fItemList) {
		this.fItemList.destroy();
	}
	this.superDestroy(destroyChildren, soft);
};