define([
	'Class',
	'geometry/Rectangle',
	'view/SplittingView',
	'view/SplittingViewUI',
	'Global'
], function(
	Class,
	Rectangle,
	SplittingView,
	SplittingViewUI,
	Global
){
	var DisplayManager = new Class({
		splittingViewUI: null,
		initialize:function(scene, renderer, canvas) {
			console.log("Initializing DisplayManager");
			this.scene = scene;
			this.renderer = renderer;

			this.onResize = this.onResize.bind(this);
			this.splittingView = new SplittingView(this.scene, this.renderer, null, new Rectangle(0, 0, Global.width, Global.height));
			this.camera = this.splittingView.camera;
			//var firstSplit = this.splittingView.split("x", .33);
			//firstSplit[0].split("y", .33)[0].split("x", .33)[0].split("y", .33)[0].split("x", .33);
			//firstSplit[0].split("y", .5);
			//var middleSplit = firstSplit[1].split("x", .5);
			//middleSplit[0].split("y", .5);
			//middleSplit[1].split("y", .66)[1].split("x", .66)[1].split("y", .66);

			this.splittingViewUI = new SplittingViewUI(this.splittingView, this.canvas);
		},
		render:function() {
			this.splittingView.render();
		},
		onResize:function(width, height) {
			this.splittingView.viewRectangle.onResize(Global.widthPixelCorrect, Global.heightPixelCorrect);
			this.splittingView.onResize(width, height);
		}
	});
	return DisplayManager;
});