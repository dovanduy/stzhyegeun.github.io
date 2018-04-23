DinoRunz.PathManager = function(game, parent) {
	Phaser.Plugin.call(this, game, parent);
	
	// 타일 풀 
	this.tiles = null;
	this.deadViews = null;
	
	// 길 리스트 
	this.pathList = null;
	this.lastAddedStage = 0;
	
	this.stageDict = {};
	
	// 커맨드 리스트
	this.commandList = null;
	
	// Event
	this.onChangePath = new Phaser.Signal();
	this.onEnterGoal = new Phaser.Signal();
	this.onScreenOut = new Phaser.Signal();
	this.onGetJewel = new Phaser.Signal();
	
	this.lastDrawnPath = null;
	this.lastDrawnIndex = -1;
	
	this.initialPosition = new Phaser.Point(this.game.width / 2, this.game.height / 2);
	
	this.alignHorizontalOffset = 0;

	// HardStage
	this.mode = null;
	this.isHardStage = false;
	this.startPath = null;

	// target
	this.targetList = [];
};

DinoRunz.PathManager.prototype = Object.create(Phaser.Plugin.prototype);
DinoRunz.PathManager.prototype.constructor = DinoRunz.PathManager;

DinoRunz.PathManager.COUNT_DEAD_VIEWS = 3;
DinoRunz.PathManager.MAX_TILES = 100;
DinoRunz.PathManager.TILE_WIDTH = 95;
DinoRunz.PathManager.TILE_HEIGHT = 95;

DinoRunz.PathManager.SCREEN_OFFSET = 300;
DinoRunz.PathManager.SCREEN_BOUNDS = new Phaser.Rectangle(-1 * DinoRunz.PathManager.SCREEN_OFFSET, -1 * DinoRunz.PathManager.SCREEN_OFFSET, DinoRunz.GameConfig.width + DinoRunz.PathManager.SCREEN_OFFSET, DinoRunz.GameConfig.height + DinoRunz.PathManager.SCREEN_OFFSET); 


DinoRunz.PathManager.prototype.init = function() {};

/**
 * 길이 화면에서 일정 거리 이상 떨어졌는지 판별 
 * @param inTile
 * @returns {Boolean}
 */
DinoRunz.PathManager.prototype.checkPathOutOfScreen = function(inTile) {
	if (inTile.position.x < DinoRunz.PathManager.SCREEN_BOUNDS.x 
			|| inTile.position.x > DinoRunz.PathManager.SCREEN_BOUNDS.width
			|| inTile.position.y < DinoRunz.PathManager.SCREEN_BOUNDS.y
			|| inTile.position.y > DinoRunz.PathManager.SCREEN_BOUNDS.height) {
		return true;
	}
	
	return false;
};

/**
 * 플레이어를 길의 중앙으로 정렬 
 * @param inPath
 */
DinoRunz.PathManager.prototype.alignPositionToCenter = function(inPath) {
	this.alignHorizontalOffset = DinoRunz.GameConfig.width / 2 - inPath.position.x;
};

DinoRunz.PathManager.alignSpeed = 1;
DinoRunz.PathManager.prototype.updatePosition = function(inPlayerDirection, inPlayerSpeed) {
	var childList = this.tiles.getAll("exists", true);
	var offsetX = 0 + (inPlayerDirection === EDirection.LEFT ? inPlayerSpeed : 0) - (inPlayerDirection === EDirection.RIGHT ? inPlayerSpeed : 0);
	if (this.alignHorizontalOffset !== 0) {
		
		offsetX += (this.alignHorizontalOffset > 0 ? DinoRunz.PathManager.alignSpeed : -DinoRunz.PathManager.alignSpeed);
		if (this.alignHorizontalOffset > 0) {
			this.alignHorizontalOffset = (this.alignHorizontalOffset - DinoRunz.PathManager.alignSpeed < 0 ? 0 : this.alignHorizontalOffset - DinoRunz.PathManager.alignSpeed);
		} else {
			this.alignHorizontalOffset = (this.alignHorizontalOffset + DinoRunz.PathManager.alignSpeed > 0 ? 0 : this.alignHorizontalOffset + DinoRunz.PathManager.alignSpeed);
		}
	}
	
	var offsetY = 0 + (inPlayerDirection === EDirection.UP ? inPlayerSpeed : 0) - (inPlayerDirection === EDirection.DOWN ? inPlayerSpeed : 0);
	
	for (var i = 0; i < childList.length; i++) {
	    childList[i].updatePosition(offsetX, offsetY);
		
//		if (childList[i].getIndex() < inPlayer.getIndex() - 3) {
//			childList[i].kill();
//		}
		
		if (this.checkPathOutOfScreen(childList[i])) {
			this.onScreenOut.dispatch(childList[i]);
		}
	}
};

DinoRunz.PathManager.prototype.getScale = function() {
    if (this.tileGroup) {
        return this.tileGroup.scale.x;
    }
    
    return 1;
};

DinoRunz.PathManager.prototype.getRotation = function() {
    if (this.tileGroup) {
        return this.tileGroup.rotation;
    }
    
    return 0;
};

DinoRunz.PathManager.prototype.setDeadViewScale = function(inValue) {
    if (this.deadViewGroup) {
        this.deadViewGroup.scale.set(inValue);
        
        var deadViewsList = this.getDeadViews();
        if (deadViewsList) {
            for (var i = 0; i < deadViewsList.length; i++) {
                deadViewsList[i].scale.set(1 / inValue);
            }
        }
    }
};

DinoRunz.PathManager.prototype.setScale = function(inValue) {
    if (this.tileGroup) {
        this.tileGroup.scale.set(inValue);
    }
    
    this.setDeadViewScale(inValue);
};

DinoRunz.PathManager.prototype.setRotation = function(inValue) {
    if (this.tileGroup) {
        this.tileGroup.rotation = inValue;
    }
    
    if (this.deadViewGroup) {
        this.deadViewGroup.rotation = inValue;
        
        var deadViewsList = this.getDeadViews();
        if (deadViewsList) {
            for (var i = 0; i < deadViewsList.length; i++) {
                deadViewsList[i].rotation = this.deadViewGroup.rotation * -1;
            }
        }
    }
};

DinoRunz.PathManager.prototype.getFrontCommandPath = function() {
	if (!this.commandList || this.commandList.length <= 0) {
		return null;
	}
	var result = this.commandList[0];
	var index = Number(result.index);
	var targetPath = this.getPathByIndex(index);
	return targetPath;
};

DinoRunz.PathManager.prototype.popFrontCommand = function() {
	if (!this.commandList || this.commandList.length <= 0) {
		return null;
	}
	var result = this.commandList.shift();
	
	var index = Number(result.index);
	var targetPath = this.getPathByIndex(index);
	if (targetPath) {
		targetPath.setCommandVisible(false);
	}
	
	return result;
};

DinoRunz.PathManager.prototype.checkPlayerOnPath = function(inPlayer) {
	var targetList = this.getPathFromPlayer(inPlayer.getIndex());
	
	for (var i = 0; i < targetList.length; i++) {
		var currentPath = targetList[i];
		var currentBounds = currentPath.getViewBound();
		if (currentBounds.contains(inPlayer.position.x, inPlayer.position.y)) {
			
			if (currentPath.tileType === ETileType.NONE) {
				return false;
			}

			if (currentPath.isJewelActive()) {
				if (currentPath.position.distance(inPlayer.position, true) < 40) {
					currentPath.setJewelActive(false);
					this.onGetJewel.dispatch(inPlayer, currentPath);
				}
			}
			
			if (currentPath.getIndex() !== inPlayer.getIndex()) {
				this.onChangePath.dispatch(inPlayer, inPlayer.currentIndex, currentPath);
				
				if (currentPath.tileType === ETileType.GOAL) {
					this.onEnterGoal.dispatch(inPlayer, currentPath);
				}
				
				inPlayer.currentIndex = currentPath.getIndex();
				inPlayer.currentTile = currentPath;
				
				this.commandList = this.commandList.filter(function(item, index, origin) {
					var index = Number(item.index);
					if (isNaN(index)) {
						return false;
					}
					
					if (index === inPlayer.getIndex()) {
						var targetPath = this.getPathByIndex(index);
						if (targetPath) {
							targetPath.setCommandEnable(true);
						}
					}
					
					if (index < inPlayer.getIndex()) {
						var targetPath = this.getPathByIndex(index);
						if (targetPath) {
						    targetPath.setCommandSkipped();
						}
						return false;
					}
					return true;
				}, this);
			} 
			return true;
		}
	}
	return false;
};

/*
 * PATH
 */
DinoRunz.PathManager.prototype.getPathFromPlayer = function(inPlayerIndex) {

	var child = this.tiles.getAll("exists", true);
	return child.filter(function(item, index, origin) {
		if (item.getIndex() >= inPlayerIndex) {
			return true;
		}
		return false;
	});
};

DinoRunz.PathManager.prototype.getPathByIndex = function(inIndex) {
	
	var child = this.tiles.getAll("exists", true);
	return child.filter(function(item, index, origin) {
		if (item.getIndex() === inIndex) {
			return true;
		}
		return false;
	})[0];
};

DinoRunz.PathManager.prototype.drawPath = function(inStartIndex, inEndIndex, inCreateIfNull, inTargetStage, inIsEnd) {
	if (!this.pathList) {
		return;
	}

	var startIndex = inStartIndex || (this.lastDrawnIndex >= 0 ? this.lastDrawnIndex + 1 : 0);
	var endIndex = inEndIndex || this.pathList.length - 1;
	var isCreateIfNull = inCreateIfNull || false;

	if(inIsEnd) {
		var currentPath = ETileType.END;
		var currentDirection = this.getDirectionByTileType(currentPath);

		var currentTile = this.tiles.getFirstDead(true);
		currentTile.reset();
		currentTile.tileIndex = startIndex;
		currentTile.indexInStage = 0;
		currentTile.setType(currentPath);
		currentTile.setDirection(currentDirection);

		var parent = currentTile.parent;
		parent.addChildAt(currentTile, parent.children.length);//depth 정리.
		if (this.stageDict.hasOwnProperty(currentTile.tileIndex)) {
			var stageNum = this.stageDict[currentTile.tileIndex];
			currentTile.fText.text = stageNum;
		}

		if (this.lastDrawnPath) {
			var currentPosition = this.lastDrawnPath.getNextPosition(currentPath);
			currentTile.position.setTo(currentPosition.x, currentPosition.y);
			currentTile.setPrevPath(this.lastDrawnPath);
			this.lastDrawnPath.setNextPath(currentTile);
		} else {
			currentTile.position.setTo(this.initialPosition.x, this.initialPosition.y);	
		}

		this.lastDrawnPath = currentTile;
		this.lastDrawnIndex = i;
		return currentTile;
	}
	
	if (inTargetStage !== undefined) {
		//Check HardStage
		this.checkStageMode(inTargetStage);
		
		// 친구의 DeadPosition 체크
	    var friendsInStage = PlayerDataManager.getContextFriends().filter(function(item, index, origin){
	        if (StzUtil.hasOwnProperties(item, ["bestStage", "fallenBlockId"]) === false) {
	            return false;
	        }
	        if (item.bestStage !== inTargetStage) {
	            return false;
	        } 
	        if (item.fallenBlockId <= 0) {
	            return false;
			}
			if (item.profileInfo.getPlatformId() === PlayerDataManager.profileInfo.getPlatformId()) {
				//leaderboard의 정보 중 플레이어의 데이터는 제외.
				return false;
			}
	        return true;
	    });
	    
	    if (friendsInStage.length > 0) {
	        friendsInStage = friendsInStage.reduce(function(acc, cur, i) {
	            acc[cur.fallenBlockId] = cur.profileInfo;
	            return acc;
	        }, {});
	    }
	}
    
	for (var i = startIndex; i <= endIndex /*&& this.tiles.getAll("exists", false).length > 0*/ ; i++) {
		
		var currentPath = this.pathList[i];
		var currentDirection = this.getDirectionByTileType(currentPath);
		
		var currentTile = this.tiles.getFirstDead(true);
		currentTile.reset();
		currentTile.tileIndex = i;
		currentTile.indexInStage = (i - startIndex);
		currentTile.setType(currentPath);
		currentTile.setDirection(currentDirection);

		if (currentPath === ETileType.START) {
			var parent = currentTile.parent;
			parent.addChildAt(currentTile, parent.children.length);//depth 정리.
			if (this.stageDict.hasOwnProperty(currentTile.tileIndex)) {
				var stageNum = this.stageDict[currentTile.tileIndex];
				currentTile.fText.text = stageNum;
			}

			this.startPath = currentTile;
		}
		
		// stageNum이 플레이어의 
		if (this.lastDrawnPath) {
			var currentPosition = this.lastDrawnPath.getNextPosition(currentPath);
			currentTile.position.setTo(currentPosition.x, currentPosition.y);
			currentTile.setPrevPath(this.lastDrawnPath);
			this.lastDrawnPath.setNextPath(currentTile);
		} else {
			currentTile.position.setTo(this.initialPosition.x, this.initialPosition.y);	
		}
		this.lastDrawnPath = currentTile;
		this.lastDrawnIndex = i;
		
		// 친구의 FallPosition 체크
		if (friendsInStage && friendsInStage[currentTile.indexInStage]) {
		    var friendFallenView = this.deadViews.getFirstDead(true);
		    if (friendFallenView) {
		        friendFallenView.reset();
		        friendFallenView.setProfileInfo(friendsInStage[currentTile.indexInStage]);
		        friendFallenView.position.setTo(currentTile.position.x, currentTile.position.y);
		        currentTile.setDeadView(friendFallenView)
		    }
		}
		
		// 플레이어의 DeadPosition 체크
        if (inTargetStage === DinoRunz.Storage.UserData.lastClearedStage) {
            if (DinoRunz.Storage.UserData.lastFallenBlockId > 0 && DinoRunz.Storage.UserData.lastFallenBlockId === currentTile.indexInStage) {
                var playerDeadView = this.deadViews.getFirstDead(true);
                if (playerDeadView) {
                    playerDeadView.reset();
                    playerDeadView.setProfileInfo(PlayerDataManager.profileInfo);
                    playerDeadView.position.setTo(currentTile.position.x, currentTile.position.y);
                    currentTile.setDeadView(playerDeadView);    
                }
            }
        }
	}
};

DinoRunz.PathManager.prototype.checkStageMode = function (inTargetStage) {
	this.mode = StaticManager.dino_runz_level_design.get(inTargetStage-1).mode;
	this.isHardStage = (this.mode === EStageMode.HARD);
};

DinoRunz.PathManager.prototype.getDirectionByTileType = function(inTileType) {
	switch (inTileType) {
	case ETileType.START:
	case ETileType.END:	
	case ETileType.GOAL: 
	case ETileType.DIRECTION_UP:
		return EDirection.UP;
	case ETileType.NORMAL:
	case ETileType.SLIM:
	case ETileType.NONE:
		return (this.lastDrawnPath ? this.lastDrawnPath.direction : EDirection.UP);
	case ETileType.DIRECTION_DOWN:
		return EDirection.DOWN;
	case ETileType.DIRECTION_LEFT:
		return EDirection.LEFT;
	case ETileType.DIRECTION_RIGHT:
		return EDirection.RIGHT;
	}
};

DinoRunz.PathManager.prototype.initPath = function() {
	this.lastDrawnPath = null;
	this.lastDrawnIndex = -1;
	this.lastAddedStage = 0;
	this.stageDict = {};
	this.initTiles();
	this.pathList = [];
	this.commandList = [];
	this.alignHorizontalOffset = 0;
};

DinoRunz.PathManager.prototype.deleteLastPathEditMode = function(inPlayerDirection) {
	if (!this.pathList) {
		this.initPath();
		return null;
	}
	
	if (this.pathList.length === 1 || !this.lastDrawnPath) {
		return null;
	}
	
	
	var reversePlayerDirection = EDirection.UP;
	if (inPlayerDirection === EDirection.UP) {
		reversePlayerDirection = EDirection.DOWN;
	} else if (inPlayerDirection === EDirection.RIGHT) {
		reversePlayerDirection = EDirection.LEFT;
	} else if (inPlayerDirection === EDirection.LEFT) {
		reversePlayerDirection = EDirection.RIGHT;
	} else if (inPlayerDirection === EDirection.DOWN) {
		reversePlayerDirection = EDirection.UP;
	}
	
	do {
		var lastPath = this.pathList.pop();
		this.lastDrawnPath.kill();
		this.lastDrawnIndex = this.pathList.length - 1;
		this.lastDrawnPath = this.getPathByIndex(this.lastDrawnIndex);
		this.updatePosition(reversePlayerDirection, DinoRunz.PathManager.TILE_WIDTH);
		if (lastPath !== ETileType.NONE) {
			return lastPath;
		}
	} while(lastPath === ETileType.NONE);
	return lastPath;	
};

DinoRunz.PathManager.prototype.addPathEditMode = function(inPath, inPlayer) {
	if (!this.pathList) {
		this.initPath();
	}
	var pathType = inPath;
	if (this.lastDrawnPath) {
		if (inPath === this.lastDrawnPath.direction) {
			pathType = ETileType.NORMAL;
		}	
		
		if (inPath === ETileType.EDITMODE_JUMP) {
			pathType = inPlayer.direction;
		}
	}
	
	this.pathList.push(pathType);
	this.drawPath(null, null, true);
	this.updatePosition(inPlayer.direction, DinoRunz.PathManager.TILE_WIDTH);
};

DinoRunz.PathManager.prototype.addPath = function(inPath) {
	if (!this.pathList) {
		this.initPath();
	}
	
	this.pathList.push(inPath);
	this.commandList = this.getCommandList(this.pathList);
};

DinoRunz.PathManager.prototype.addPathList = function(inStageNum, inPathList) {
	
	if (!this.pathList) {
		this.initPath();
	}
	
	if (this.lastAddedStage >= inStageNum) {
		return;
	}
	
	this.lastAddedStage = inStageNum;
	
	this.stageDict[this.pathList.length] = inStageNum;
	this.pathList = this.pathList.concat(inPathList);
	this.commandList = this.getCommandList(this.pathList);
};

DinoRunz.PathManager.prototype.getCommandList = function(inPathList) {
	return inPathList.map(function(inItem, inIndex, inOrigin) {
		if (inItem !== ETileType.DIRECTION_RIGHT
				&& inItem !== ETileType.DIRECTION_DOWN
				&& inItem !== ETileType.DIRECTION_LEFT
				&& inItem !== ETileType.DIRECTION_UP) {
			return null;
		} 
		
		var resObj = Object.create({});
		resObj.index = inIndex;
		resObj.command = inItem;
		return resObj;
	}, this).filter(function(inItem, inIndex, inOrigin) {
		if (inItem === null) {
			return false;
		}
		return true;
	});
};

/*
 * DEAD VIEW POOL 
 */
DinoRunz.PathManager.prototype.initDeadViews = function() {
    this.deadViews.callAllExists("kill", true);
};

DinoRunz.PathManager.prototype.createDeadViews = function(inParentGroup) {
    if (!this.deadViewGroup) {
        this.deadViewGroup = inParentGroup;
    }
    
    if (!this.deadViews) {
        this.deadViews = this.game.add.group(this.deadViewGroup);
        this.deadViews.classType = DeadPositionView;
        this.deadViews.createMultiple(DinoRunz.PathManager.COUNT_DEAD_VIEWS);
    }
    this.deadViews.callAllExists("kill", true);
};

DinoRunz.PathManager.prototype.getDeadViews = function() {
    if (!this.deadViews) {
        return null;
    }
    
    return this.deadViews.getAll("exists", true);
};

/*
 *	TILE POOL 
 */
DinoRunz.PathManager.prototype.initTiles = function() {
	this.tiles.callAllExists("kill", true);
};

DinoRunz.PathManager.prototype.createTiles = function(inParentGroup) {
	if (!this.tileGroup) {
		this.tileGroup = inParentGroup;
	}
	
	if (!this.tiles) {
		this.tiles = this.game.add.group(this.tileGroup);
		this.tiles.classType = TileView;
		this.tiles.createMultiple(DinoRunz.PathManager.MAX_TILES);
	}
	this.tiles.callAllExists("kill", true);
};

DinoRunz.PathManager.prototype.killTile = function(inTile) {
	inTile.kill();
};

//-----------------------------------------------------
Phaser.GameObjectFactory.prototype.path = function() {
	var pathManager = this.game.plugins.add(DinoRunz.PathManager);
	pathManager.init();
	return pathManager;
};
