var Class = require('./class/Class');
var Global = require('./Global');

var SplittingViewUI = new Class({
	splittingView: null,
	projector: null,
	mouse: null,
	viewUnderMouse: null,
	initialize:function(splittingViewBase, canvas) {
		this.splittingView = splittingViewBase;
		this.canvas = canvas;
		this.projector = new THREE.Projector();
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.update = this.update.bind(this);
        $(this.canvas).on('mousedown', this.onMouseDown);
        $(this.canvas).on('mouseup', this.onMouseUp);
        $(this.canvas).on('mousemove', this.onMouseMove);
        $(this.canvas).on('mousewheel', this.onMouseWheel);
        this.testPositionSignal = new signals.Signal();
        this.mouse = {x:0, y:0};
	},
	onMouseDown:function(event) {
		this.isMouseDown = true;
		this.mouse.x = event.offsetX;
		this.mouse.y = event.offsetY;
		this.update();
	},
	onMouseMove:function(event) {
		this.mouse.x = event.offsetX;
		this.mouse.y = event.offsetY;
		this.viewUnderMouse = this.splittingView.getViewUnderCoordinate(this.mouse.x, this.mouse.y);
	},
	onMouseUp:function(event) {
		this.isMouseDown = false;
	},
	onMouseWheel:function(event) {
		this.mouse.x = event.offsetX;
		this.mouse.y = event.offsetY;
		var zoomScale = 1 + event.originalEvent.deltaY * .001;
		this.viewUnderMouse.zoom(zoomScale);
	},
	update:function() {
		if(!this.viewUnderMouse) return;
		this.viewUnderMouse.autoPan(this.mouse);
		if(this.isMouseDown) {
			//clickedView.camera.rotation.set(0, 0, 0);
			var bounds = this.viewUnderMouse.viewRectangle;
			var mouse3D = new THREE.Vector3();
			mouse3D.x = ((this.mouse.x - bounds.x) / bounds.width) * 2 - 1;
			mouse3D.y = -(((this.mouse.y - bounds.y) / bounds.height) * 2 - 1);
			mouse3D.z = .5;

			this.projector.unprojectVector(mouse3D, this.viewUnderMouse.camera);

			mouse3D.x *= 100;
			mouse3D.y *= 100;
			mouse3D.z *= 100;

			//var ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
			//var intersects = ray.intersectObject(plane);
			this.testPositionSignal.dispatch(mouse3D, this.viewUnderMouse.fovCompensater);
		}
	},
    onResize:function(width, height) {
    }
});
module.exports = SplittingViewUI;
