function _StzUtil() {
}


var StzUtil = new _StzUtil();

/**
 * 자바스크립트를 동적으로 로드하는 함수
 * @param inUrl
 * @param inCallback
 * @param inContext
 */
StzUtil.loadJavascript = function(inUrl, inCallback, inContext) {
	$.ajax({
		url: inUrl,
		dataType: 'script', 
		success: function() {
			(inCallback).call(inContext);	
		}, 
		aync: true
	});
};

/**
 * 다차원 배열을 생성하는 함수
 * REFER @http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
 */
StzUtil.createArray = function(inLength) {
	function inlineCreateArray(inlineLength) {
		var arr = new Array(inlineLength || 0), i = inlineLength;
		
		if (arguments.length > 1) {
			var args = Array.prototype.slice.call(arguments, 1);
			while(i--) {
				arr[inlineLength - 1 - i] = inlineCreateArray.apply(this, args);
			}
		}
		return arr;	
	}
	
	return inlineCreateArray.apply(this, arguments);
};

// min_value <= RETURN VALUE <= max_value
StzUtil.createRandomInteger = function(inMinValue, inMaxValue) {
	
	StzLog.assert(typeof(inMinValue) === 'number', "[StzUtility (createRandomInteger)] Invalid parameter type!");
	StzLog.assert(typeof(inMaxValue) === 'number', "[StzUtility (createRandomInteger)] Invalid parameter type!");

	var minValue = inMinValue || 0;
	var maxValue = (inMaxValue === undefined || inMaxValue === null ? 100 : inMaxValue);
	
	if (minValue === maxValue) {
		return minValue;
	}
	
	StzLog.assert(minValue < maxValue, "[StzUtility (createRandomInteger)] minValue should less than maxValue");
	
	var offset = (maxValue - minValue) + 1;
	var result = Math.floor(Math.random() * Number(offset)) + minValue;

	return result;
};

/**
 * <https://hyunseob.github.io/2016/02/08/copy-object-in-javascript/>
 */
StzUtil.cloneObject = function(obj) {
	if (obj === null || obj !== "object") {
		return obj;
	}
	
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) {
			copy[attr] = obj[attr];
		}
	}
	
	return copy;
};

StzUtil.createNumComma = function(num) {
	
	var len, point, str, number;  
    
    number = num + "";  
    point = number.length % 3 ;
    len = number.length;  
   
    str = number.substring(0, point);  
    while (point < len) {  
        if (str != "") str += ",";  
        str += number.substring(point, point + 3);  
        point += 3;  
    }  
     
    return str;
};

StzUtil.sumArrays = function(fromArray, toArray) {
	var fromFlag = true;
	var toFlag = true;
	
	if(fromArray === undefined || fromArray === null || fromArray.length === 0 ){
		fromFlag = false;
	}
	
	if(toArray === undefined || toArray === null || toArray.length === 0 ){
		toFlag = false;
	}
	
	if(fromFlag === false && toFlag === false){
		return [];
	}
	else if(fromFlag === true && toFlag === false){
		return fromArray;
	}
	else if(fromFlag === false && toFlag === true){
		return toArray;
	}
	else{
		var mainArray = (fromArray.length >= toArray.length)? fromArray:toArray;
		var subArray = (fromArray.length >= toArray.length)? toArray:fromArray;
		
		var mainLength = mainArray.length;
		var subLength = subArray.length;
		
		
		for(var i =0;i<subLength;i++){
			var sameFlag = false;
			
			for(var j =0;j<mainLength;j++){
				if(subArray[i] === mainArray[j]){
					sameFlag = true;
					continue;
				}
			}
			
			if(sameFlag === false){
				mainArray.push(subArray[i]);
			}
		}
		return mainArray;
	}
};

StzUtil.millysecondToSM = function(ms){
	var second = Math.floor(ms/1000);
	var millySecond = ms%1000;
	
	var finalTime = strPadLeft(second,'0',2)+':'+strPadLeft(millySecond,'0',2);
	
	return finalTime;
};

StzUtil.millysecondToMs = function(ms){
	var minutes = Math.floor(ms/60000);
	ms -= (minutes*60000);
	var second =  Math.floor(ms/1000);
	
	var finalTime = strPadLeft(minutes,'0',2)+':'+strPadLeft(second,'0',2);
	
	return finalTime;
};

/**
 * 현재시간과 @timeStamp 비교
 * @timeStamp : 현재 시간과 비교할 시간
 * @returns
 * 비교 시간이 더 작으면 false
 * 비교 시간이 더 크면 true
 */
StzUtil.compareTimeWithCurrent = function(inTimeStamp){
	var curTime = new Date();
	var compareTime = new Date(inTimeStamp);
	
	if(curTime.getTime() < compareTime.getTime()){
		return true;
	}
	
	return false;
};

StzUtil.strPadLeft = function(string,pad,length){
	
};
function strPadLeft(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}


StzUtil.getScreenCapture = function(inGameContext, inX, inY, inWidth, inHeight, inScale, inTargetCanvas) {
	var base64Picture = null;
	if (inGameContext.renderType === Phaser.CANVAS) {
		var captureX = inX || 0;
		var captureY = inY || 0;
		var captureWidth = inWidth || inGameContext.width;
		var captureHeight = inHeight || inGameContext.height;
		var captureScale = inScale || 1;
		var captureXOffset = (captureHeight * 1.9 - captureWidth);
		captureXOffset = (captureXOffset < 0 ? 0 : captureXOffset);
		var captureYOffset = (captureHeight - 380);
		captureYOffset = (captureYOffset < 0 ? 0 : captureYOffset);
		
		var captureBMD = inGameContext.make.bitmapData(captureWidth * captureScale + captureXOffset, captureHeight * captureScale + captureYOffset);
		captureBMD.crossOrigin= 'Anonymous';
		captureBMD.fill(0xffffff);
		//captureBMD.copyRect(inGameContext.canvas, new Phaser.Rectangle(captureX, captureY, captureWidth, captureHeight), 0, 0);
		//captureBMD.canvas.getContext('2d').scale(captureScale, captureScale);
		
		if(inTargetCanvas){
			var bmd = inGameContext.add.bitmapData(captureWidth, captureHeight);
			bmd.crossOrigin = 'Anonymous';
			inGameContext.stage.updateTransform();
			bmd.drawGroup(inTargetCanvas);
			//captureBMD.copy(bmd, captureX, captureY, captureWidth, captureHeight,  captureXOffset / 2,0, captureWidth, captureHeight, null, null, null, captureScale, captureScale);
			captureBMD.draw(bmd, captureX, captureY, captureWidth, captureHeight, captureXOffset / 2, captureYOffset / 2, captureWidth, captureHeight, null, null, null, captureScale, captureScale);			
			inTargetCanvas.destroy();
		}
		else{
			inGameContext.crossOrigin = 'Anonymous';
			captureBMD.draw(inGameContext.canvas, captureX, captureY, captureWidth, captureHeight, captureXOffset / 2, captureYOffset / 2, captureWidth, captureHeight, null, null, null, captureScale, captureScale);
		}
		captureBMD.canvas.crossOrigin = 'Anonymous';
		base64Picture = captureBMD.canvas.toDataURL();
	} else if (inGameContext.renderType === Phaser.WEBGL) {
		var screenshotBMD = inGameContext.add.bitmapData(inWidth, inHeight);
		inGameContext.world.updateTransform();
		screenshotBMD.drawFull(inGameContext.world);
		var screenshotTX = inGameContext.make.renderTexture(screenshotBMD.width, screenshotBMD.height);
		screenshotTX.render(screenshotBMD.addToWorld());
		base64Picture = screenshotTX.getBase64();
	}
	return base64Picture;
};

/**
 * AnimNum = 0 아래에서 -> 위로 텍스트 애니매이션 
 * 나머지 추후 구현
 * gap = 얼마나 이동 할 것인지
 */
StzUtil.textAnimStart = function(game, textObject, gap, AnimNum , frame, inCallBack){
	var textFrame = (frame)? frame:1000;
	var moveY = textObject.position.y + gap;
	
	textObject.visible = true;
	game.add.tween(textObject.position).to({y:moveY}, textFrame, 'Quart.easeOut', true)
	.onComplete.addOnce(function() {
		textObject.visible = false;
		textObject.position.y -= gap;
		if(inCallBack){
			inCallBack();
		}	
	}.bind(this, textObject, textFrame, inCallBack));

};

StzUtil.toggleScene = function(game, scene, speed, isOpen, inPostCallback){
	scene.pivot.set(game.world.width/2, game.world.height/2);
	scene.x = game.world.width/2;
	scene.y = game.world.height/2;
	scene.scale.set(0.8);
	
	var targetAlpha = (isOpen === true)?1:0;
	
	if(isOpen === false){
		game.input.enabled = false;
	}
	
	if (speed === 0) {
		scene.alpha = targetAlpha;
		scene.scale.set(1);
		
		if(inPostCallback){
			inPostCallback();
		}
		return;
	}
	
	var scrollTween = game.add.tween(scene).to({alpha: targetAlpha}, speed, Phaser.Easing.Quadratic.Out, true)
	.onUpdateCallback(function(inParam) {
		if(inParam.target.alpha < 0.8){
			inParam.target.scale.x = Phaser.Math.mapLinear(inParam.target.alpha, 0, 0.8, 0.8, 1.2);
			inParam.target.scale.y = Phaser.Math.mapLinear(inParam.target.alpha, 0, 0.8, 0.8, 1.2);
		}
		else{
			inParam.target.scale.x = Phaser.Math.mapLinear(inParam.target.alpha, 0.8, 1, 1.2, 1);
			inParam.target.scale.y = Phaser.Math.mapLinear(inParam.target.alpha, 0.8, 1, 1.2, 1);
		}
	}.bind(this));
	
	scrollTween.onComplete.addOnce(function(inParam) {
		scene.alpha = targetAlpha;
		scene.scale.set(1);
		game.input.enabled = true;
		
		if(inPostCallback){
			inPostCallback();
		}
		
		if (inParam[0]) {
			game.tweens.remove(inParam[0]);	
		}
	}.bind(this, game, targetAlpha, scene, [scrollTween]));
};

StzUtil.loadImageFromURL = function(game, inKey, inURL, inCallback, inContext) {
	if (game.cache.checkImageKey(inKey)) {
		if (inCallback) {
			inCallback.call(inContext, inKey);
		}
	} else {
		game.load.crossOrigin = "Anonymous";
		game.load.image(inKey, inURL);
		game.load.onLoadComplete.add(onImageLoadComplete);
		game.load.start();
	}
	
	function onImageLoadComplete() {
		//console.log("[StzUtility] (loadImageFromURL) onLoadCompleted inKey: " + inKey);
		game.load.onLoadComplete.remove(onImageLoadComplete);
		if (inCallback) {
			inCallback.call(inContext, inKey);
		}
	}
};

StzUtil.loadImagesFromURL = function(game, inImageDatas, inCallback, inContext) {
	var keyArray = [];
	for(var index = 0; index < inImageDatas.length; index++){
		if (game.cache.checkImageKey(inImageDatas[index].key) === true) {
			continue;
		}
		game.load.crossOrigin = "Anonymous";
		game.load.image(inImageDatas[index].key, inImageDatas[index].url);
		keyArray.push(inImageDatas[index].key);
	}
	game.load.onLoadComplete.add(onImagesLoadComplete); 
	game.load.start();
	
	function onImagesLoadComplete() {
		//console.log("[StzUtility] (loadImageFromURL) onLoadCompleted inKey: " + inKey);
		game.load.onLoadComplete.remove(onImagesLoadComplete);
		if (inCallback) {
			inCallback.call(inContext, keyArray);
		}
	}
};

StzUtil.moveSpriteByQuadraticBezierCurve = function(game, inSprite, inFromPoint, inCentralPoint, inToPoint, operateTime, inUpdateCallback, inCallback, inContext) {
	if(operateTime === undefined){
		operateTime = 500;
	}
	//inSprite.anchor.set(0.5, 0.5);
	var bezierTween = game.add.tween(inSprite).to({
		x: [inFromPoint.x, inCentralPoint.x, inCentralPoint.x, inToPoint.x],
		y: [inFromPoint.y, inCentralPoint.y, inCentralPoint.y, inToPoint.y],
	}, operateTime,Phaser.Easing.Quadratic.InOut, true, 0).interpolation(function(v, k){
		return Phaser.Math.bezierInterpolation(v, k);
	});
	bezierTween.onUpdateCallback(function(inParam) {
		if (inUpdateCallback) {
			inUpdateCallback.call(inContext, inParam);
		}
	});
	
	bezierTween.onComplete.addOnce(function() {
		
//		if (inSprite != null) {
//			inSprite.kill();
//		}
		if (inCallback) {
			inCallback.call(inContext);
		}
	});
	
	return bezierTween;
};

StzUtil.popRandomValuesFromList = function(inCount, inArray) {
	
	if (typeof inCount != "number" || Object.prototype.toString.call(inArray) != "[object Array]") {
		throw new Error("[StzUtil.getValueFromList] Invalid parameter.");
	}
	
	if (inCount >= inArray.length) {
		return inArray;
	}
	
	var result = [];
	var remainCount = inCount;
	var remainList = inArray;
	while(remainCount > 0 && remainList.length > 0) {
		var randIndex = StzUtil.createRandomInteger(0, remainList.length - 1);
		result.push(remainList[randIndex]);
		remainList.splice(randIndex, 1);
		remainCount--;
	}
	
	return result;
};

StzUtil.shuffleArray = function(inArray) {
 var j, x, i;
 for (i = inArray.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = inArray[i - 1];
        inArray[i - 1] = inArray[j];
        inArray[j] = x;
    }
};

StzUtil.hasOwnProperties = function(inObject, inArray) {
	StzLog.assert(Object.prototype.toString.call(inArray) === "[object Array]", "[StzUtil.hasOwnProperties] - Invalid parameter: inArray is not array");
	
	for (var i = 0; i < inArray.length; i++) {
		if (inObject.hasOwnProperty(inArray[i]) === false) {
			return false;
		}
	}
	return true;
};

StzUtil.getCurrentTimestampSec = function() {
	return Math.floor(new Date().getTime() / 1000);
};

StzUtil.strFormat = function() {
	// The string containing the format items (e.g. "{0}")
	// will and always has to be the first argument.
	var theString = arguments[0];

	// start with the second argument (i = 1)
	for (var i = 1; i < arguments.length; i++) {
	// "gm" = RegEx options for Global search (more than one instance)
	// and for Multiline search
	var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
	theString = theString.replace(regEx, arguments[i]);
	}

	return theString;
};

StzUtil.strFormatObj = function() {
	var theString = arguments[0];
	var replaceObj = arguments[1];
	
	for (var key in replaceObj) {
		var regEx = new RegExp("\\{" + key + "\\}", "gm");
		theString = theString.replace(regEx, replaceObj[key]);
	}
	
	return theString;
};

StzUtil.visitToFBPage = function() {
	window.inGameContext.loadingScene.startLoading();

	var newBtnFacebookPageVersion = (StaticManager.auha_base && StaticManager.auha_base.get("fb_page_version") ? StaticManager.auha_base.get("fb_page_version").value : 0);
	PlayerDataManager.localStorage.setItem("fb_page_version", Number(newBtnFacebookPageVersion));
	var targetUrl = (StaticManager.auha_base && StaticManager.auha_base.get("fb_page_url") ? StaticManager.auha_base.get("fb_page_url").value : "https://www.facebook.com/DinoBallzGame/");
	window.location.replace(targetUrl);
};

StzUtil.switchValueWithRollback = function(inObject, inValue, inGetFunc, inSetFunc) {
	
	var originValue = inGetFunc(inObject);
	inSetFunc(inObject, inValue);
	
	return function() {
		inSetFunc(inObject, originValue);
	};
};


StzUtil.switchValueWithRollback1 = function(inTargetObject, inTargetKey, inValue) {
	StzLog.assert(inTargetObject.hasOwnProperty(inTargetKey), "ERROR!!");
	var originValue = inTargetObject[inTargetKey];
	inTargetObject[inTargetKey] = inValue;
	
	return function() {
		inTargetObject[inTargetKey] = originValue;
	};
};

/**
 * @param inAVersion
 * @param inBVersion
 * @returns 
 * 		inAVersion > inBVersion : return 1
 * 		inAVersion == inBVersion : return 0
 * 		inAVersion < inBVersion : return -1 
 */
StzUtil.compareVersion = function(inAVersion, inBVersion) {
	var aVersionList = inAVersion.split(".");
	var bVersionList = inBVersion.split(".");
	
	if (aVersionList.length !== 3 || bVersionList.length !== 3) {
		return 0;
	}
	
	for (var i = 0; i < 3; i++) {
		var aVersion = Number(aVersionList[i]);
		var bVersion = Number(bVersionList[i]);
		
		if (isNaN(aVersion) === true || isNaN(bVersion) === true) {
			return 0;
		}
		
		var result = aVersion - bVersion;
		if (result === 0) {
			continue;
		}
		return (result > 0 ? 1 : -1);
	}
	return 0;
};

StzUtil.valuesFromObject = function(inObject) {
	if (!Object.values) {
		var result = [];
		for (var key in inObject) {
			result.push(inObject[key]);
		}
		return result;
	}
	return Object.values(inObject);
};

StzUtil.cutText = function(inString, inLength){
	var length = inLength;
	var tempStr = inString;
	
	if(length <= tempStr.length){
		tempStr = tempStr.substring(0, length) +'...';
	}
	
	return tempStr;
};

StzUtil.alphaScaleTween = function(inGame, inTarget, inCurAlpha, inCurScale, inTime){
    inGame.add.tween(inTarget).to({alpha : 1}, inTime, Phaser.Easing.Linear.None, true)
    .onUpdateCallback(function(inparam){
        if(inparam){
            inTarget.scale.set(Phaser.Math.mapLinear(inparam.target.alpha, inCurAlpha, 1, inCurScale, 1.1));
        }
    }.bind(this))
    .onComplete.addOnce(function(){
        inGame.add.tween(inTarget.scale).to({x : 1, y: 1}, 100, Phaser.Easing.Linear.None, true)
    }.bind(this));
};
