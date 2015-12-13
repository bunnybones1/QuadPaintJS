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
		brightnessUniform: {type: 'f', value: 1},
		timeUniform: {type:"f", value: 0},
		resourceManager: null,
		initialize: function() {
			this.initUrlParams();
			this.brightnessUniform.value = this.urlParams.debug ? 1 : 0;

			this.now = this.startTime = Date.now() * 0.001;
			this.timeUniform.value = this.now;
			this.resourceManager = new ResourceManager();
			this.onResizeSignal = new signals.Signal();
			window.onresize = this.onResize.bind(this);
			if(window.devicePixelRatio !== undefined) this.devicePixelRatio = window.devicePixelRatio;
		},
		initUrlParams: function() {
			var chunks = window.document.location.search.split('?').join('').split('&');
			var params = [];
			chunks.forEach(function(chunk){
				var subChunks = chunk.split('=');
				if(subChunks.length === 2) params[subChunks[0]] = subChunks[1];
			});
			this.urlParams = params;
		},
		onResize: function() {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.widthPixelCorrect = window.innerWidth;
			this.heightPixelCorrect = window.innerHeight;
			this.aspectRatio = this.width / this.height;
			this.onResizeSignal.dispatch(this.width, this.height);
		}
	});
	return new Global();
});