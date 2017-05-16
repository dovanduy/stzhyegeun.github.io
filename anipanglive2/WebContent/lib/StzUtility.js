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


StzUtil.createRandomInteger = function(inMinValue, inMaxValue) {
	
	StzLog.assert(typeof(inMaxValue) === 'number', "[StzUtility (createRandomInteger)] Invalid parameter type!");
	
	var minValue = inMinValue || 0;
	var maxValue = inMaxValue || 100;
	
	StzLog.assert(minValue < maxValue, "[StzUtility (createRandomInteger)] minValue should less than maxValue");
	
	var offset = (maxValue - minValue) + 1;
	var result = Math.floor(Math.random() * Number(offset)) + minValue;

	return result;
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
	var second = Math.floor(ms/100);
	var millySecond = ms%100;
	
	var finalTime = strPadLeft(second,'0',2)+':'+strPadLeft(millySecond,'0',2);
	
	return finalTime;
};

StzUtil.strPadLeft = function(string,pad,length){
	
};
function strPadLeft(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}


StzUtil.getScreenCapture = function(inGameContext, inX, inY, inWidth, inHeight) {
	
	var base64Picture = null;
	if (inGameContext.renderType === Phaser.CANVAS) {
		
		var captureX = inX || 0;
		var captureY = inY || 0;
		var captureWidth = inWidth || inGameContext.width;
		var captureHeight = inHeight || inGameContext.height;
		
		var captureBMD = inGameContext.make.bitmapData(captureWidth, captureHeight);
		captureBMD.copyRect(inGameContext.canvas, new Phaser.Rectangle(captureX, captureY, captureWidth, captureHeight), 0, 0);
		base64Picture = captureBMD.canvas.toDataURL();
	} else if (inGameContext.renderType === Phaser.WEBGL) {
		var screenshotBMD = game.add.bitmapData(inGameContext.width, inGameContext.height);
		inGameContext.world.updateTransform();
		screenshotBMD.drawFull(inGameContext.world);
		var screenshotTX = inGameContext.make.renderTexture(screenshotBMD.width, screenshotBMD.height);
		screenshotTX.render(screenshotBMD.addToWorld());
		base64Picture = screenshotTX.getBase64();
	}
	return base64Picture;
};
