var Class = require('./class/Class');
var Global = require('./Global');

var SplittingViewUI = new Class({
	splittingView: null,
	projector: null,
	pen: null,
	viewUnderPen: null,
	initialize:function(splittingViewBase, canvas) {
		this.splittingView = splittingViewBase;
		this.canvas = canvas;
		this.projector = new THREE.Projector();
		this.onPenDown = this.onPenDown.bind(this);
		this.onPenUp = this.onPenUp.bind(this);
		this.onPenMove = this.onPenMove.bind(this);
		this.onPenDrag = this.onPenDrag.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.update = this.update.bind(this);
        this.testPositionSignal = new signals.Signal();
        this.pen = {x:0, y:0, pressure: 0};
	},
	onPenDown:function(x, y) {
		this.pen.x = x;
		this.pen.y = y;
		this.update();
	},
	onPenDrag:function(x, y, pressure) {
		this.isPenDown = true;
		this.pen.pressure = pressure;
			console.log(this.pen.pressure);
		this.updatePenAndView(x, y);
	},
	onPenMove:function(x, y) {
		this.updatePenAndView(x, y);
	},
	onPenUp:function(x, y) {
		this.pen.pressure = 0;
		this.isPenDown = false;
	},
	onMouseWheel:function(delta) {
		var zoomScale = 1 + delta * .001;
		this.viewUnderPen.zoom(zoomScale);
	},
	updatePenAndView:function(x, y) {
		if(this.pen.x != x && this.pen.y != y) {
			this.viewUnderPen = this.splittingView.getViewUnderCoordinate(x, y);
			this.pen.x = x;
			this.pen.y = y;
		}
	},
	update:function() {
		if(!this.viewUnderPen) return;
		this.viewUnderPen.autoPan(this.pen);
		if(this.isPenDown) {
			//clickedView.camera.rotation.set(0, 0, 0);
			var bounds = this.viewUnderPen.viewRectangle;
			var mouse3D = new THREE.Vector3();
			mouse3D.x = ((this.pen.x - bounds.x) / bounds.width) * 2 - 1;
			mouse3D.y = -(((this.pen.y - bounds.y) / bounds.height) * 2 - 1);
			mouse3D.z = .5;

			this.projector.unprojectVector(mouse3D, this.viewUnderPen.camera);

			mouse3D.x *= 100;
			mouse3D.y *= 100;
			mouse3D.z *= 100;

			//var ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
			//var intersects = ray.intersectObject(plane);
			this.testPositionSignal.dispatch(mouse3D, this.viewUnderPen.fovCompensater * this.pen.pressure);
		}
	},
    onResize:function(width, height) {
    }
});
module.exports = SplittingViewUI;
