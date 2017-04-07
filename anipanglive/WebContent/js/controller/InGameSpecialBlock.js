var InGameSpecialBlock = function() {};

InGameSpecialBlock.specialBlockOperate = function(blocks, index, type, scoreCallback){
	StzSoundList[ESoundName.SE_MATCH_SPECIAL].play();
	InGameSpecialBlock.specialFunctions[type](blocks, index, scoreCallback);
	blocks[index].type = EBlockType.NONE;
};

InGameSpecialBlock.vertocalBlockOperate = function(blocks, index, scoreCallback){
	var posX = index%InGameBoardConfig.ROW_COUNT;
	var removeBlockCount = 0;
	
	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		if(blocks[posX + InGameBoardConfig.COL_COUNT*i].state === EBlockState.NORMAL){
			blocks[posX + InGameBoardConfig.COL_COUNT*i].setBlockState(EBlockState.REMOVE_ANIM);
			removeBlockCount++;
		}
		
		blocks[posX + InGameBoardConfig.COL_COUNT*i].isDrop = false;
		if (InGameInterruptedConfig.ICE_BREAK_RULE != 'unbreakable') {
			if (blocks[posX + InGameBoardConfig.COL_COUNT*i].isInterrupted) {
				if (InGameInterruptedConfig.ICE_BREAK_RULE === 'breakable-each') {
					blocks[posX + InGameBoardConfig.COL_COUNT*i].isInterrupted = false;	
				}
			}
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index);
	}
};

InGameSpecialBlock.horizontalBlockOperate = function(blocks, index, scoreCallback){
	var posY = Math.floor(index/InGameBoardConfig.ROW_COUNT);
	var removeBlockCount = 0;
	
	for(var i =0; i< InGameBoardConfig.COL_COUNT;i++){
		if(blocks[i + InGameBoardConfig.COL_COUNT*posY].state === EBlockState.NORMAL){
			blocks[i + InGameBoardConfig.COL_COUNT*posY].setBlockState(EBlockState.REMOVE_ANIM);
			removeBlockCount++;
		}
		
		blocks[i + InGameBoardConfig.COL_COUNT*posY].isDrop = false;
		if (InGameInterruptedConfig.ICE_BREAK_RULE != 'unbreakable') {
			if (blocks[i + InGameBoardConfig.COL_COUNT*posY].isInterrupted) {
				if (InGameInterruptedConfig.ICE_BREAK_RULE === 'breakable-each') {
					blocks[i + InGameBoardConfig.COL_COUNT*posY].isInterrupted = false;
				}
			}
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index);
	}
};

InGameSpecialBlock.circleBlockOperate = function(blocks, index, scoreCallback){
	var circleArea = [-2 + (-1*InGameBoardConfig.ROW_COUNT), -1 + (-1*InGameBoardConfig.ROW_COUNT), (-1*InGameBoardConfig.ROW_COUNT) ,+1 + (-1*InGameBoardConfig.ROW_COUNT), +2 + (-1*InGameBoardConfig.ROW_COUNT),
	                  -2, -1, 0, 1, 2,
	                  -2 + (+1*InGameBoardConfig.ROW_COUNT),  -1 + (+1*InGameBoardConfig.ROW_COUNT),  0 + (+1*InGameBoardConfig.ROW_COUNT),  +1 + (+1*InGameBoardConfig.ROW_COUNT),  +2 + (+1*InGameBoardConfig.ROW_COUNT)];

	var removeBlockCount = 0;
	
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
					blocks[index + circleArea[i]].setBlockState(EBlockState.REMOVE_ANIM);
					removeBlockCount++;
				}
				blocks[index + circleArea[i]].isDrop = false;
				if (InGameInterruptedConfig.ICE_BREAK_RULE != 'unbreakable') {
					if (blocks[index + circleArea[i]].isInterrupted) {
						if (InGameInterruptedConfig.ICE_BREAK_RULE === 'breakable-each') {
							blocks[index + circleArea[i]].isInterrupted = false;
						}
					}
				}
			}
		}
	}
	
	if(scoreCallback !== undefined && scoreCallback !== null){
		scoreCallback(removeBlockCount, index);
	}
};


InGameSpecialBlock.specialFunctions= {
		// make randompang
		"circle" : InGameSpecialBlock.circleBlockOperate ,
		"vertical" : InGameSpecialBlock.vertocalBlockOperate ,
		"horizontal" : InGameSpecialBlock.horizontalBlockOperate 
};