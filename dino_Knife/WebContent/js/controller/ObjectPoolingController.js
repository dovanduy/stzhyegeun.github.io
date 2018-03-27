var StzObjectPoolManager = function() {
	
	if (!(this instanceof StzObjectPoolManager)) {
		return new StzObjectPoolManager();
	}
	
	this.DEBUG_MODE = false;
	
	this.pool = {};
	
	this.logPoolLength = function() {
		
		if (this.DEBUG_MODE === false) {
			return;
		}
		
		var totalLength = 0;
		console.log(">>>>>>>>>> ObjectPoolManager <<<<<<<<<<");
		for (var key in this.pool) {
			if (this.pool.hasOwnProperty(key)) {
				var currentCount = this.pool[key]._list.length;
				console.log("    this.pool." + key + "'s length: " + currentCount);
				totalLength += currentCount;
			}
		}
		console.log("    --- TOTAL COUNT : " + totalLength);
		console.log(">>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<");
	};
	
	this.addPool = function(inName, inCreator, inDestroyer, inContext, inDebugMode) {

		if (this.pool.hasOwnProperty(inName)) {
			return false;
		} 
		
		this.pool[inName] = new StzObjectPoolModel();
		this.pool[inName]._name = inName;
		this.pool[inName].DEBUG_MODE = this.DEBUG_MODE || inDebugMode;	
		this.pool[inName].setCreator(inCreator, inContext);
		this.pool[inName].setDestroyer(inDestroyer, inContext);
	};
	
	this.init = function(inIsHardInit) {
		
		var isHardInit = (inIsHardInit === undefined || inIsHardInit === null ? true : inIsHardInit);
		for (var key in this.pool) {
			if (this.pool.hasOwnProperty(key)) {
				this.pool[key].init(isHardInit);
			}
		}
	};
};
var PoolManager = new StzObjectPoolManager();

var StzObjectPoolModel = function() {
	
	if (!(this instanceof StzObjectPoolModel)) {
		return new StzObjectPoolModel();
	}
	
	this.DEBUG_MODE = false;
	
	this._name = null;
	this._list = [];
	this._fCreate = null;
	this._fDestroy = null;

	this.isReady = false;
	
	this.setCreator = function(inFunction, inContext) {
		this._fCreate = inFunction.bind(inContext);
		this.isReady = (this._fCreate !== null && this._fDestroy !== null); 
	};
	
	this.setDestroyer = function(inFunction, inContext) {
		this._fDestroy = inFunction.bind(inContext);
		this.isReady = (this._fCreate !== null && this._fDestroy !== null);
	};
	
	this.unloadList = function(inAnim) {
		for (var i = this._list.length - 1; i >= 0; i--) {
			if (inAnim && this._list[i].animations) {
				this._list[i].animations.stop(inAnim, true);
			}
			this._list[i].isPoolUsing = false;
		}
	};
	
	this.unloadView = function(inView, inAnim) {
		if (!inView) {
			if (this.DEBUG_MODE) {
				console.log("[StzObjectPoolMode] (unloadView) unload fail, inBlockView is null" + (this._name ? " - name: " + this._name : ""));
			}
			return null;
		}
		
		var currentIndex = -1;
		if (inView.poolIndex === undefined || inView.poolIndex === null || inView.poolIndex < 0) {
			currentIndex = this._list.indexOf(inView);
			if (this.DEBUG_MODE) {
				console.log("[StzObjectPoolModel] (unloadView) no poolIndex - index: " + currentIndex);
			}
		} else {
			currentIndex = inView.poolIndex;
			if (this.DEBUG_MODE) {
				console.log("[StzObjectPoolModel] (unloadView) poolIndex - index: " + currentIndex);
			}
		}
		
		if (currentIndex < 0 || currentIndex >= this._list.length) {
			if (this.DEBUG_MODE) {
				console.log("[StzObjectPoolModel] (unloadView) poolIndex - out of list.");
			}
			return false;
		}
		
		if (this._list[currentIndex] === undefined || this._list[currentIndex] === null) {
			if (this.DEBUG_MODE) {
				console.log('[StzObjectPoolModel] (unloadView) failed: no view in pool - index: ' + currentIndex);
			}
			return false;
		}
		
		if (inAnim && this._list[i].animations) {
			this._list[currendIndex].animations.stop(inAnim, true);
		}
		
		this._list[currentIndex].isPoolUsing = false;
		
		if (typeof this._list[currentIndex].didUnloadView != "function") {
			throw new Error("Pooling object must have didUnLoadView method!!");
		}
		
		this._list[currentIndex].didUnloadView();
		return true;
	};
	
	this.loadView = function() { // inX, inY, inKey, inFrame, inGroup
		
		if (!this.isReady) {
			return null;
		}

		var resultView = null;
		for (var i = 0; i < this._list.length; i++) {
			if (this._list[i].isPoolUsing === false) {
				resultView = this._list[i];
				break;
			}
		}
		
		if (resultView === null) {
			// NOTE create View
			resultView = this._fCreate.apply(this, arguments);
			this._list.push(resultView);
			
			if (this.DEBUG_MODE) {
				console.log('[StzObjectPool (loadView)] create - list length: ' + this._list.length + (this._name ? ", name: " + this._name : ""));
			}
		} else {
			if (this.DEBUG_MODE) {
				console.log('[StzObjectPool (loadView)] load - list length: ' + this._list.length + (this._name ? ", name: " + this._name : ""));
			}
		} 
		
		resultView.isPoolUsing = true;
		resultView.poolIndex = this._list.indexOf(resultView);
		
		if (typeof resultView.didLoadView != "function") {
			throw new Error("Pooling object must have didLoadView method!!");
		}
		
		resultView.didLoadView();
		return resultView;
	};
	
	this.init = function(inIsHardInit) {
		var isHardInit = (inIsHardInit === undefined || inIsHardInit === null ? true : inIsHardInit);

		if (isHardInit) {
			while(this._list.length > 0) {
				this._fDestroy(this._list.shift());
				//this._list.shift().kill();
			}
		} else {
			this.unloadList();
		}
		
	};
};
