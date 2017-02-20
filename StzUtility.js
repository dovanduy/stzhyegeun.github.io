define(function () {
	function StzUtil() {
		
	}
	
	// REFER @http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
	StzUtil.prototype.createArray = function(inLength) {
		
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
	
	return StzUtil;
});

