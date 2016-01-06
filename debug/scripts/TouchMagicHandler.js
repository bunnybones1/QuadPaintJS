define([],
function() {
	function TouchDrawHandler() {
		this.touches = 3;
		this.name = 'magic';
		this.onStart = this.onStart.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onEnd = this.onEnd.bind(this);
	}

	TouchDrawHandler.prototype.onStart = function(touches) {
		console.log('magic start', touches.length);
	}

	TouchDrawHandler.prototype.onMove = function(touches) {
		console.log('magic', touches.length);
	}

	TouchDrawHandler.prototype.onEnd = function(touches) {
		console.log('magic end', touches.length);
	}

	return TouchDrawHandler;
});