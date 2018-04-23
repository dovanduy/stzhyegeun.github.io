/**
 *
 */
function ChatbotManager_proto () {
	if (!(this instanceof ChatbotManager_proto)) {
		return new ChatbotManager_proto();
	}
	
	var _chatbotObj = null;
	var _isSendChatbot = false;
	//"repeat:-1:ep1_prologue"
	this.init = function(inGame, inChatbotData){
		this.game = inGame;
		_chatbotObj = new Object();
		
		var tempArray = this._setChatbotData(inChatbotData);
		
		if(tempArray.length < 3){
			_chatbotObj = null;
			return;
		}
		else{
			_chatbotObj.type = tempArray[0];
			_chatbotObj.condition = Number(tempArray[1]);
			_chatbotObj.nextMsg = tempArray[2];
		}
	};
	
	this.sendChatbotMessage = function(){
		if(!_chatbotObj || !window.FBInstant || _isSendChatbot === true){
			return;
		}
		
		if(_chatbotObj.type === EChatbotType.STAGE){
			if(PlayerDataManager.saveData.getBestStage() <= _chatbotObj.condition){
				return;
			}
		}
		_isSendChatbot = true;
		Server.sendChatbotMessage(_chatbotObj.nextMsg);
	};
	
	this._setChatbotData = function(inValue){
		if (inValue === null || undefined) {
			return null;
		}
		
		var ARRAY_DELIMETER = ":";
		
		var result = null;
		if (typeof inValue === "string" && inValue.indexOf(ARRAY_DELIMETER)) {
			result = inValue.split(ARRAY_DELIMETER);
		} else {
			result = [inValue];
		}
		return result;
	}
	
	this.getChatbotData = function(){
		return _chatbotObj;
	}
}
