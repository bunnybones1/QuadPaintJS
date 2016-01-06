define([],
function() {
	function TouchDrawHandler(splittingViewUI, tablet) {
		this.touches = 1;
		this.name = 'draw';
		this.splittingViewUI = splittingViewUI;
		this.tablet = tablet;

		this.onStart = this.onStart.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onEnd = this.onEnd.bind(this);
	}

	TouchDrawHandler.prototype.onStart = function(touches) {
		console.log('external draw start', touches.length);
		var x = touches[0].clientX;
		var y = touches[0].clientY;
		this.splittingViewUI.onPenDown(x, y);
		this.tablet.penDown(x, y);
	}

	TouchDrawHandler.prototype.onMove = function(touches) {
		console.log('external draw move', touches.length);
		var x = touches[0].clientX;
		var y = touches[0].clientY;
		this.splittingViewUI.onPenDrag(x, y, 1);
		this.tablet.penDrag(x, y);
	}

	TouchDrawHandler.prototype.onEnd = function(touches) {
		console.log('external draw end', touches.length);
		var x = touches[0].clientX;
		var y = touches[0].clientY;
		this.splittingViewUI.onPenUp(x, y);
		this.tablet.penUp(x, y);
	}

	return TouchDrawHandler;
});