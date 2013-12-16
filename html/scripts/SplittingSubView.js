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
	rotateSpeed: .01,
	fovCompensater: 1,
	defaultFOV: 45,
	cameraFOVMin: .0001,
	cameraFOVMax: 150,
	axis: "y",
	initialize: function(scene, renderer, parentView, viewRectangle) {
		this.scene = scene;
		this.renderer = renderer;
		this.axis = !parentView ? "x" : (parentView.axis == "x") ? "y" : "x";

		this.camera = new THREE.PerspectiveCamera(this.defaultFOV, Global.aspectRatio, 1, 10000);
		this.fovCompensater = this.camera.fov / this.defaultFOV;
		this.scene.add(this.camera);
		this.parentView = parentView;
		this.viewRectangle = viewRectangle;
		this.randomSeed = Math.random();
	},
	render: function() {
		if(this.childrenViews) {
			for (var i = 0; i < 2; i++) {
				this.childrenViews[i].render();
			};
		} else {
			//the coordinates seem flipped on the y axis
            //this.renderer.setViewport( ~~this.viewRectangle.x, ~~this.viewRectangle.y, ~~this.viewRectangle.width, ~~this.viewRectangle.height );
            //flipping them back
            this.renderer.setViewport(
            	Math.round(this.viewRectangle.x), 
            	Global.height-Math.round(this.viewRectangle.y) - Math.round(this.viewRectangle.height), 
            	Math.round(this.viewRectangle.width), 
            	Math.round(this.viewRectangle.height)
            );
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
	getViewUnderCoordinate: function(x, y) {
		if(this.viewRectangle.contains(x, y)) {
			if(this.childrenViews) {
				var subView;
				for (var i = 0; i < 2; i++) {
					subView = this.childrenViews[i].getViewUnderCoordinate(x, y);
					if(subView) return subView;
				};
			} else {
				return this;
			}
		}
	},
    onResize: function(width, height) {
        this.camera.aspect = this.viewRectangle.width/this.viewRectangle.height;
		if(this.childrenViews) {
			for (var i = 0; i < 2; i++) {
				this.childrenViews[i].onResize(width, height);
			}
		} else {
			console.log(this.camera.aspect);
	        this.camera.updateProjectionMatrix();
		}
    },
    zoom: function(factor) {
    	this.camera.fov *= factor;
    	this.camera.fov = Math.min(this.cameraFOVMax, Math.max(this.cameraFOVMin, this.camera.fov));
		this.fovCompensater = this.camera.fov / this.defaultFOV;
		this.camera.updateProjectionMatrix();
    },
    autoPan: function(mouse) {
    	var rel = this.viewRectangle.getRelative(mouse);
		this.camera.rotateX(-rel.y * this.rotateSpeed * this.fovCompensater);
		this.camera.rotateY(-rel.x * this.rotateSpeed * this.fovCompensater);
    }
});
module.exports = SplittingSubView;
