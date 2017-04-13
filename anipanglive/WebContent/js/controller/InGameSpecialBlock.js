var InGameSpecialBlock = function() {};

InGameSpecialBlock.specialBlockOperate = function(blocks, index, type, scoreCallback){
	StzSoundList[ESoundName.SE_MATCH_SPECIAL].play();
	InGameSpecialBlock.specialFunctions[type](blocks, index, scoreCallback);
    blocks[index].type = EBlockType.NONE;
};

InGameSpecialBlock.specialBlocksOperate = function(blocks, specialBlocks, scoreCallback){
	for(var i =0; i <specialBlocks.length; i++){
		if(specialBlocks[i].length === 1){
			StzSoundList[ESoundName.SE_MATCH_SPECIAL].play();
			InGameSpecialBlock.specialFunctions[specialBlocks[i][0].type](blocks, specialBlocks[i][0].index, scoreCallback);
			
			specialBlocks[i][0].type = EBlockType.NONE;

		}
		else if(specialBlocks[i].length === 2){
			StzSoundList[ESoundName.SE_MATCH_SPECIAL].play();
			InGameSpecialBlock.specialFunctions[specialBlocks[i][0].type+"+"+specialBlocks[i][1].type](blocks, specialBlocks[i][1].index, scoreCallback);

			specialBlocks[i][0].type = EBlockType.NONE;
			specialBlocks[i][1].type = EBlockType.NONE;
		}
		else{
			continue;
		}
	}
};

InGameSpecialBlock.vertocalBlockOperate = function(blocks, index, scoreCallback){
	var posX = index%InGameBoardConfig.ROW_COUNT;
	var posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);	
	
	var removeBlockCount = 0;
	var explodeBlockList = [];
	var removeCount = 0;
	
	for(var i =posY; i< InGameBoardConfig.COL_COUNT;i++){
		if(blocks[posX + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			blocks[posX + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[posX + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
	}
	removeCount = 1;
	for(var i =posY-1; i>= 0;i--){
		if(blocks[posX + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			blocks[posX + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[posX + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.vertocalThreeBlockOperate = function(blocks, index, scoreCallback){
	var posX = index%InGameBoardConfig.ROW_COUNT;
	var removeBlockCount = 0;
	var explodeBlockList = [];
	
	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		
		if(blocks[posX + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			
			blocks[posX + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[posX + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
		
		if((posX - 1) >= 0 && blocks[(posX - 1) + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			
			blocks[(posX - 1) + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[(posX - 1) + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
		
		if((posX + 1) < InGameBoardConfig.ROW_COUNT && blocks[(posX + 1) + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			
			blocks[(posX + 1) + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[(posX + 1) + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.horizontalBlockOperate = function(blocks, index, scoreCallback){
	var posX = index%InGameBoardConfig.ROW_COUNT;
	var posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	
	var removeBlockCount = 0;
	var explodeBlockList = [];
	
	var removeCount = 0;
	
	for(var i =posX; i< InGameBoardConfig.ROW_COUNT;i++){
		
		if(blocks[i + InGameBoardConfig.COL_COUNT*posY].state === EBlockState.NORMAL){
			blocks[i + InGameBoardConfig.COL_COUNT*posY].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*posY]);
			removeBlockCount++;
		}
	}
	
	removeCount = 1;
	
	for(var i =posX - 1; i >= 0;i--){
		
		if(blocks[i + InGameBoardConfig.COL_COUNT*posY].state === EBlockState.NORMAL){
			blocks[i + InGameBoardConfig.COL_COUNT*posY].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*posY]);
			removeBlockCount++;
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.horizontalThreeBlockOperate = function(blocks, index, scoreCallback){
	var posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	var removeBlockCount = 0;
	var explodeBlockList = [];
	
	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		
		if(blocks[i + InGameBoardConfig.COL_COUNT*posY].state === EBlockState.NORMAL){
			
			blocks[i + InGameBoardConfig.COL_COUNT*posY].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*posY]);
			removeBlockCount++;
		}
		
		if((posY - 1) >= 0 && blocks[i + InGameBoardConfig.COL_COUNT*(posY - 1)].state === EBlockState.NORMAL){
			
			blocks[i + InGameBoardConfig.COL_COUNT*(posY - 1)].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*(posY - 1)]);
			removeBlockCount++;
		}
		
		if((posY + 1) < InGameBoardConfig.COL_COUNT && blocks[i + InGameBoardConfig.COL_COUNT*(posY + 1)].state === EBlockState.NORMAL){
			
			blocks[i + InGameBoardConfig.COL_COUNT*(posY + 1)].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*(posY + 1)]);
			removeBlockCount++;
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.CrossBlockOperate = function(blocks, index, scoreCallback){
	var posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	var posX = index%InGameBoardConfig.ROW_COUNT;
	var explodeBlockList = [];
	var removeBlockCount = 0;
	
	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		if(blocks[posX + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			blocks[posX + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[posX + InGameBoardConfig.COL_COUNT*i]);
			removeBlockCount++;
		}
	}

	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		
		if(blocks[i + InGameBoardConfig.COL_COUNT*posY].state === EBlockState.NORMAL){
			if(index === i + InGameBoardConfig.COL_COUNT*posY){
				continue;
			}
			
			blocks[i + InGameBoardConfig.COL_COUNT*posY].setBlockState(EBlockState.REMOVE_ANIM, 0);
			explodeBlockList.push(blocks[i + InGameBoardConfig.COL_COUNT*posY]);
			removeBlockCount++;
		}
	}

	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.circleBlockOperate = function(blocks, index, scoreCallback){
	var circleArea = [-2 + (-1*InGameBoardConfig.ROW_COUNT), -1 + (-1*InGameBoardConfig.ROW_COUNT), (-1*InGameBoardConfig.ROW_COUNT) ,+1 + (-1*InGameBoardConfig.ROW_COUNT), +2 + (-1*InGameBoardConfig.ROW_COUNT),
	                  -2, -1, 0, 1, 2,
	                  -2 + (+1*InGameBoardConfig.ROW_COUNT),  -1 + (+1*InGameBoardConfig.ROW_COUNT),  0 + (+1*InGameBoardConfig.ROW_COUNT),  +1 + (+1*InGameBoardConfig.ROW_COUNT),  +2 + (+1*InGameBoardConfig.ROW_COUNT)];

	var removeBlockCount = 0;
	var explodeBlockList = [];
	
	for(var i =0; i< circleArea.length;i++){
		if(index + circleArea[i] >= 0 && index + circleArea[i] < blocks.length ){
			var offset;
			
			if(i < 5){
				offset = (circleArea[i]) + InGameBoardConfig.ROW_COUNT;
			}
			else if(i >= 5 && i < 10){
				offset = (circleArea[i]);
			}
			else{
				offset = (circleArea[i]) - InGameBoardConfig.ROW_COUNT;
			}
			
			if((index%InGameBoardConfig.ROW_COUNT) + offset >= 0 && (index%InGameBoardConfig.ROW_COUNT) + offset < InGameBoardConfig.ROW_COUNT){
				if(blocks[index + circleArea[i]].state === EBlockState.NORMAL){
					blocks[index + circleArea[i]].setBlockState(EBlockState.REMOVE_ANIM, 0);
					explodeBlockList.push(blocks[index + circleArea[i]]);
					removeBlockCount++;
				}
			}
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.kingCircleBlockOperate = function(blocks, index, scoreCallback){
	var circleArea = [-2 + (-2*InGameBoardConfig.ROW_COUNT), -1 + (-2*InGameBoardConfig.ROW_COUNT), (-2*InGameBoardConfig.ROW_COUNT) ,+1 + (-2*InGameBoardConfig.ROW_COUNT), +2 + (-2*InGameBoardConfig.ROW_COUNT),
	                  -2 + (-1*InGameBoardConfig.ROW_COUNT), -1 + (-1*InGameBoardConfig.ROW_COUNT), (-1*InGameBoardConfig.ROW_COUNT) ,+1 + (-1*InGameBoardConfig.ROW_COUNT), +2 + (-1*InGameBoardConfig.ROW_COUNT),
	                  -2, -1, 0, 1, 2,
	                  -2 + (+1*InGameBoardConfig.ROW_COUNT),  -1 + (+1*InGameBoardConfig.ROW_COUNT),  0 + (+1*InGameBoardConfig.ROW_COUNT),  +1 + (+1*InGameBoardConfig.ROW_COUNT),  +2 + (+1*InGameBoardConfig.ROW_COUNT),
	                  -2 + (+2*InGameBoardConfig.ROW_COUNT),  -1 + (+2*InGameBoardConfig.ROW_COUNT),  0 + (+2*InGameBoardConfig.ROW_COUNT),  +1 + (+2*InGameBoardConfig.ROW_COUNT),  +2 + (+2*InGameBoardConfig.ROW_COUNT)];

	var removeBlockCount = 0;
	var explodeBlockList = [];
	
	for(var i =0; i< circleArea.length;i++){
		if(index + circleArea[i] >= 0 && index + circleArea[i] < blocks.length ){
			var offset;
			
			if(i < 5){
				offset = (circleArea[i]) + InGameBoardConfig.ROW_COUNT*2;
			}
			else if(i >= 5 && i < 10){
				offset = (circleArea[i]) + InGameBoardConfig.ROW_COUNT*1;
			}
			else if(i >= 10 && i < 15){
				offset = (circleArea[i]);
			}
			else if(i >= 15 && i < 20){
				offset = (circleArea[i]) - InGameBoardConfig.ROW_COUNT;
			}
			else{
				offset = (circleArea[i]) - InGameBoardConfig.ROW_COUNT*2;
			}
			
			if((index%InGameBoardConfig.ROW_COUNT) + offset >= 0 && (index%InGameBoardConfig.ROW_COUNT) + offset < InGameBoardConfig.ROW_COUNT){
				if(blocks[index + circleArea[i]].state === EBlockState.NORMAL){
					blocks[index + circleArea[i]].setBlockState(EBlockState.REMOVE_ANIM, 0);
					explodeBlockList.push(blocks[index + circleArea[i]]);
					removeBlockCount++;
				}
			}
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index, explodeBlockList);
	}
};

InGameSpecialBlock.specialFunctions= {
		// make randompang
		"circle" : InGameSpecialBlock.circleBlockOperate ,
		"vertical" : InGameSpecialBlock.vertocalBlockOperate ,
		"horizontal" : InGameSpecialBlock.horizontalBlockOperate,
		
		"circle+circle" : InGameSpecialBlock.kingCircleBlockOperate ,
		"circle+vertical" : InGameSpecialBlock.vertocalThreeBlockOperate ,
		"circle+horizontal" : InGameSpecialBlock.horizontalThreeBlockOperate ,
		
		"vertical+circle" : InGameSpecialBlock.vertocalThreeBlockOperate ,
		"vertical+vertical" : InGameSpecialBlock.CrossBlockOperate ,
		"vertical+horizontal" : InGameSpecialBlock.CrossBlockOperate ,
		
		"horizontal+circle" : InGameSpecialBlock.horizontalThreeBlockOperate ,
		"horizontal+vertical" : InGameSpecialBlock.CrossBlockOperate ,
		"horizontal+horizontal" : InGameSpecialBlock.CrossBlockOperate ,
};