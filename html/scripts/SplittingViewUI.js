var Class = require('./class/Class');
var Global = require('./Global');

var SplittingViewUI = new Class({
	splittingView: null,
	projector: null,
	pen: null,
	viewUnderPen: null,
	spacingThreshold: .1,
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
			var screenMouse = new THREE.Vector3();
			screenMouse.x = ((this.pen.x - bounds.x) / bounds.width) * 2 - 1;
			screenMouse.y = -(((this.pen.y - bounds.y) / bounds.height) * 2 - 1);
			screenMouse.z = .5;

			var worldMouse = screenMouse.clone();
			this.projector.unprojectVector(worldMouse, this.viewUnderPen.camera);

			if(!this.lastWorldMouse) {
				this.lastWorldMouse = worldMouse.clone();
			} 

			var lastScreenMouse = this.lastWorldMouse.clone();
			this.projector.projectVector(lastScreenMouse, this.viewUnderPen.camera);



			var length = Math.sqrt(Math.pow(screenMouse.x - lastScreenMouse.x, 2) + Math.pow(screenMouse.y - lastScreenMouse.y, 2));
			if (length > this.spacingThreshold) {
				var targetPosition = worldMouse.clone();

				targetPosition.x *= 100;
				targetPosition.y *= 100;
				targetPosition.z *= 100;

				//var ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
				//var intersects = ray.intersectObject(plane);
				this.testPositionSignal.dispatch(targetPosition, this.viewUnderPen.fovCompensater * this.pen.pressure);
				this.lastWorldMouse = worldMouse;
			}

		}
	},
    onResize:function(width, height) {
    }
});
module.exports = SplittingViewUI;
