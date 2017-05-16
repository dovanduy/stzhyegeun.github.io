function AniBot(inContext, inDifficulty) {
	
	if(!(this instanceof AniBot)){
		return new AniBot();
	}
	
	var _context = inContext;
	var _difficulty = inDifficulty || 20;
	var _remainDifficultyUpdateTime = 0;
	
	var MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
	var MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
	var PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
	var PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
	//var MAX_AUTO_MATCH_COUNT = 30;
	var MAX_AUTO_MATCH_COUNT = 50;
	
	var AUTO_DIFFICULTY_SCORE_OFFSET = 1000;
	var AUTO_DIFFICULTY_SCORE_CHANGE_MS = 1000;
	
	var _currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
	var _remainMatchTime = _currentMatchTime;
	var _aniState = 1;
	
	var _isStopUpdate = false;
	
	var self = {
		score: 0, 
		combo: 0,
		totalMatchedBlock: 0,
		remainBombCount: 300/*StzGameConfig.ICE_CREAT_COUNT*/,
		autoDifficulty: true,
		playListener: null, 
		info: {
			'name': 'Ani', 
			'thumbnail': 'assets/images/avatar_anibot.png'
		}
	};
	
	self.EState = {
		THINKING: 0, 
		READY: 1,
		PLAYED: 2
	};

	self.getDifficulty = function() {
		return _difficulty;
	};
	
	self.isStop = function() {
		return _isStopUpdate;
	};
	
	self.getAniState = function() {
		return _aniState;
	};
	
	self.setNextMatch = function() {
		if (_aniState === self.EState.PLAYED) {
			
			if (self.autoDifficulty && _remainDifficultyUpdateTime <= 0) {
				var scoreGap = self.score - _context.scoreData.getScore();
//				if (scoreGap < 0) {
//					
//				} else {
//					self.updateDifficulty(((_difficulty + Math.floor(scoreGap/1000)) <= 1) ? 1 : (_difficulty - Math.floor(scoreGap/1000)));
//				}
				self.updateDifficulty(_difficulty + Math.floor(scoreGap/1000));
			}
			
			_aniState = self.EState.THINKING;
			_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS);
			_remainMatchTime = _currentMatchTime;
			_aniState = self.EState.READY;
		} 
	};
	
	self.updateDifficulty = function(newDifficulty) {
		if(newDifficulty < 0){
			newDifficulty = 1;
		}
		else if(newDifficulty > 30){
			newDifficulty = 30;
		}
		
		if (_difficulty === newDifficulty) {
			return;
		} 
		
		//console.log('[AniBot (updateDifficulty)] Change Bot Difficulty from: ' + _difficulty + ', to: ' + newDifficulty);
		var matchedMin = 50;
		_difficulty = newDifficulty || 10;
		MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
		MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
		PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
		PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
		MAX_AUTO_MATCH_COUNT = matchedMin - _difficulty*2;
		if(MAX_AUTO_MATCH_COUNT <= 0){
			MAX_AUTO_MATCH_COUNT = 1;
		}
		_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
		_remainMatchTime = _currentMatchTime;
		_remainDifficultyUpdateTime = AUTO_DIFFICULTY_SCORE_CHANGE_MS;
	};
	
	
	self.playBot = function() {
		self.combo = (_currentMatchTime <= EScoreConfig.ANIBOT_COMBO_TIME) ? self.combo + 1 : 0;
		StzLog.print('[AniBot] currentMatchTime: ' + _currentMatchTime);
		
		var matchCount = (function() {
			var autoMatchCount = StzUtil.createRandomInteger(0, MAX_AUTO_MATCH_COUNT);
			var randValue = Math.random();
			if (randValue <= PROB_FIVE_MATCH) {
				return 5 + autoMatchCount;
			} else if (randValue <= PROB_FOUR_MATCH) {
				return 4 + autoMatchCount;
			} else {
				return 3 + autoMatchCount;
			}
		})();
		
		self.remainBombCount = self.remainBombCount - matchCount;
		self.totalMatchedBlock = self.totalMatchedBlock + matchCount; 
		
		self.score = self.score +  Score.calculateScore(matchCount,(self.combo+1), EScoreType.GEN_MATCHED);
		
		_aniState = self.EState.PLAYED;
		if (self.playListener && typeof self.playListener === 'function') {
			self.playListener();
		} 
		if (self.remainBombCount <= 0) {
			self.remainBombCount = 300;/*StzGameConfig.ICE_CREAT_COUNT*/
		} 
	};
	
	self.update = function() {
		
		if (_isStopUpdate) {
			return;
		}
		
		_remainMatchTime = _remainMatchTime - _context.game.time.elapsedMS;
		
		if (self.autoDifficulty && _remainDifficultyUpdateTime > 0) {
			_remainDifficultyUpdateTime = _remainDifficultyUpdateTime - _context.game.time.elapsedMS;	
		}
		
		if (_remainMatchTime <= 0 && _aniState === self.EState.READY) {
			self.playBot();
			self.setNextMatch();
		}
	};
	
	self.stop = function() {
		_isStopUpdate = true;
	};
	
	self.start = function() {
		_isStopUpdate = false;
	};
	return self;
}