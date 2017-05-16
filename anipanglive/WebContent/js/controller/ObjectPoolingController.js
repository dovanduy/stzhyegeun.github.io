var ObjectCreateFactory = {
    _createSprite: function(inContext, inX, inY, inKey, inFrame, inGroup) {
    	return inContext.game.add.sprite(inX, inY, inKey, inFrame, inGroup);
    }, 
    
    _createBitmapText: function(inContext, inX, inY, inFontName, inText, inSize) {
    	return inContext.game.add.bitmapText(inX , inY , inFontName, inText, inSize);
    },
};
ObjectCreateFactory.create = {
	'SPRITE': ObjectCreateFactory._createSprite, 
	'BITMAPTEXT': ObjectCreateFactory._createBitmapText
};
ObjectCreateFactory.checkObjectType = function (inObjectType){
	if (ObjectCreateFactory.create) {
		return ObjectCreateFactory.create.hasOwnProperty(inObjectType);
	} 
	return false;
};


var StzObjectPool = {
    DEBUG_MODE: false,
    _normaList: [], 
    _heartyList: [], 
    _blueList: [], 
    _trianList: [], 
    _screamList: [], 
    _chubbyList: [], 
    _circleList: [], 
    _verticalList: [], 
    _horizontalList: [],
    _animExplodeNormalList: [],
    _animExplodeSpecialList: [],
    _animHintList: [],
    _lightList: [],
    _comboAndScoreTextList: [],
    _feverScoreTextList: [],
    
    getTargetList: function(inType) {
        switch (inType) {
        case EBlockType.NORMA:
            return this._normaList;
        case EBlockType.HEARTY:
            return this._heartyList;
        case EBlockType.BLUE: 
            return this._blueList;
        case EBlockType.TRIAN:
            return this._trianList;
        case EBlockType.SCREAM:
            return this._screamList;
        case EBlockType.CHUBBY:
            return this._chubbyList;
        case EBlockType.CIRCLE:
            return this._circleList;
        case EBlockType.VERTICAL:
            return this._verticalList;
        case EBlockType.HORIZONTAL:
            return this._horizontalList;
        case EBlockAnimation.ANIM_EXPLODE_NORMAL:
            return this._animExplodeNormalList;
        case EBlockAnimation.ANIM_EXPLODE_SPECIAL:
            return this._animExplodeSpecialList;
        case EBlockAnimation.ANIM_HINT:
            return this._animHintList;
        case "light":
            return this._lightList;
        case "comboAndScoreBitmapText":
        	return this._comboAndScoreTextList;
        case "feverScoreBitmapText":
        	return this._feverScoreTextList;
        }
        
        
        return null;
    },
    
    unloadList: function(inType, inAnim) {
        if (inType === undefined || inType === null) {
            return null;
        }
        
        var targetList = this.getTargetList(inType);
        for (var i = targetList.length - 1; i >= 0; i--) {
            
            if (inAnim !== undefined && inAnim !== null && targetList[i].hasOwnProperty('animations') && targetList[i].animations !== null) {
                targetList[i].animations.stop(inAnim, true);
            }
            targetList[i].isPoolUsing = false;
            targetList[i].visible = false;
        }
    }, 
    
    unloadView: function(inName, inBlockView) {
        
        if (inName === undefined || inName === null) {
            return null;
        }
        
        if (inBlockView === undefined || inBlockView === null) {
            if (this.DEBUG_MODE) {
                console.log('[StzObjectPool (unloadView)] unload fail, inBlockView is null - name: ' + inName);
            }
            return null;
        }

        
        inBlockView.visible = false;
        if (this.DEBUG_MODE) {
            console.log('[StzObjectPool (unloadView)] will unload - inName: ' + inName);
        }
        var targetList = this.getTargetList(inName);
        if (targetList === null) {
            return false;
        }
        
        var currentIndex = -1;
        if (inBlockView.poolIndex === undefined || inBlockView.poolIndex === null || inBlockView.poolIndex === -1) {
            currentIndex = targetList.indexOf(inBlockView); 
            if (this.DEBUG_MODE) {
                console.log('[StzObjectPool (unloadView)] no poolIndex - index: ' + currentIndex);
            }
        } else {
            currentIndex = inBlockView.poolIndex;
            if (this.DEBUG_MODE) {
                console.log('[StzObjectPool (unloadView)] poolIndex exist - index: ' + currentIndex);
            }
        }
        
        if (currentIndex >=  0 && currentIndex < targetList.length) {
            if (this.DEBUG_MODE) {
                //console.log('[StzObjectPool (unloadView)] unload success- index: ' + currentIndex + ', type: ' + inType); 
            }
            
            //targetList[currentIndex].frame = 0;
            if (targetList[currentIndex] === undefined || targetList[currentIndex] === null) {
                if (this.DEBUG_MODE) {
                    console.log('[StzObjectPool (unloadView)] failed: no view in pool - index: ' + currentIndex);
                }
                return false; 
            }
            
            targetList[currentIndex].isPoolUsing = false;
            return true;
        }

        if (this.DEBUG_MODE) {
            console.log('[StzObjectPool (unloadView)] unload fail- type: ' + inType + ', key: ' + inBlockView.key); 
        }
        
        return false;
    },
    
    loadView: function(inObjectType, inName, inContext) {//, inX, inY, inKey, inFrame, inGroup) {
        
    	var argsArray = Array.prototype.slice.call(arguments, 3);
    	if (ObjectCreateFactory.checkObjectType(inObjectType) === false) {
    		return null;
    	}
    	
        if (inName === undefined || inName === null) {
            return null;
        }
        
        if (inContext === undefined || inContext === null) {
            return null;
        }
        
        // inType에 따라 리스트에 사용가능한 view가 있는지 확인
        var targetList = this.getTargetList(inName);
        if (targetList === null) {
            return null;
        }

        var resultBlockView = null;
        for (var index = 0; index < targetList.length; index++) {
            if (targetList[index].isPoolUsing === false) {
                if (this.DEBUG_MODE) {
                    //console.log('[StzObjectPool (loadView)] load from list - index: ' + index + ', name: ' + inName + ', list length: ' + targetList.length);
                }
                resultBlockView = targetList[index];
                break;
            }
        }
        
        if (resultBlockView === null) {
            // view가 없다면 생성
            //resultBlockView = inContext.game.add.sprite(inX, inY, inKey, inFrame, inGroup);
        	//resultBlockView = ObjectCreateFactory.create[inObjectType](inContext, inX, inY, inKey, inFrame, inGroup);
        	if (argsArray.indexOf(inContext) < 0) {
        		argsArray.unshift(inContext);
        	}
        	resultBlockView = ObjectCreateFactory.create[inObjectType].apply(this, argsArray);
            targetList.push(resultBlockView);
            if (this.DEBUG_MODE) {
                console.log('[StzObjectPool (loadView)] create - name: ' + inName + ', list length: ' + targetList.length);
            }
        } else {
        	
            //resultBlockView.x = inX;
            //resultBlockView.y = inY;
//        	if (inFrame) {
//                resultBlockView.frameName = inFrame;    
//            } else {
//                resultBlockView.frame = 0;
//            }
        	
        	resultBlockView.x = argsArray[0];
        	resultBlockView.y = argsArray[1];
        	if (inObjectType === 'SPRITE') {
        		if (argsArray[3]) {
            		resultBlockView.frameName = argsArray[3];
            	} else {
            		resultBlockView.frame = 0;
            	}	
        	} else if (inObjectType === 'BITMAPTEXT') {
        		resultBlockView.text = argsArray[3];
        		resultBlockView.fontSize = argsArray[4];
        	}
        }

        // Common Group Setting
        if (inObjectType === 'SPRITE') {
        	var inGroup = argsArray[argsArray.length -1];
        	if (resultBlockView.parent !== inGroup) {
	        	
	            resultBlockView.parent.remove(resultBlockView);
	            
	            if (inGroup) {
	                inGroup.add(resultBlockView);
	            } else {
	                inContext.scene.add(resultBlockView);
	            }
        	}
        }
        
        // view가 있다면 사용 반환하면서 커스텀 플래그 셋
        resultBlockView.isPoolUsing = true;
        resultBlockView.visible = true;
        resultBlockView.poolIndex = targetList.indexOf(resultBlockView);
        return resultBlockView;
    }, 
    
    init: function() {
        while(this._normaList.length > 0) {
            this._normaList.shift().kill();
        }
        while(this._heartyList.length > 0) {
            this._heartyList.shift().kill();
        }
        while(this._blueList.length > 0) {
            this._blueList.shift().kill();
        }
        while(this._trianList.length > 0) {
            this._trianList.shift().kill();
        }
        while(this._screamList.length > 0) {
            this._screamList.shift().kill();
        }
        while(this._chubbyList.length > 0) {
            this._chubbyList.shift().kill();
        }
        while(this._circleList.length > 0) {
            this._circleList.shift().kill();
        }
        while(this._verticalList.length > 0) {
            this._verticalList.shift().kill();
        }
        while(this._horizontalList.length > 0) {
            this._horizontalList.shift().kill();
        }
        while(this._animExplodeNormalList.length > 0) {
            this._animExplodeNormalList.shift().kill();
        }
        while(this._animExplodeSpecialList.length > 0) {
            this._animExplodeSpecialList.shift().kill();
        }
        while(this._animHintList.length > 0) {
            this._animHintList.shift().kill();
        }
        while(this._lightList.length > 0) {
            this._lightList.shift().kill();
        }
        while (this._comboAndScoreTextList.length > 0) {
        	this._comboAndScoreTextList.shift().kill();
        }
        while (this._feverScoreTextList.length > 0) {
        	this._feverScoreTextList.shift().kill();
        }
    }
};