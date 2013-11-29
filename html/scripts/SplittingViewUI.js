var Class = require('./class/Class');
var Global = require('./Global');

var SplittingViewUI = new Class({
	splittingView: null,
	projector: null,
	initialize:function(splittingViewBase, canvas) {
		this.splittingView = splittingViewBase;
		this.canvas = canvas;
		this.projector = new THREE.Projector();
		this.onClick = this.onClick.bind(this);
        $(this.canvas).on('click', this.onClick);
        this.testPositionSignal = new signals.Signal();
	},
	onClick:function(event) {
		var clickedView = this.splittingView.getViewUnderCoordinate(event.offsetX, event.offsetY);
		//clickedView.camera.rotation.set(0, 0, 0);
		var bounds = clickedView.viewRectangle;
		var mouse3D = new THREE.Vector3();
		mouse3D.x = ((event.clientX - bounds.x) / bounds.width) * 2 - 1;
		mouse3D.y = -(((event.clientY - bounds.y) / bounds.height) * 2 - 1);
		mouse3D.z = .5;

		this.projector.unprojectVector(mouse3D, clickedView.camera);

		mouse3D.x *= 100;
		mouse3D.y *= 100;
		mouse3D.z *= 100;
		console.log(mouse3D);

		//var ray = new THREE.Ray(camera.position, mouse3D.subSelf(camera.position).normalize());
		//var intersects = ray.intersectObject(plane);
		this.testPositionSignal.dispatch(mouse3D);
	},
    onResize:function(width, height) {
    }
});
module.exports = SplittingViewUI;
