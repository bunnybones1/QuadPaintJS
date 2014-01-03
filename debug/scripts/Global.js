define([
	'Class',
	'signals',
	'ResourceManager'
], function(
	Class, 
	signals,
	ResourceManager
) {
	var Global = new Class({
		width: 0,
		height: 0,
		aspectRatio: 1,
		onResizeSignal: null,
		devicePixelRatio: 1,

		startTime: 0,
		now: 0,

		brush: {
			waveScale: 50,
			shiverScale: 50
		},
		resourceManager: null,
		initialize: function() {
			this.now = this.startTime = Date.now() * .001;
			this.resourceManager = new ResourceManager();
			this.onResizeSignal = new signals.Signal();
			window.onresize = this.onResize.bind(this);
			if(window.devicePixelRatio !== undefined) this.devicePixelRatio = window.devicePixelRatio;
		},
		onResize: function() {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.widthPixelCorrect = window.innerWidth * this.devicePixelRatio;
			this.heightPixelCorrect = window.innerHeight * this.devicePixelRatio;
			this.aspectRatio = this.width / this.height;
			this.onResizeSignal.dispatch(this.width, this.height);
		}
	});
	return new Global();
});