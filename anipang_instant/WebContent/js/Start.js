function _StartPreferences(){
	this.GAME_WIDTH = 480;
	this.GAME_HEIGHT = 800;
	this.INGAME_UI_TOP_OFFSET = 172;
	this.INGAME_UI_LEFT_OFFSET = -3;
	this.GEM_SIZE = 68;
	this.GEM_SPACING = 0;
	this.GEM_SIZE_SPACED = this.GEM_SIZE + this.GEM_SPACING;
	this.GEM_TWEEN_SPEED = 150;
	this.BOARD_COLS = 7;
	this.BOARD_ROWS = 7;
	this.MATCH_MIN = 3;
	this.SCORE_PER_GEM = 10;
	this.GEM_REFILL_DURATION_TIME = 50;
	this.GAME_LIMIT_TIME = 60;
	this.GAME_TIMER_DURATION_MS = 250;
	this.GAUGE_TIMER_BODY_INITIAL_SCALE = 0.8;
	this.UNIT_SCORE						= 100;
	this.COMBO_TIME						= 1500;
}
var StartPreferences = new _StartPreferences();

var selectedGem = null;
var selectedGemStartPos;
var selectedGemTween = null;
var tempShiftedGem = null;
var allowInput;
var scoreText;
var comboText;
var isFocus = false;

var startTimestamp = 0;
var pauseTimestamp = 0;
var remainSecond = 0;

var startComboStamp = 0;
var comboDeltaTime = 0;
var isComboUp = false;

var remainTimeText = 0;

var isPause = false;
var isReady = false;

var resultPopup;

function Start() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Start.prototype = proto;

Start.prototype.init = function() {
	socket.onRealRoomMessasge = (this.onRealRoomMessage).bind(this); 
};

Start.prototype.onRealRoomMessage = function(data) {
	
	if (data.sid === socket._mySessionId) {
		return;
	}
	
	if (this.rivalText) {
		var rivalData = JSON.parse(data.m);
		this.rivalText.text = "Score: " + rivalData.score + ", Combo: " + rivalData.combo;
		console.log('[Start] onRealRoomMessage - Score: ' + rivalData.score + ', Combo: ' + rivalData.combo);
	}
};

Start.prototype.preload = function() {
	if (window.FBInstant) {
        var imageSrc = FBInstant.player.getPhoto();
    	this.game.load.crossOrigin = 'Anonymous';
        this.game.load.image('myProfileImage', imageSrc);
    }
};

Start.prototype.create = function() {
	
	// set the gem spritesheet to a random frame
	this.frameArray = [{normal : 0, click : 7},
	                  {normal : 1, click : 11},
	                  {normal : 2, click : 12},
	                  {normal : 5, click : 3},
	                  {normal : 6, click : 4},
	                  {normal : 10, click : 8}];
	// select a gem and remember its starting position
	this._preGem = null;
	
	this.initUI();
	
	var rivalStyle = {
		font: 'bold 15px Arial', 
		fill: '#fff'
	};
	this.rivalText = this.game.add.text(0, 0, "", rivalStyle);
	
	this.spawnBoard();
	
	 // currently selected gem starting position. used to stop player form
	// moving gems too far.
    selectedGemStartPos = { x: 0, y: 0 };
    
	resultPopup = new PopupResult();
	resultPopup.init(this.game, this);
	
    this.checkAllAndKillGemMatches();
    
    this.game.input.addMoveCallback(this.slideGem, this);

    allowInput = true;
	isPause = false;
	isComboUp = false;
	isReady = false;
};

Start.prototype.update = function() {
	if (isPause === true) {
		return;
	}
	
	if (isReady === false){
		this.showReadyMessage();
		return;
	}

	var currentTimestamp = (new Date()).getTime();
	remainSecond = StartPreferences.GAME_LIMIT_TIME - ((currentTimestamp - startTimestamp) / 1000);

    if(startComboStamp != 0) {
        var currentComboStamp = (new Date()).getTime();
        comboDeltaTime = currentComboStamp - startComboStamp;
        comboText.text = Score.getCombo();
        
        if(isComboUp === true){
            this.scene.fImg_Combo.alpha = 0;
            comboText.alpha = 0;
        }
        
        if(comboText.alpha < 1){
            this.scene.fImg_Combo.alpha += 0.02;
            comboText.alpha += 0.02;
        }
    
        if(Score.setCombo(comboDeltaTime, isComboUp) === 0){
            startComboStamp = 0;
            
            this.scene.fImg_Combo.alpha = 0;
            comboText.alpha = 0;
        }
    }
    
    isComboUp = false;
    scoreText.text = Score.getScore();

    if (remainSecond > 0) {
        this.scene.fImg_time_gauge_body.scale.x = (StartPreferences.GAUGE_TIMER_BODY_INITIAL_SCALE / StartPreferences.GAME_LIMIT_TIME * remainSecond);
        this.scene.fImg_time_gauge_tail.x = this.scene.fImg_time_gauge_body.x + this.scene.fImg_time_gauge_body.width;
        
        remainTimeText.text = remainSecond.toFixed(2) + "";
    } else {
        allowInput = false;
        remainTimeText.text = 0.00 + "";


        // / 최고 점수 업데이트
        if(resultPopup.isUpdate == false){
             this.showEnd();
        }
        else{
            resultPopup.update();
        }
    }
};

Start.prototype.showEnd = function(){
	this.scene.fBlind.visible = true;
	this.scene.fInGameMessagePopup.visible = true;
	this.scene.fMessageTimeOver.visible = true;
	if(this.scene.fMessageTimeOver.alpha < 1){
		this.scene.fMessageTimeOver.alpha += 0.02;
	}
	else {
		this.scene.fInGameMessagePopup.visible = false;
		Score.setMaxScore();
		resultPopup.show(Score.getScore());
	}	

	if (window.FBInstant) {
        FBInstant.setScore(Score.score);
        FBInstant.takeScreenshotAsync().then(function() {

        });
        FBInstant.endGameAsync().then(function() {
            // The player is now guaranteed to have already tapped "restart".
            this.restartGame();
        });    
    } 
};

Start.prototype.showReadyMessage = function(){
	if(this.scene.fInGameMessagePopup.visible === false){
		this.scene.fInGameMessagePopup.visible = true;
		
		this.scene.fBlind.visible = true;
		
		var messageGroup = this.game.add.group();
		messageGroup.add(this.scene.fInGameMessagePopup);
		this.scene.fGameBoard.bringToTop(messageGroup);

	}
	
	if(this.scene.fMessageReady.alpha < 1){
		this.scene.fMessageReady.alpha += 0.03;
	}
	else if(this.scene.fMessageReady.alpha >= 1){
		if(this.scene.fMessageGo.alpha < 1){
			this.scene.fMessageGo.alpha += 0.03;
		}
		else{
			this.scene.fInGameMessagePopup.visible = false;
			this.scene.fMessageGo.alpha = 0 ;
			this.scene.fMessageReady.alpha = 0 ;
			
			if(startTimestamp == 0){
				startTimestamp = (new Date()).getTime();
			}
			else{
				var currentTimestamp = (new Date()).getTime();
				var offsetTimestampFromPause = currentTimestamp - pauseTimestamp;
				startTimestamp += offsetTimestampFromPause;
			}
			
			this.scene.fBlind.visible = false;
			isReady = true;
		}
	}	
};

Start.prototype.initUI = function () {
	this.scene = new startScene(this.game);
	this.game.time.advancedTiming = true;

	this.scene.fBtn_game_pause.inputEnalbed = true;
	this.scene.fBtn_game_pause.events.onInputDown.add(this.pauseGame, this);
	this.scene.fBtn_game_pause.visible = true;
	
	this.scene.fBtn_game_resume.inputEnabled = true;
	this.scene.fBtn_game_resume.events.onInputDown.add(this.resumeGame, this);
	this.scene.fBtn_game_resume.visible = false;
	
	this.scene.fBtn_popup_resume.inputEnabled = true;
	this.scene.fBtn_popup_resume.events.onInputDown.add(this.resumeGame, this);
	
	this.scene.fBtn_popup_restart.inputEnabled = true;
	this.scene.fBtn_popup_restart.events.onInputDown.add(this.restartGame, this);
	
	this.scene.fBtn_popup_go_main.inputEnabled = true;
	this.scene.fBtn_popup_go_main.events.onInputDown.add(this.exitGame, this);
	
	this.scene.fPopupPause.visible = false;
	
	this.scene.fInGameMessagePopup.visible = false;
	this.scene.fMessageGo.alpha = 0 ;
	this.scene.fMessageReady.alpha = 0 ;
	this.scene.fMessageTimeOver.alpha = 0 ;
	
	scoreText = window.game.add.bitmapText(240, 70, 'textScore', '0', 30);
	scoreText.anchor.set(0.5);
	
	comboText = window.game.add.bitmapText(420, 125, 'comboFont', '0', 35);
	comboText.anchor.set(0.5);

	if (this.game.cache.checkImageKey('myProfileImage') === true) {
		var profileImage = this.game.add.image(61, 57, 'myProfileImage');
	    profileImage.anchor.setTo(0.5, 0.5);
	    var ratio = 62 / profileImage.width;
	    profileImage.scale.setTo(ratio, ratio);	
	}

	this.scene.fImg_Combo.alpha = 0;
	comboText.alpha = 0;
	
	remainTimeText = window.game.add.text(230, 718, StartPreferences.GAME_LIMIT_TIME.toFixed(2), {
		fontSize : '18px',
		fill : '#000'
	});
	remainTimeText.anchor.set(0.5);	
	
	Score.setInit();
	
	startTimestamp = 0;
	startComboStamp = 0;

    if (resultPopup !== undefined && resultPopup.isUpdate === true) {
        resultPopup.close();
    }
};

Start.prototype.pauseGame = function() {
	this.scene.fBlind.visible = true;
	pauseTimestamp = (new Date()).getTime();
	allowInput = false;
	
	var popupGroup = this.game.add.group();
	popupGroup.add(this.scene.fPopupPause);
	this.scene.fGameBoard.bringToTop(popupGroup);

	this.scene.fPopupPause.visible = true;
	
	this.scene.fBtn_game_pause.visible = false;
	this.scene.fBtn_game_resume.visible = true;
};

Start.prototype.resumeGame = function () {
	
	this.scene.fPopupPause.visible = false;
	
	allowInput = true;
	isPause = false;
	isReady = false;
	
	this.scene.fBtn_game_pause.visible = true;
	this.scene.fBtn_game_resume.visible = false;
};

Start.prototype.restartGame = function() {
	
	this.initUI();
	
	this.resumeGame();
	
	this.create();
};

Start.prototype.exitGame = function() {
	if (window.FBInstant) {
        FBInstant.endGameAsync().then(function() {
            this.restartGame();
        });    
    } else {
        this.restartGame();
    }
	
};

var currentPlayingAnimations = {};
Start.prototype.playAnimations = function(inName, inPosX, inPosY, inCallback) {
	
	if (currentPlayingAnimations.hasOwnProperty(inName) && currentPlayingAnimations[inName] == true) {
		return;
	}
	
	if (inName === "animTimeOver") {
		
		var timeOverAnim = this.game.add.sprite(174, 295, "EFFECTS");
		timeOverAnim.animations.add("timeover", Phaser.Animation.generateFrameNames("animTimeOver", 0, 42, "", 4), 30, false);
		timeOverAnim.animations.play("timeover");
		currentPlayingAnimations[inName] = true;	
		
		timeOverAnim.animations.currentAnim.onComplete.add(function() {
			this.pauseGame();
			currentPlayingAnimations[inName] = false;
			timeOverAnim.destroy();
		}, this);
	}
	
	if (inName == "animBlockMatch") {
		var blockMatchAnim = game.add.sprite((inPosX  * StartPreferences.GEM_SIZE) + StartPreferences.INGAME_UI_LEFT_OFFSET
				, (inPosY  * StartPreferences.GEM_SIZE), "EFFECTS");
		blockMatchAnim.anchor.set(0.4, 0.6);
		blockMatchAnim.animations.add("blockmatch", Phaser.Animation.generateFrameNames("animBlockMatchEffect", 0, 5, "", 4), 30, false);
		blockMatchAnim.animations.play("blockmatch");
		this.scene.fGameBoard.add(blockMatchAnim);
		
		blockMatchAnim.animations.currentAnim.onComplete.add(function() {
			blockMatchAnim.destroy();
		}, this);
	}
};

var showReadyDelta = 0;
Start.prototype.spawnBoard = function() {

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        for (var j = 0; j < StartPreferences.BOARD_ROWS; j++)
        {
        	var gem = this.scene.fGameBoard.create((i * StartPreferences.GEM_SIZE_SPACED) + StartPreferences.INGAME_UI_LEFT_OFFSET,
    		(j * StartPreferences.GEM_SIZE_SPACED), "GEMS");
        	
            gem.name = 'gem' + i.toString() + 'x' + j.toString();
            gem.inputEnabled = true;
            gem.events.onInputDown.add(this.selectGem.bind(this));
            gem.events.onInputUp.add(this.releaseGem.bind(this));
            this.randomizeGemColor(gem);
            this.setGemPos(gem, i, j); // each gem has a position on the board
        }
    } 
};

Start.prototype.randomizeGemColor = function(gem) {
	gem.frame = this.frameArray[this.game.rnd.integerInRange(0, 5)].normal;
};

Start.prototype.setGemPos = function(gem, posX, posY) {
	// set the position on the board for a gem
	gem.posX = posX;
	gem.posY = posY;
	gem.id = this.calcGemId(posX, posY);
};

Start.prototype.calcGemId = function(posX, posY) {
	return posX + posY * StartPreferences.BOARD_COLS;
};

Start.prototype.slideGem = function(pointer, x, y) {
	// check if a selected gem should be moved and do it
	if (selectedGem && pointer.isDown)
    {
        var cursorGemPosX = this.getGemPos(x, true);
        var cursorGemPosY = this.getGemPos(y, false);

        if (this.checkIfGemCanBeMovedHere(selectedGemStartPos.x, selectedGemStartPos.y, cursorGemPosX, cursorGemPosY))
        {
            if (cursorGemPosX !== selectedGem.posX || cursorGemPosY !== selectedGem.posY)
            {
                // move currently selected gem
                if (selectedGemTween !== null)
                {
                    game.tweens.remove(selectedGemTween);
                }

                selectedGemTween = this.tweenGemPos(selectedGem, cursorGemPosX, cursorGemPosY);

                this.scene.fGameBoard.bringToTop(selectedGem);

                // if we moved a gem to make way for the selected gem earlier,
				// move it back into its starting position
                if (tempShiftedGem !== null)
                {
                    this.tweenGemPos(tempShiftedGem, selectedGem.posX , selectedGem.posY);
                    this.swapGemPosition(selectedGem, tempShiftedGem);
                }

                // when the player moves the selected gem, we need to swap the
				// position of the selected gem with the gem currently in that
				// position
                tempShiftedGem = this.getGem(cursorGemPosX, cursorGemPosY);

                if (tempShiftedGem === selectedGem)
                {
                    tempShiftedGem = null;
                }
                else
                {
                    this.tweenGemPos(tempShiftedGem, selectedGem.posX, selectedGem.posY);
                    this.swapGemPosition(selectedGem, tempShiftedGem);
                }
            }
        }
    }
};

Start.prototype.selectGem = function(gem) {
	if (allowInput && isReady)
    {
    	if(this._preGem != null){
    		for(var i = 0; i < this.frameArray.length; i++){
    			if(this._preGem.frame == this.frameArray[i].click){
    				this._preGem.frame = this.frameArray[i].normal;
    			}
    		}
    	}
    	
    	for(var i = 0; i < this.frameArray.length; i++){
			if(gem.frame == this.frameArray[i].normal){
				gem.frame = this.frameArray[i].click;
			}
		}
    	
        selectedGem = gem;
        selectedGemStartPos.x = gem.posX;
        selectedGemStartPos.y = gem.posY;
        
        this._preGem = gem;
    }
};

Start.prototype.releaseGem = function() {
	if (tempShiftedGem == null && isFocus === false) {
        selectedGem = null;
        return;
    }
    
    if(this._preGem != null){
		for(var i = 0; i < this.frameArray.length; i++){
			if(this._preGem.frame == this.frameArray[i].click){
				this._preGem.frame = this.frameArray[i].normal;
			}
		}
	}
	
    isFocus = false;

    // when the mouse is released with a gem selected
    // 1) check for matches
    // 2) remove matched gems
    // 3) drop down gems above removed gems
    // 4) refill the board

    this.game.time.events.add(200, (function(){
        this.checkAndKillGemMatches();

        this.removeKilledGems();

        var dropGemDuration = this.dropGems();

        // delay board refilling until all existing gems have dropped down
        this.game.time.events.add(dropGemDuration * 50, this.refillBoard.bind(this));

        allowInput = false;

        selectedGem = null;
        tempShiftedGem = null;    	
    }).bind(this));
};

Start.prototype.getGem = function(posX, posY) {
	// find a gem on the board according to its position on the board	
	return this.scene.fGameBoard.iterate("id", this.calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
};

Start.prototype.getGemColor = function(gem) {
	// since the gems are a spritesheet, their color is the same as the current
	// frame number
	return gem.frame;
};

Start.prototype.checkIfGemCanBeMovedHere = function(fromPosX, fromPosY, toPosX, toPosY) {
	// gems can only be moved 1 square up/down or left/right
	if (toPosX < 0 || toPosX >= StartPreferences.BOARD_COLS || toPosY < 0 || toPosY >= StartPreferences.BOARD_ROWS)
    {
        return false;
    }

    if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1)
    {
        return true;
    }

    if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1)
    {
        return true;
    }

    return false;
};


Start.prototype.countSameColorGems = function(startGem, moveX, moveY) {
	// count how many gems of the same color lie in a given direction
	// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie
	// to the right of the gem
	// stops counting as soon as a gem of a different color or the board end is
	// encountered
	var curX = startGem.posX + moveX;
    var curY = startGem.posY + moveY;
    var count = 0;

    while (curX >= 0 && curY >= 0 && curX < StartPreferences.BOARD_COLS && curY < StartPreferences.BOARD_ROWS && this.getGemColor(this.getGem(curX, curY)) === this.getGemColor(startGem))
    {
        count++;
        curX += moveX;
        curY += moveY;
    }

    return count;
};


Start.prototype.swapGemPosition = function(gem1, gem2) {
	// swap the position of 2 gems when the player drags the selected gem into a new location
	var tempPosX = gem1.posX;
    var tempPosY = gem1.posY;
    this.setGemPos(gem1, gem2.posX, gem2.posY);
    this.setGemPos(gem2, tempPosX, tempPosY);
};

Start.prototype.checkAndKillGemMatches = function() {
	// count how many gems of the same color are above, below, to the left and right
	// if there are more than 3 matched horizontally or vertically, kill those gems
	// if no match was made, move the gems back into their starting positions	
	if (selectedGem === null) { return; }

    if (tempShiftedGem === null ) { return; }

    var canKill = false;

    // process the selected gem

    var countUp = this.countSameColorGems(selectedGem, 0, -1);
    var countDown = this.countSameColorGems(selectedGem, 0, 1);
    var countLeft = this.countSameColorGems(selectedGem, -1, 0);
    var countRight = this.countSameColorGems(selectedGem, 1, 0);

    var countHoriz = countLeft + countRight + 1;
    var countVert = countUp + countDown + 1;

    if (countVert >= StartPreferences.MATCH_MIN)
    {
        this.killGemRange(selectedGem.posX, selectedGem.posY - countUp, selectedGem.posX, selectedGem.posY + countDown);
        Score.setScore(countVert);
        canKill = true;
    }

    if (countHoriz >= StartPreferences.MATCH_MIN)
    {
        this.killGemRange(selectedGem.posX - countLeft, selectedGem.posY, selectedGem.posX + countRight, selectedGem.posY);
        Score.setScore(countHoriz);
        canKill = true;
    }

    // now process the shifted (swapped) gem

    countUp = this.countSameColorGems(tempShiftedGem, 0, -1);
    countDown = this.countSameColorGems(tempShiftedGem, 0, 1);
    countLeft = this.countSameColorGems(tempShiftedGem, -1, 0);
    countRight = this.countSameColorGems(tempShiftedGem, 1, 0);

    countHoriz = countLeft + countRight + 1;
    countVert = countUp + countDown + 1;

    if (countVert >= StartPreferences.MATCH_MIN)
    {
        this.killGemRange(tempShiftedGem.posX, tempShiftedGem.posY - countUp, tempShiftedGem.posX, tempShiftedGem.posY + countDown);
        Score.setScore(countVert);
        canKill = true;
    }

    if (countHoriz >= StartPreferences.MATCH_MIN)
    {
        this.killGemRange(tempShiftedGem.posX - countLeft, tempShiftedGem.posY, tempShiftedGem.posX + countRight, tempShiftedGem.posY);
        Score.setScore(countHoriz);
        canKill = true;
    }

    if (! canKill) // there are no matches so swap the gems back to the
					// original positions
    {
        var gem = selectedGem;

        if (gem.posX !== selectedGemStartPos.x || gem.posY !== selectedGemStartPos.y)
        {
            if (selectedGemTween !== null)
            {
                game.tweens.remove(selectedGemTween);
            }

            selectedGemTween = this.tweenGemPos(gem, selectedGemStartPos.x, selectedGemStartPos.y);

            if (tempShiftedGem !== null)
            {
                this.tweenGemPos(tempShiftedGem, gem.posX, gem.posY);
            }

            this.swapGemPosition(gem, tempShiftedGem);

            tempShiftedGem = null;

        }
    }
    else{
    	
    	startComboStamp = (new Date()).getTime();
    	isComboUp = true;
    	socket.realSendMessage(JSON.stringify({'combo': Score.getCombo(), 'score': Score.score}), false);
    }
};

Start.prototype.checkAllAndKillGemMatches = function() {
	var canKill = false;
	for(var i =0; i < this.scene.fGameBoard.length; i++)
	{
		var gem = this.scene.fGameBoard.children[i];
		if( gem != null)
		{
			countUp = this.countSameColorGems(gem, 0, -1);
			countDown = this.countSameColorGems(gem, 0, 1);
			countLeft = this.countSameColorGems(gem, -1, 0);
			countRight = this.countSameColorGems(gem, 1, 0);
			
			countHoriz = countLeft + countRight + 1;
			countVert = countUp + countDown + 1;
			
			if (countVert >= StartPreferences.MATCH_MIN)
			{
				this.killGemRange(gem.posX, gem.posY - countUp, gem.posX, gem.posY + countDown);
				Score.setScore(countVert);
				canKill = true;
			}

			if (countHoriz >= StartPreferences.MATCH_MIN)
			{
			    this.killGemRange(gem.posX - countLeft, gem.posY, gem.posX + countRight, gem.posY);
			    Score.setScore(countHoriz);
			    canKill = true;
			}
		}
	}
	if(canKill === true){
		isFocus = true;
		var dropGemDuration = this.dropGems();
	    // delay board refilling until all existing gems have dropped down
	    this.game.time.events.add(dropGemDuration * 50, this.releaseGem.bind(this));
	    socket.realSendMessage(JSON.stringify({'combo': Score.getCombo(), 'score': Score.score}), false);
	}
	else{
		startComboStamp = (new Date()).getTime();
	}
};

Start.prototype.killGemRange = function(fromX, fromY, toX, toY) {
	// kill all gems from a starting position to an end position
	var tempFromX = Phaser.Math.clamp(fromX, 0, StartPreferences.BOARD_COLS - 1);
    var tempFromY = Phaser.Math.clamp(fromY , 0, StartPreferences.BOARD_ROWS - 1);
    var tempToX = Phaser.Math.clamp(toX, 0, StartPreferences.BOARD_COLS - 1);
    var tempToY = Phaser.Math.clamp(toY, 0, StartPreferences.BOARD_ROWS - 1);

    for (var i = tempFromX; i <= tempToX; i++)
    {
        for (var j = tempFromY; j <= tempToY; j++)
        {
        	this.playAnimations('animBlockMatch', i, j, null);
            var gem = this.getGem(i, j);
            gem.kill();
            gem = null;
        }
    }
};

Start.prototype.removeKilledGems = function() {
	// move gems that have been killed off the board
	this.scene.fGameBoard.forEach(function(gem) {
        if (!gem.alive) {
            this.setGemPos(gem, -1,-1);
        }
    }, this);
};


Start.prototype.tweenDropGemPos = function(gem, newPosX, newPosY, durationMultiplier, inAfterCallback) {
	var tween = game.add.tween(gem).to({y: (newPosY * StartPreferences.GEM_SIZE_SPACED)}, 500, 'Quart.easeOut', true);
    return tween;
};

Start.prototype.tweenGemPos = function(gem, newPosX, newPosY, durationMultiplier, inAfterCallback) {
	// animated gem movement
	var tween = game.add.tween(gem).to({x: (newPosX  * StartPreferences.GEM_SIZE) + StartPreferences.INGAME_UI_LEFT_OFFSET
    	, y: (newPosY * StartPreferences.GEM_SIZE_SPACED)}, 150, Phaser.Easing.Linear.None, true);
    return tween;
};


Start.prototype.dropGems = function() {
	// look for gems with empty space beneath them and move them down
	var dropRowCountMax = 0;

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        var dropRowCount = 0;

        for (var j = StartPreferences.BOARD_ROWS - 1; j >= 0; j--)
        {
            var gem = this.getGem(i, j);

            if (gem === null)
            {
                dropRowCount++;
            }
            else if (dropRowCount > 0)
            {
                this.setGemPos(gem, gem.posX, gem.posY + dropRowCount);
                this.tweenDropGemPos(gem, gem.posX, gem.posY, dropRowCount);
                //tweenGemPos(gem, gem.posX, gem.posY, dropRowCount);
            }
        }

        dropRowCountMax = Math.max(dropRowCount, dropRowCountMax);
    }

    return dropRowCountMax;
};


Start.prototype.refillBoard = function() {
	// look for any empty spots on the board and spawn new gems in their place that
	// fall down from above	
	var maxGemsMissingFromCol = 0;

    for (var i = 0; i < StartPreferences.BOARD_COLS; i++)
    {
        var gemsMissingFromCol = 0;

        for (var j = StartPreferences.BOARD_ROWS - 1; j >= 0; j--)
        {
            var gem = this.getGem(i, j);

            if (gem === null)
            {
                gemsMissingFromCol++;
                gem = this.scene.fGameBoard.getFirstDead();
                gem.reset(i * StartPreferences.GEM_SIZE_SPACED + StartPreferences.INGAME_UI_LEFT_OFFSET,
                		-gemsMissingFromCol * StartPreferences.GEM_SIZE_SPACED);
                this.randomizeGemColor(gem);
                this.setGemPos(gem, i, j);
                //tweenGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
                this.tweenDropGemPos(gem, gem.posX, gem.posY, gemsMissingFromCol * 2);
            }
        }

        maxGemsMissingFromCol = Math.max(maxGemsMissingFromCol, gemsMissingFromCol);
    }

    game.time.events.add(maxGemsMissingFromCol * 2 * 50, this.boardRefilled.bind(this));
};


Start.prototype.boardRefilled = function() {
	// when the board has finished refilling, re-enable player input
	allowInput = true;
    this.checkAllAndKillGemMatches();
};

Start.prototype.getGemPos = function(coordinate, isX) {
	// convert world coordinates to board position
	var posData = 0;
	
	if(isX === true)
	{
		posData = Math.floor((coordinate  - StartPreferences.INGAME_UI_LEFT_OFFSET) / StartPreferences.GEM_SIZE_SPACED);
	}
	else
	{
		posData = Math.floor((coordinate - this.scene.fGameBoard.y) / StartPreferences.GEM_SIZE_SPACED);
	}
    return posData;
};
