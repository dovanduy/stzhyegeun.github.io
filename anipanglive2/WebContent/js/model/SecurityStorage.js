function createCRCTable() {
		
	var crcTable = [];
	
	for (var i = 0; i < 256; i++) {
		var c = i;
		for (var j = (8 - 1); j >= 0; j--) {
			if ((c & 1) != 0) {
				c = 0xedb88320 ^ (c >>> 1);
			} else {
				c = c >>> 1;
			}
		}
		
		crcTable[i] = c;
	}
	
	return crcTable;
}

function generateUniqueMask() {
	var seed = Math.random() * 0xFFFFFFFF;
	var masks = [];
	masks.push(seed & 0x0f0f0f0f);
	masks.push(seed & 0xf0f0f0f0);
	masks.push(~seed & 0x0f0f0f0f);
	masks.push(~seed & 0xf0f0f0f0);
	return masks;
}

function dec2bin(inDec) {
	return (inDec >>> 0).toString(2);
}

function clampDown(inX, inDownLimit) {
	return (inX >= inDownLimit ? inX : inDownLimit);
}

function clampUp(inX, inUpLimit) {
	return (inX <= inUpLimit ? inX : inUpLimit);
}

function getIntFromBytes(inBytes) {
	var val = 0;
	for (var i = 0; i < inBytes.length; i++) {
		val += inBytes[i];
		if (i < inBytes.length - 1) {
			val = val << 8;
		}
	}
	return val;
}


function getBytesFromInt(inValue) {
	var bytes = [];
	var i = 8;
	do {
		bytes[--i] = inValue & (255);
		inValue = inValue >> 8;
	} while (i);
	return bytes;
}


var SecurityStorage = function(inEnableCRCCheck, inOnError, inEncrypt) {
	
	inEnableCRCCheck = inEnableCRCCheck || false;
	inOnError = inOnError || null;
	inEncrypt = inEncrypt || true;
	
	self = {};
	self.DEBUG_MODE = false;
	
	self.ENABLED = "a10311459433adf322f2590a4987c423";
	self.CRC_TABLE = createCRCTable();
	self.ID = 0x44535300;
	self.VERSION = "1.0";
	
	self._checksum = 0xFFFFFFFF;
	self._mergedStream;
	self._streams;
	self._ids; // map<id, cursor>
	self._currentCursor;
	self._abusingCount;
	self._flagCRCCheck = (inEnableCRCCheck ? ENABLED : null); // 플래그가 임의 변경되는 것을 고려해 문자열로 처리
	self._onError = inOnError;
	self._masks = generateUniqueMask();
    
	self._encrypt = inEncrypt;

    self.STREAM_COUNT = Math.floor(2 + (Math.random() * 3));
    self.LIMIT_STREAM_ID = clampDown(self.STREAM_COUNT - 1, 0);
    
    
    self.init = function() {
    	self.clear();
    };
    
	self.enableCRCCheck = function() {
		return self._flagCRCCheck != null && self._flagCRCCheck === ENABLED;
	};
	
	self.abusingCount = function() {
		return ~(_abusingCount >> 1) & 0x0000ffff;
	};
	
	self.clear = function() {
		self.resetAbusingCount();
		
		var i = 0;
		for(i = 0; self._streams != null && i < self._streams.length; i++) {
			self._streams[i] = null;
		}
		
		self._ids = {};
		self._streams = new Array(self.STREAM_COUNT);
		//self._mergedStream = new Uint8Array();
		self._mergedStream = [];
		self._currentCursor = 0;
		
		for (i = 0; i < self._streams.length; i++) {
			//self._streams[i] = new Uint8Array();
			self._streams[i] = [];
		}
	};
	
	self.dispose = function() {
		if (self._streams !== null) {
			for (var i = 0; i < self._streams.length; i++) {
				self._streams[i].clear();
				self._streams[i] = null;
			}
		}
		
		self._ids = null;
		self._streams = null;
		self._mergedStream = null;
		self._currentCursor = null;
	};
	
	self.getInt = function(inId) {
		if (!self._encrypt) {
			return self._ids[inId];
		}
		
		var value = 0;
		if (!self._ids.hasOwnProperty(inId)) {
			console.log("저장되지 않은 인덱스를 액세스: " + inId);
			return 0;
		}
		
		var cursor = self._ids[inId];
		var offset = 0;
		
		for (var i = 0; i < 4; i++) {
			var streamId = clampUp(i, self.LIMIT_STREAM_ID);
			var stream = self._streams[streamId];
			stream.position = (streamId === self.LIMIT_STREAM_ID ? ((cursor * (4 - self.LIMIT_STREAM_ID)) << 3) + (offset << 3) : (cursor << 3) + (offset << 3));
			var tempStream = stream.slice(stream.position, stream.position + 8);
			var maskedValue = getIntFromBytes(tempStream);
			
			value |= maskedValue;
			
			if (streamId === self.LIMIT_STREAM_ID) {
				++offset;
			}
		}
		
		return ~value;
	};
	
	self.setInt = function(inId, inValue) {
		if (!self._encrypt) {
			self._ids[inId] = inValue;
			return;
		}
		
		if (self.enableCRCCheck() && !self.isValidCRC()) {
			self.incAbusingCount();
		}
		
		var hasId = self._ids.hasOwnProperty(inId);
		if (!hasId) {
			self._ids[inId] = self._currentCursor;
			self._currentCursor++;
		}
		
		var cursor = self._ids[inId];
		var offset = 0;
		
		inValue = ~inValue;
		
		for (var i = 0; i < 4; i++) {
			var mask = self._masks[i];
			var maskedValue = (inValue & mask);
			
			var streamId = clampUp(i, self.LIMIT_STREAM_ID);
			var stream = self._streams[streamId];
			var currentStreamOffset = 0;
			
			if (streamId === self.LIMIT_STREAM_ID) {
				currentStreamOffset = ((cursor * (4 - self.LIMIT_STREAM_ID)) << 3) + (offset << 3);
				++offset;
			} else {
				currentStreamOffset = (cursor << 3) + (offset << 3);
			}
			
			stream.position = currentStreamOffset;
			
			
			stream = getBytesFromInt(maskedValue);
			
			for (var index = 0; index < stream.length; index++) {
				self._streams[streamId][index + currentStreamOffset] = stream[index];
			}
		}
		
		
		if (self.enableCRCCheck()) {
			self._checksum = self.getCRC();
		}
	};
	
	
	self.resetAbusingCount = function() {
		self.setAbusingCount(0);
	};
	
	self.incAbusingCount = function() {
		self.setAbusingCount(self.abusingCount() + 1);
	};
	
	self.setAbusingCount = function(inCount) {
		self._abusingCount = ~((inCount) << 1) & 0x0f0fffff;
	};
	
	self.isValidCRC = function() {
		var current = self.getCRC();
		var valid = (self._checksum === current);
		
		if (!valid && self._onError !== null) {
			self._onError();
		}
		return valid;
	};
	
	self.getCRC = function() {
		if (self._streams === null) {
			return 0;
		}
		
		self._mergedStream.clear();
		
		for (var i = 0; i < _streams.length; i++) {
			var stream = _streams[i];
			stream.position = 0;
			stream.readBytes(self._mergedStream, self._mergedStream.position, stream.length);
			self._mergedStream.poistion += stream.length;
		}
		
		var crc = self.createCRC(self._mergedStream);
		self._mergedStream.clear();
		
		return crc;
	};
	
	self.createCRC = function(inStream) {
		var offset = 0;
		var bytes = inStream.length;
		var c = 0;
		
		while(--bytes >= 0) {
			c = self.CRC_TABLE[(c ^ inStream[offset++]) & 0xff] ^ (c >>> 8);
		}
		c = ~c;
		
		if (self.DEBUG_MODE) {
			console.log("[CRC] Created CRC " + dec2bin(c) + " from " + inStream.length + " byte(s)");	
		}
		
		return c;
	};
	
	return self;
};
























