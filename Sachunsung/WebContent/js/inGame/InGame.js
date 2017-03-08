InGame.prototype = {
		pauseGame:null,
		stageData:null,
		limitTime:0,
		isPause:false,
		isReady:false,
		blocks:[],
		chekingArray:[],
		blockCount:0
};

function InGame() {
	Phaser.State.call(this);
}

var proto = Object.create(Phaser.State);
InGame.prototype = proto;

InGame.prototype.preload = function() {
	this.scene = new InGameScene(this.game);
};

InGame.prototype.init = function(stageData){
	this.stageData = stageData;
};

InGame.prototype.create = function() {
	this.blocks = [];
	this.chekingArray = [];
	
	this.isPause = true;
	this.isReady = false;
	
	this.scene.fRedBlind_png.visible = false;

	this.scene.fBtnPause.inputEnabled = true;
	this.scene.fBtnPause.events.onInputDown.add(this.onPause, this);
	
	this.storyMapInfoPopup = new PopupPauseGame(this.game, this);
	this.createBlock();
};

InGame.prototype.update = function() {
	if (this.isReady === false){
		this.showReadyMessage();
		return;
	}
	
	if (this.isPause === true) {
		return;
	}
};

InGame.prototype.showReadyMessage = function() {
	this.scene.fGameGo.visible = true;
	this.isReady = true;
	
	this.scene.fGameGo.alpha = 0;
	
	var tween = this.game.add.tween(this.scene.fGameGo);
	tween.to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
	
	tween.onComplete.addOnce(function() {
		this.scene.fGameGo.frameName = "gameGo.png";
		this.scene.fGameGo.alpha = 0;
		
		var tween = this.game.add.tween(this.scene.fGameGo);
		tween.to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true);
		
		tween.onComplete.addOnce(function() {
			this.scene.fGameGo.visible = false;
			this.isPause = false;
			
			this.shuffleBlock();
		},this);
	},this);
};

InGame.prototype.createBlock = function() {
	//한 종류의 블럭의 최대 수 
	var blockSetCount = this.stageData.stageInGameData.blockSetCount;
	var blockTypeCount = 0;
	
	var blockType = 1;
	
	this.blocks = [];

	for(var i=0;i<this.stageData.stageInGameData.patterns.length;i++){
		if(this.stageData.stageInGameData.patterns[i] === "0"){
			this.blocks.push("NONE");
			continue;
		}
		
		this.blocks.push(new Phaser.Plugin.block(this.game, this, i));
		this.blocks[i].readyBlockShow();
		this.blocks[i].setBlockType(blockType);
		
		blockTypeCount++;
		
		if(blockTypeCount === blockSetCount){
			blockTypeCount = 0;
			blockType++;
		}
	}
};

InGame.prototype.shuffleBlock = function() {
	var tempArray = [];
	for(var i=0;i<this.blocks.length;i++){
		if(this.blocks[i] == "NONE") continue;
		
		tempArray.push(this.blocks[i]);
	}
	
	tempArray = this.shuffleArray(tempArray);
	var temp = 0;
	
	for(var i=0;i<this.blocks.length;i++){
		if(this.blocks[i] == "NONE") continue;
		
		this.blocks[i] = tempArray[temp++];
		this.blocks[i].index = i;
		this.blocks[i].setBlockPos();
		this.blocks[i].startBlockShow();
	}
};

InGame.prototype.shuffleArray = function(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
};

InGame.prototype.checkBlock= function(index){
	if(this.chekingArray.length === 0 ){
		this.chekingArray.push(this.blocks[index]);
	}
	else if(this.chekingArray[0].getIndex() === index){
		this.chekingArray[0].startBlockShow();
		this.chekingArray = [];
	}
	else if(this.chekingArray.length === 1){
		this.chekingArray.push(this.blocks[index]);
		
		this.chekingArray[0].startBlockShow();
		this.chekingArray[1].startBlockShow();
		
		var result = this.findWay(this.chekingArray[0].getIndex(), this.chekingArray[1].getIndex());
		StzCommon.StzLog.print("result = " + result);
		
		if(result > 0){
			this.blocks[this.chekingArray[0].getIndex()].block.visible = false;
			this.blocks[this.chekingArray[1].getIndex()].block.visible = false;
			
			this.blocks[this.chekingArray[0].getIndex()] =  "NONE";
			this.blocks[this.chekingArray[1].getIndex()] =  "NONE";
			
			
		}
		this.chekingArray = [];
	}
	else{
		StzCommon.StzLog.print("[checkBlock] Error");
	}
};

InGame.prototype.findWay = function(src, des){

	if ( src == des || this.blocks[src] == null || this.blocks[des] == null )
	{
		return 0;
	}
	
	var src_value = this.blocks[src].blockType;
	var des_value = this.blocks[des].blockType;

	var boardWidth = StzGameConfig.BOARD_WIDTH;
	var boardHeight = StzGameConfig.BLOCK_HEIGHT;
	
	var start = 0;
	var end = 0;
	var xory = 0;
	var v = 0;
	
	var br1 = -1;
	var br2 = -1;
	
	if ( src_value != des_value )
	{
		return 0;
	}
	
//	toPointY(src) == toPointY(des). y가 같은 줄에 있는 상황
	if ( Math.floor(src / boardWidth) == Math.floor(des / boardWidth))
	{
		if ( (src_value == des_value) && (src_value > -1) && (des_value > -1) )
		{
			/// 붙어있는 상황
			if ( Math.abs((src % boardWidth) - (des % boardWidth)) == 1 )// check x
			{
				return 1;
			}
			start = this.isSmaller((src % boardWidth), (des % boardWidth));
			end = this.isBigger((src % boardWidth), (des % boardWidth));
			xory = Math.floor(src / boardWidth);
			
			var i = 0;
			for (i = start+1 ; i < end ; i++)
			{
				v = this.getBlockData(i + xory * boardWidth);
				if ( v != -1)
				{
					break;
				}
			}
			
			if (i == end)
			{
				return 1;
			}
		}
	}
	
//	toPointX(src) == toPointX(des). x가 같은 줄에 있는 상황
	else if ( (src % boardWidth) == (des % boardWidth) ) 
	{
		if ( Math.abs(Math.floor(src / boardWidth) - Math.floor(des / boardWidth)) == 1 )
		{
			/// 붙어있는 상황
			return 1;
		}
		start = this.isSmaller(Math.floor(src / boardWidth), Math.floor(des / boardWidth));
		end = this.isBigger(Math.floor(src / boardWidth), Math.floor(des / boardWidth));
		xory = (src % boardWidth);
		
		for (i = start+1 ; i < end ; i++)
		{
			v = this.getBlockData(xory + i * boardWidth);
			if ( v != -1)
			{
				break;
			}
		}
		
		if ( i == end )
		{
			return 2;
		}
	}
	
    // 두 패가 서로 다른 행과 열에 위치
    // src % boardWidth = 출발한 패의 행, des % boardWidth = 도착할 패의 행
    /// NOTE %는 행, /:나누면 열
	if( ((src % boardWidth) - (des % boardWidth) != 0) && (Math.floor(src / boardWidth) - Math.floor(des / boardWidth) != 0) )
	{
		/// 1번 꺽는 상황 체크(1번째 상황) :: 출발 패의 행 + 도착 패의 열 * 전체 행 수
		br1 = (src % boardWidth) + Math.floor(des / boardWidth) * boardWidth;
		
//		if( checkValue(src, des, br1) )
		if((src_value == des_value) && (src_value > 0) && (des_value > 0)&& this.blocks[br1] == "NONE" ) 
        // 두 패의 속성 체크
		{
			
			if(this.checkLineFree(src, br1) && this.checkLineFree(br1, des) ) //출발 패의 지점에서 꺽이는 지점까지 라인 체크, 꺽이는 지점에서 도착 패까지 라인 체크
			{
				return 3;
			}
		}
		
		/// 1번 꺽는 상황 체크(2번째 상황) :: 한 번 꺽은 지점은 오직 2개만 존재함으로
		br1 = (des % boardWidth) + Math.floor(src / boardWidth) * boardWidth;
		
		if((src_value == des_value) && (src_value > 0) && (des_value > 0) && this.blocks[br1]  == "NONE" ) // 두 패의 속성 체크
		{

			if( this.checkLineFree(src, br1) && this.checkLineFree(br1, des) )
			{
				return 3;
			}
		}
	}
	
	/// x좌표 작은 부분.
	var smallNum = this.isSmaller((src % boardWidth), (des % boardWidth));
	for( i = smallNum + 1; i < boardWidth; i++)
	{
		if( (i == (src % boardWidth)) || (i == (des % boardWidth)) )
		{
			continue;
		}
		
		/// 사이 혹은 우측을 통해 성립되는 부분 체크
		br1 = i + Math.floor(src / boardWidth) * boardWidth;
		br2 = i + Math.floor(des / boardWidth) * boardWidth;
//		if( checkValue(src, des, br1, br2) )
		if((src_value == des_value) && (src_value > 0) && (des_value > 0) && this.blocks[br1]  == "NONE" && this.blocks[br2]  == "NONE")
		{
//			result = checkFree(src, des, br1, br2);
			if( this.checkLineFree(src, br1) && this.checkLineFree(br1, br2) && this.checkLineFree(br2, des) )
			{
				return 4;
			}
		}
	}
	
	for( i = smallNum - 1 ; i >= 0; i--)
	{
		/// 좌측을 통해 성립되는 부분 체크
		if( (i == (src % boardWidth)) || (i == (des % boardWidth)) )
		{
			continue;
		}
		
		br1 = i + Math.floor(src / boardWidth) * boardWidth;
		br2 = i + Math.floor(des / boardWidth) * boardWidth;
//		if( checkValue(src, des, br1, br2) )
		if((src_value == des_value) && (src_value > -1) && (des_value > -1) && this.blocks[br1]  == "NONE" && this.blocks[br2]  == "NONE")
		{
			if( this.checkLineFree(src, br1) && this.checkLineFree(br1, br2) && this.checkLineFree(br2, des) )
			{
				return 4;
			}
		}
	}
	
	/// y좌표 작은 부분.
	smallNum = this.isSmaller(Math.floor(src / boardWidth), Math.floor(des / boardWidth));
	for( i = smallNum + 1; i < boardHeight; i++)
	{
		if( (i == Math.floor(src / boardWidth)) || (i == Math.floor(des / boardWidth)) )
		{
			continue;
		}
		
		/// 사이 혹은 아래쪽을 통해 되는 부분 체크
		br1 = (src % boardWidth) + i * boardWidth;
		br2 = (des % boardWidth) + i * boardWidth;
		
//		if( checkValue(src, des, br1, br2) )
		if((src_value == des_value) && (src_value > -1) && (des_value > -1) && this.blocks[br1]  == "NONE" && this.blocks[br2]  == "NONE")
		{
			if( this.checkLineFree(src, br1) && this.checkLineFree(br1, br2) && this.checkLineFree(br2, des) )
			{

				return 4;
			}
		}
	}
	
	for( i = smallNum - 1 ; i >= 0; i--)
	{
		if( (i == Math.floor(src / boardWidth)) || (i == Math.floor(des / boardWidth)) )
		{
			continue;
		}
		
		/// 위쪽을 통해 되는 부분 체크 
		br1 = (src % boardWidth) + i * boardWidth;
		br2 = (des % boardWidth) + i * boardWidth;
		
		if((src_value == des_value) && (src_value > 0) && (des_value > 0) && this.blocks[br1]  == "NONE" && this.blocks[br2]  == "NONE") 
        
		{
			if( this.checkLineFree(src, br1) && this.checkLineFree(br1, br2) && this.checkLineFree(br2, des) )
			{
				return 4;
			}
		}
	}
	return 0;
};

InGame.prototype.isSmaller = function(a,b){
	return (a>b)?b:a;
};

InGame.prototype.isBigger = function(a,b){
	return (a>b)?a:b;
};

InGame.prototype.getBlockData = function(idx){
	if(idx < this.blocks.length && idx > -1 && this.blocks[idx] != null)
	{
		if(this.blocks[idx] === "NONE") {
			
			return -1;
		}
		
			return 1;
	}
	return -1;
};

/**
 * 
 * 직선 라인에 대해 확인하는 로직
 * 
 * @param src
 * @param des
 * @return 
 * 
 * 1 : 붙어있는 상황, 2 : 직선 상황
 */
InGame.prototype.checkLineFree = function(src, des){
	var start;
	var end;
	var xory;
	var i;
	var v;
	var boardWidth = StzGameConfig.BOARD_WIDTH;
	
	if( (Math.floor(src / boardWidth)) == Math.floor(des / boardWidth))
	{
		if( Math.abs((src % boardWidth) - (des % boardWidth)) == 1 )
		{
			/// 붙어있는 상황
			return true;
		}
		start = this.isSmaller((src % boardWidth), (des % boardWidth));
		end = this.isBigger((src % boardWidth), (des % boardWidth));
		xory = Math.floor(src / boardWidth);
		
		for(i = start+1 ; i < end ; i++)
		{
			v = this.getBlockData(i + xory * boardWidth);
			if(v != -1)
				return false;
		}
			
		return true;
	}
	
	else if( (src % boardWidth) == (des % boardWidth) )
	{
		if( Math.abs(Math.floor(src / boardWidth) - Math.floor(des / boardWidth)) == 1 )
		{
			/// 붙어있는 상황
			return true;
		}

		start = this.isSmaller(Math.floor(src / boardWidth), Math.floor(des / boardWidth));
		end = this.isBigger(Math.floor(src / boardWidth), Math.floor(des / boardWidth));
		xory = (src % boardWidth);
			
		for(i = start+1 ; i < end ; i++)
		{
			v = this.getBlockData(xory + i * boardWidth);
			if(v != -1)
				return false;
		}
			
		return true;
		
	}
	else
	{
		StzCommon.StzLog.print("[checkLineFree] Error");
	}
};

InGame.prototype.onPause = function() {
	this.storyMapInfoPopup.onShow();
};

InGame.prototype.onDestory = function() {
	this.storyMapInfoPopup.onDestory();
	
	this.blocks = [];
};