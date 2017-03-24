function AniBot(inContext, inDifficulty) {
	
	if(!(this instanceof AniBot)){
		return new AniBot();
	}
	
	var _context = inContext;
	var _difficulty = inDifficulty || 10;
	
	var MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
	var MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
	var PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
	var PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
	var MAX_AUTO_MATCH_COUNT = 30;
	var AUTO_DIFFICULTY_SCORE_OFFSET = 30000;
	
	var _currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
	var _remainMatchTime = _currentMatchTime;
	var _aniState = 1;
	
	var _isStopUpdate = false;
	
	var self = {
		score: 0, 
		combo: 0,
		totalMatchedBlock: 0,
		autoDifficulty: false,
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

	self.isStop = function() {
		return _isStopUpdate;
	};
	
	self.getAniState = function() {
		return _aniState;
	};
	
	self.setNextMatch = function() {
		if (_aniState === self.EState.PLAYED) {
			
			if (self.autoDifficulty) {
				if (self.score - _context.scoreData.getScore() > AUTO_DIFFICULTY_SCORE_OFFSET) {
					self.updateDifficulty(_difficulty + 1);
				} else if (_context.scoreData.getScore() - self.score > AUTO_DIFFICULTY_SCORE_OFFSET) {
					self.updateDifficulty((_difficulty <= 1) ? _difficulty : _difficulty - 1);
				}
			}
			
			_aniState = self.EState.THINKING;
			_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS);
			_remainMatchTime = _currentMatchTime;
			_aniState = self.EState.READY;
		} 
	};
	
	self.updateDifficulty = function(newDifficulty) {
		if (_difficulty === newDifficulty) {
			return;
		} 
		
		//StzLog.print('[AniBot (updateDifficulty)] Change Bot Difficulty from: ' + _difficulty + ', to: ' + newDifficulty);
		
		_difficulty = newDifficulty || 10;
		MIN_MATCH_INTERVAL_MS = 100 + (_difficulty * 100);
		MAX_MATCH_INTERVAL_MS = 1800 + (_difficulty * 100);
		PROB_FIVE_MATCH = 0.15 - (_difficulty * 0.01);
		PROB_FOUR_MATCH = 0.35 - (_difficulty * 0.01);
		
		_currentMatchTime = StzUtil.createRandomInteger(MIN_MATCH_INTERVAL_MS, MAX_MATCH_INTERVAL_MS); 
		_remainMatchTime = _currentMatchTime;
		
	};
	
	self.playBot = function() {
		
		self.combo = (_currentMatchTime <= EScoreConfig.COMBO_TIME) ? self.combo + 1 : 0;
		//StzLog.print('[AniBot] currentMatchTime: ' + _currentMatchTime);
		
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
		
		self.totalMatchedBlock = self.totalMatchedBlock + matchCount; 
		self.score = self.score + ((self.combo + 1) * EScoreConfig.UNIT_SCORE * matchCount);
		
		_aniState = self.EState.PLAYED;
		if (self.playListener && typeof self.playListener === 'function') {
			self.playListener();
		} 
	};
	
	self.update = function() {
		
		if (_isStopUpdate) {
			return;
		}
		
		_remainMatchTime = _remainMatchTime - _context.game.time.elapsedMS;
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
	}
	return self;
}