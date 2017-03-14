
Profile.prototype = {
		levelText:null,
		remainText:null,
		remainExp:0,
		totalExp:0,
		level:1,
};

function Profile(inGame, aParent, totalExp) {

	if(!(this instanceof Profile)){
		return new ProFile(inGame, aParent, atlasName);
	}
	
	this.inGame = inGame;
	this.aParent = aParent;
	this.totalExp = totalExp;
	
	this.init();
	this.calExp(totalExp);
}

Profile.prototype.init= function(){
	this.scene = new ProFileScene(this.inGame);
	
	this.levelText = this.inGame.add.text(70, 13, "");
	this.levelText.font = 'Debussy';
	this.levelText.fontSize = 16;
	var a = 1143460;
	this.levelText.fill = "#" + a.toString(16);
	
	
	this.remainText = this.inGame.add.text(180, 20, "");
	this.remainText.font = 'Debussy';
	this.remainText.fontSize = 11;
	var a = 1143460;
	this.remainText.fill = "#" + a.toString(16);
	
};

Profile.prototype.calExp= function(totalExp){
	var length = EXP_TABLE.length;
	
	for(var i =0;i<length;i++){
		if(this.totalExp - EXP_TABLE[i] > 0){
			this.level++;
			this.totalExp -= EXP_TABLE[i];
		}
		else if(this.totalExp - EXP_TABLE[i] === 0){
			this.level++;
			
			if(i+1 === length){
				this.remainExp = 0;
			}
			else{
				this.remainExp = EXP_TABLE[i+1];
			}
			
			break;
		}
		else{
			this.remainExp = EXP_TABLE[i] - this.totalExp;
			break;
		}
	}
	
	var currentBarWidth = ((EXP_TABLE[this.level - 1] - this.remainExp) / EXP_TABLE[this.level - 1]) * this.scene.fImgLoadingBar.MAX_TARGET_WIDTH;
	if(currentBarWidth <= this.scene.fImgLoadingBar.MIN_TARGET_WIDTH){
		currentBarWidth = this.scene.fImgLoadingBar.MIN_TARGET_WIDTH;
	}
	this.scene.fImgLoadingBar.targetWidth = currentBarWidth*0.8;
	
	this.levelText.text = "Level : " + this.level;
	this.remainText.text = "Next : " + this.remainExp;
};


