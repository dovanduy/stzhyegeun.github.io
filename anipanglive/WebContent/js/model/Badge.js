var EBadgeScoreConfig = {
		BADGE_MAX_SCORE			: 3999
		,MAX_GRADE				: 4
		,MAX_STAR_COUNT			: 4
		,STANDARD_RESULT_COUNT	: 20
		,MAX_RESULT_COUNT		: 35
		,MIN_RESULT_COUNT		: 5
		,WEIGHT					: 0.05
};

var EBadgeGradePoint = [0, 20, 60, 120, 200, 300, 400, 550, 700, 850, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 
                        2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000];
function Badge(inParentContext, badgeScore) {
	if(!(this instanceof Badge)){
		return new Badge(inParentContext, badgeScore);
	}
	
	var _viewContext = inParentContext;
	var _badgeData = this.initData(badgeScore);
	
	var self = {};
	
	self.updateBadgeData = function(badgeScore){
		_badgeData = this.initData(badgeScore);
		return _badgeData;
	}.bind(this);
	
	self.getBadgeData = function(){
		return _badgeData;
	};
	//결과에 따른 포인트를 증/감을 계산
	self.calcResultPoint = function(rivalScore){
		if(_badgeData.badgeScore - rivalScore >= 301){
			return EBadgeScoreConfig.MIN_RESULT_COUNT;
		}
		else if(_badgeData.badgeScore - rivalScore <= -301){
			return EBadgeScoreConfig.MAX_RESULT_COUNT;
		}
		else{
			return EBadgeScoreConfig.STANDARD_RESULT_COUNT - Math.round((_badgeData.badgeScore - rivalScore)*EBadgeScoreConfig.WEIGHT);
		}
	};
	
	return self;
}

Badge.prototype.initData = function(badgeScore){
	var badgeData = {grade:0, starCount:0, badgeScore:0};
	
	badgeData.badgeScore = badgeScore;
	if(badgeData.badgeScore > EBadgeScoreConfig.BADGE_MAX_SCORE){
		badgeData.grade = EBadgeScoreConfig.MAX_GRADE;
		badgeData.starCount = EBadgeScoreConfig.MAX_STAR_COUNT;
	}
	else{
		var badgeGradeNum = 0;
		for(var i =1; i < EBadgeGradePoint.length; i++){
			if(EBadgeGradePoint[i-1] <= badgeScore && badgeScore < EBadgeGradePoint[i]){
				badgeGradeNum = i-1;
				break;
			}
		}
		badgeData.grade = Math.floor(badgeGradeNum/5);
		badgeData.starCount = Math.floor(badgeGradeNum%5);
	}
	return badgeData;
};

Badge.getBadgeName = function(grade){
	switch(grade){
	case 0:
		return 'CLOUD';
	case 1:
		return 'MOON';
	case 2:
		return 'STAR';
	case 3:
		return 'PLANET';
	case 4:
		return 'SUN';
	}
};
