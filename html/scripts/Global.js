var Class = require('./class/Class');
var Global = new Class({
	width: 0,
	height: 0,
	aspectRatio: 1,
	onResizeSignal: null,
	onMouseMoveSignal: null,
	startTime: 0,
	now: 0,
	initialize: function() {
		this.onResizeSignal = new signals.Signal();
		this.onMouseMoveSignal = new signals.Signal();
		window.onresize = this.onResize.bind(this);
	},
	onResize: function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.aspectRatio = this.width/this.height;
		this.onResizeSignal.dispatch(this.width, this.height);
	},
	onMouseMove: function(event) {
		this.onMouseMoveSignal.dispatch(event.x, event.y);
	}
});
module.exports =  new Global();