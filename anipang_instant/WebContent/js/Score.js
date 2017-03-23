var Score = {
		
	score : 0,
	combo : 0,
	maxScore:0,
	isChangeMaxScore:false,
	
	setInit : function(){
		this.score = 0;
		this.combo = 0;
	},

	getScore : function(){
		return this.comma(this.score);
	},
	
	setScore : function(count){
		
		this.score  = this.score + ((this.combo + 1)*StartPreferences.UNIT_SCORE)*count;
	},
	
	getMaxScore : function(){
		return this.maxScore;
	},
	
	setMaxScore : function(){
		if(this.maxScore < this.score){
			this.isChangeMaxScore = true;
			this.maxScore = this.score;
		}
		else{
			this.isChangeMaxScore = false;
		}
	},
	
	getCombo : function(){
		return this.combo;
	},
	
	setCombo : function(comboDeltaTime, isComboUp){
		if(comboDeltaTime < StartPreferences.COMBO_TIME){
			if(isComboUp == true){
				this.combo++;
			}
		}
		else
		{
			this.combo = 0;
		}
		
		return this.combo;
	},
	
	comma : function(number){
	    var len, point, str;  
	    
	    var strNumber = number + "";
	    len = strNumber.length;
	    point = len % 3 ;
	   
	    str = strNumber.substring(0, point);  
	    while (point < len) {  
	        if (str != "") str += ",";  
	        str += strNumber.substring(point, point + 3);  
	        point += 3;  
	    }  
	     
	    return str;
	}
};