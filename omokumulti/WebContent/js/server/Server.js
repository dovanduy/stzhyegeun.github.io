
window.connetCallback = {};

window.peerConn.on('data', function(data){
	 var data = JSON.parse(data);
	 
	 if(data === undefined && data === null){
		 StzCommon.StzLog.print("서버 응답 데이터 양식 오류");
	 }
	 
	 if(data.method !== undefined && data.method !== null){
		 window.connetCallback[data.method](data); 
	 }
});

var Server = {
		request : function(parm){
			window.peerConn.send(parm);
		},
};