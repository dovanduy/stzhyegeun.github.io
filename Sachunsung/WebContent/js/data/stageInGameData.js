stageInGameData.prototype = {
		index:0,
		patterns:[],
		options:[],
		countShuffle:0,
		countHint:0,
		boardWidth:0,
		boardHeight:0,
		limitTime:0,
		blockSetCount:0,
		difficulty:0,
		event:false
};

function stageInGameData(ingame, stageNum) {
	var stageData = ingame.cache.getText('stage' + stageNum);
	parser=new DOMParser();

	var xmlDoc=parser.parseFromString(stageData, "text/xml");
	 
	 // 특정 테그를 기준으로 변수에 담는다
	 var xml = xmlDoc.getElementsByTagName('stages');
	 
	// getElementsByTagName : 태그 호출
	// childNodes : 자식 노드
	// nodeValue : 해당 노드의 값(text)
	this.index = stageNum;
	this.patterns = (xml[0].getElementsByTagName('stage')[0].getElementsByTagName('patterns')[0].childNodes[0].nodeValue).split(',');
	this.options = (xml[0].getElementsByTagName('stage')[0].getElementsByTagName('options')[0].childNodes[0].nodeValue).split(',');
	this.countShuffle = parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('countShuffle')[0].childNodes[0].nodeValue);
	this.countHint =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('countHint')[0].childNodes[0].nodeValue);
	this.boardWidth =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('boardWidth')[0].childNodes[0].nodeValue);
	this.boardHeight =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('boardHeight')[0].childNodes[0].nodeValue);
	this.limitTime =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('limitTime')[0].childNodes[0].nodeValue);
	this.blockSetCount =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('blockSetCount')[0].childNodes[0].nodeValue);
	this.difficulty =  parseInt(xml[0].getElementsByTagName('stage')[0].getElementsByTagName('difficulty')[0].childNodes[0].nodeValue);
	this.event = (xml[0].getElementsByTagName('stage')[0].getElementsByTagName('event')[0].childNodes[0].nodeValue == 'true');
}
