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

StzUtil.createRandomInteger = function(inMaxValue) {
	
	StzLog.assert(typeof(inMaxValue) === 'number', "[StzUtility (createRandomInteger)] Invalid parameter type!");
	
	return Math.floor(Math.random() * Number(inMaxValue) + 1);
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

