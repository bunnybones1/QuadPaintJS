var Class = require('./class/Class');
var Global = require('./Global');
var Rectangle = require('./geometry/Rectangle');

var SplittingSubView = new Class({
	scene: null,
	camera: null,
	renderer: null,
	parentView: null,
	childrenViews: null,
	viewRectangle: null,
	randomSeed: 0,
	axis: "y",
	initialize:function(scene, renderer, parentView, viewRectangle) {
		this.scene = scene;
		this.renderer = renderer;
		this.axis = !parentView ? "x" : (parentView.axis == "x") ? "y" : "x";

		this.camera = new THREE.PerspectiveCamera(45, Global.aspectRatio, 1, 10000);
		this.scene.add(this.camera);
		this.parentView = parentView;
		this.viewRectangle = viewRectangle;
		this.randomSeed = Math.random();
	},
	render: function() {
		this.camera.rotation.y+=.01;
		this.camera.rotation.x = Math.sin(Global.now * .001 * this.randomSeed);
		if(this.childrenViews) {
			for (var i = this.childrenViews.length - 1; i >= 0; i--) {
				this.childrenViews[i].render();
			};
		} else {
            this.renderer.setViewport( ~~this.viewRectangle.x, ~~this.viewRectangle.y, ~~this.viewRectangle.width, ~~this.viewRectangle.height );
	        this.renderer.render(this.scene, this.camera);
		}
	},
	split: function(axis, fraction) {
		if(!this.childrenViews) {
			this.childrenViews = [];
			var rectangles = this.viewRectangle.split(axis, fraction);
			for (var i = 0; i < 2; i++) {
				this.childrenViews[i] = new SplittingSubView(this.scene, this.renderer, this, rectangles[i]);
			};
			return this.childrenViews;
		}
	},
	splitUnderCoordinate: function(x, y) {
		if(this.viewRectangle.contains(x, y)) {
			if(this.childrenViews) {

			}
		}
	},
    onResize:function(width, height) {
        this.camera.aspect = Global.aspectRatio;
        this.camera.updateProjectionMatrix();
    }
});
module.exports = SplittingSubView;
