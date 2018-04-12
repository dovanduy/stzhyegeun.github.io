/**
 *
 */
function ProfileInfoModel (inUserId, inPlatformId, inName, inPhotoUrl, inTzOffset) {

	if (!(this instanceof ProfileInfoModel)) {
		return new ProfileInfoModel(inUserId, inPlatformId, inName, inPhotoUrl, inTzOffset);
	}

	StzLog.assert(typeof inUserId === "number", "[ProfileInfoModel] inUserId is not number!");
	StzLog.assert(typeof inPlatformId === "string", "[ProfileInfoModel] inPlatformId is not string!");
	StzLog.assert(typeof inName === "string", "[ProfileInfoModel] inName is not string!");
	StzLog.assert(typeof inPhotoUrl === "string", "[ProfileInfoModel] inPhotoUrl is not string!");
	StzLog.assert(typeof inTzOffset === "number", "[ProfileInfoModel] inTzOffset is not number!");
	
	var _obj = {
		user_id: inUserId, 
		platform_id: inPlatformId, 
		name: inName, 
		img_url: inPhotoUrl, 
		etc: inTzOffset
	};
	
	this.getObject = function() {
		return _obj;
	};
	
	var _isChanged = true;
	this.isChanged = function() {
		return _isChanged;
	};
	
	this.didSaved = function() {
		_isChanged = false;
	};
	
	this.updateInfo = function(inNameV, inPhotoUrlV, inTzOffsetV) {
		
		StzLog.assert(typeof inNameV === "string", "[ProfileInfoModel.updateInfo] inName is not string!");
		StzLog.assert(typeof inPhotoUrlV === "string", "[ProfileInfoModel.updateInfo] inPhotoUrl is not string!");
		StzLog.assert(typeof inTzOffsetV === "number", "[ProfileInfoModel.updateInfo] inTzOffset is not number!");
		
		if (_obj.name != inNameV) {
			_obj.name = inNameV;
			_isChanged = true;
		}
		
		if (_obj.img_url != inPhotoUrlV) {
			_obj.img_url = inPhotoUrlV;
			_isChanged = true;
		}
		
		if (_obj.etc = inTzOffsetV) {
			_obj.etc = inTzOffsetV;
			_isChanged = true;
		}
	};
	
	this.getPlatformId = function() {
		return _obj.platform_id;
	}
	
	this.getUserId = function() {
		return _obj.user_id;
	};
	
	this.getName = function() {
		return _obj.name;
	};
	
	this.getPhotoUrl = function() {
		return _obj.img_url;
	};
	
	this.getImageKey = function() {
		if(_obj.img_url && _obj.img_url.indexOf('http') >= 0){
			return 'photo_' + _obj.platform_id;
		}
		else if(_obj.img_url === "default_thumb" || _obj.img_url === "default_ahua"
			 || _obj.img_url === "default_panta" || _obj.img_url === "default_stic"){
			return _obj.img_url;
		}
		else{
			return "default_photo";
		}
	};
	
	this.getTimezoneOffset = function() {
		return _obj.etc;
	};
	
	this.loadProfileImage = function(inGame, inCallback, inContext) {
	    
	    if (!_obj.img_url) {
	        return;
	    }
	    
	    StzUtil.loadImageFromURL(inGame, this.getImageKey(), this.getPhotoUrl(), inCallback, inContext);
	};
}
