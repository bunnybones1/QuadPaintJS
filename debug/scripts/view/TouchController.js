define([
], function(){
	function TouchPanZoomController(inputTouch, splittingView) {
		this.startDurationTolerance = 100;
		this.identifiersStarting = [];
		this.activeHandlers = [];
		console.log("Initializing TouchPanZoomController");

		this.splittingView = splittingView;

		this.startCutoffPeriod = this.startCutoffPeriod.bind(this);
		this.startingTouches = [];
		for (var i = 0; i < this.startingTouches.length; i++) {
			this.startingTouches[i] = undefined;
		};

		this.registeredHandlers = [];
		for (var i = 0; i < this.registeredHandlers.length; i++) {
			this.registeredHandlers[i] = null;
		};

		inputTouch.onTouchStartSignal.add(this.touchStartHandler.bind(this));
		inputTouch.onTouchMoveSignal.add(this.touchMoveHandler.bind(this));
		inputTouch.onTouchEndSignal.add(this.touchEndHandler.bind(this));
	}

	TouchPanZoomController.prototype.registerHandler = function(handler) {
		if(handler.touches === undefined
			|| handler.onStart === undefined
			|| handler.onMove === undefined
			|| handler.onEnd === undefined
			|| handler.name === undefined
		) {
			throw new Error('Missing something.');
		}
		this.registeredHandlers[handler.touches] = handler;
	}

	TouchPanZoomController.prototype.touchStartHandler = function(event) {
		var _this = this;
		Array.prototype.forEach.call(event.changedTouches, function(touch){
			_this.touchHandler('start', event);
			_this.identifiersStarting.push(touch.identifier);
			_this.startingTouches[touch.identifier] = touch;
			if(_this.startTimeoutId === undefined) {
				_this.startTimeoutId = setTimeout(_this.startCutoffPeriod, _this.startDurationTolerance);
			}
		});
	}

	TouchPanZoomController.prototype.startCutoffPeriod = function() {
		delete this.startTimeoutId;
		console.log('gesture', this.identifiersStarting.length );
		var _this = this;
		var touches = this.startingTouches.filter(function(touch){
			if(touch && _this.identifiersStarting.indexOf(touch.identifier) !== -1) return touch;
		});
		var handler = this.registeredHandlers[this.identifiersStarting.length];
		if(handler) {
			handler.identifiers = this.identifiersStarting.slice(),
			handler.onStart(touches);
			this.activeHandlers.push(handler);
		}
		this.identifiersStarting.length = 0;
	}

	TouchPanZoomController.prototype.touchEndHandler = function(event) {
		this.touchHandler('end', event);
		var _this = this;
		Array.prototype.forEach.call(event.changedTouches, function(touch) {
			var index = _this.identifiersStarting.indexOf(touch.identifier);
			if(index !== -1) _this.identifiersStarting.splice(index, 1);
		});
		var groupToEndIndex = -1;
		this.activeHandlers.forEach(function(group, i){
			Array.prototype.forEach.call(event.changedTouches, function(touch) {
				index = group.identifiers.indexOf(touch.identifier);
				if(index !== -1) {
					groupToEndIndex = i;
				}
			});
		});
		if(groupToEndIndex !== -1) {
			var group = this.activeHandlers[groupToEndIndex];
			var implicatedChangedTouches = Array.prototype.filter.call(event.changedTouches, function(touch) {
				return group.identifiers.indexOf(touch.identifier) !== -1;
			});
			var implicatedTouches = Array.prototype.filter.call(event.touches, function(touch) {
				return group.identifiers.indexOf(touch.identifier) !== -1;
			});
			group.onEnd(implicatedTouches.concat(implicatedChangedTouches));

			this.activeHandlers.splice(groupToEndIndex, 1);
		}
	}

	TouchPanZoomController.prototype.touchMoveHandler = function(event) {
		this.touchHandler('move', event);
		this.activeHandlers.forEach(function(group) {
			group.onMove(Array.prototype.filter.call(event.touches, function(touch) {
				return (group.identifiers.indexOf(touch.identifier) !== -1);
			}));
		});
	}

	TouchPanZoomController.prototype.touchHandler = function(type, event) {
		event.preventDefault();
		Array.prototype.forEach.call(event.changedTouches, function(touch) {
			console.log(type, touch.identifier, touch.pageX, touch.pageY);
		});
	}

	TouchPanZoomController.prototype.zoomHandler = function(zoom) {
		console.log('zoom', zoom);
	}

	return TouchPanZoomController;
});