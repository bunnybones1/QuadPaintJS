var Class = require('./class/Class');
var ResourceManager = require('./ResourceManager');
var Global = new Class({
	width: 0,
	height: 0,
	aspectRatio: 1,
	onResizeSignal: null,

	startTime: 0,
	now: 0,

	resourceManager: null,
	initialize: function() {
		this.resourceManager = new ResourceManager();
		this.onResizeSignal = new signals.Signal();
		window.onresize = this.onResize.bind(this);
	},
	onResize: function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.aspectRatio = this.width/this.height;
		this.onResizeSignal.dispatch(this.width, this.height);
	}
});
module.exports =  new Global();