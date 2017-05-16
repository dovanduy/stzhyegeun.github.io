var InGameMatchFilter = function() {};

InGameMatchFilter.filterArrays = {
		// make randompang
		FOUR_HORIZONTAL: [0, 1, 2, 3], 
		FOUR_VERTICAL: [0, InGameBoardConfig.ROW_COUNT, InGameBoardConfig.ROW_COUNT * 2, InGameBoardConfig.ROW_COUNT * 3]
};

InGameMatchFilter.isFourVerticalCheck = function(machedBlock) {
	var machedBlockLength = machedBlock.length;
	
	var startIndex = machedBlock[0].index;
	
	for(var i = 0; i < machedBlockLength; i++){
		if(machedBlock[i].index === (this.filterArrays.FOUR_VERTICAL[i] + startIndex)){
			continue;
		}
		return false;
	}
	
	return true;
};

InGameMatchFilter.isFourHorizontalCheck = function(machedBlock) {
var machedBlockLength = machedBlock.length;
	
	var startIndex = machedBlock[0].index;
	
	for(var i = 0; i < machedBlockLength; i++){
		if(machedBlock[i].index === (this.filterArrays.FOUR_HORIZONTAL[i] + startIndex)){
			continue;
		}
		return false;
	}
	
	return true;
};

InGameMatchFilter.isFourCheck = function(machedBlock) {
	machedBlock.sort(function(a,b){
		return a.index < b.index ? -1 : a.name > b.name ? 1 : 0;
	});
	
	if(InGameMatchFilter.isFourVerticalCheck(machedBlock) === true){
		return EBlockType.HORIZONTAL;
	}
	else if(InGameMatchFilter.isFourHorizontalCheck(machedBlock) === true){
		return EBlockType.VERTICAL;
	}
	else{
		return EBlockType.NONE;
	}
};