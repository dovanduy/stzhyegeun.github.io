function Player(inParentContext) {
	if(!(this instanceof Player)){
		return new Player(inParentContext);
	}
	
	var _viewContext = inParentContext;
	
	var _playerSprite = _viewContext.game.add.sprite(0, 0, 'ball');
	_playerSprite.anchor.set(0.5, 0.5);
	
	var self = {};
	
	self.getSprite = function(){
		return _playerSprite;
	};
	
	return self;
};