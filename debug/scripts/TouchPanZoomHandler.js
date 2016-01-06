define([
	'three'
],
function(
	THREE
) {
	var forwardVector = new THREE.Vector3(0, 0, -1);
	var quat1 = new THREE.Quaternion();
	var euler = new THREE.Euler();
	var localRecenterRotationQuat = new THREE.Quaternion();
	var localRecenterRotationEuler = new THREE.Euler();
	function TouchPanZoomHandler(splittingViewUI) {
		this.touches = 2;
		this.name = 'panZoom';
		this.splittingViewUI = splittingViewUI;
		this.splittingView = splittingViewUI.splittingView;
		this.averagePoint = new THREE.Vector2();
		this.averageRay = new THREE.Vector3();
		this.onStart = this.onStart.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onEnd = this.onEnd.bind(this);
		this.onZoom = this.onZoom.bind(this);
	}

	TouchPanZoomHandler.prototype.onStart = function(touches) {
		console.log('panZoom start', touches.length);
	}

	TouchPanZoomHandler.prototype.onMove = function(touches) {
		var camera = this.splittingView.camera;
		var x1 = touches[0].clientX;
		var y1 = touches[0].clientY;
		var x2 = touches[1].clientX;
		var y2 = touches[1].clientY;
		var viewRectangle = this.splittingView.viewRectangle;
		var averageRay = this.averageRay;
		var averagePoint = this.averagePoint;
		averagePoint.x = (x1 + x2) * 0.5;
		averagePoint.y = viewRectangle.height - (y1 + y2) * 0.5;
		averageRay.x = averagePoint.x / viewRectangle.width * 2 - 1;
		averageRay.y = averagePoint.y / viewRectangle.height * 2 - 1;
		averageRay.z = 0.5;
		var touchGapWidth = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
		var touchAngle = -Math.atan2(y2 - y1, x2 - x1);
		averageRay.unproject(camera);
		camera.worldToLocal(averageRay);
		averageRay.normalize();
		if(camera.lastAverageRay) {
			var roll = camera.lastTouchAngle - touchAngle;
			var zoom = camera.lastTouchGapWidth / touchGapWidth;
			quat1.setFromUnitVectors(averageRay, camera.lastAverageRay);
			euler.setFromQuaternion(quat1);
			// camera.quaternion.copy(quat1.multiply(camera.quaternion));
			camera.rotateX(euler.x);
			camera.rotateY(euler.y);

			// forwardVector.normalize();
			localRecenterRotationQuat.setFromUnitVectors(forwardVector, averageRay);
			localRecenterRotationEuler.setFromQuaternion(localRecenterRotationQuat);
			// localRecenterRotationEuler.y *= 1.5;
			// localRecenterRotationEuler.x *= 2;
			camera.rotateX(localRecenterRotationEuler.x);
			camera.rotateY(localRecenterRotationEuler.y);
			camera.rotateZ(roll);
			// this.stop = true;
			camera.rotateY(-localRecenterRotationEuler.y);
			camera.rotateX(-localRecenterRotationEuler.x);

			this.onZoom(zoom);
		}

		if(!camera.lastAverageRay) {
			camera.lastAverageRay = averageRay.clone();
		} else {
			camera.lastAverageRay.copy(averageRay);
		}
		camera.lastTouchAngle = touchAngle;
		camera.lastTouchGapWidth = touchGapWidth;
	}

	TouchPanZoomHandler.prototype.onEnd = function(touches) {
		var camera = this.splittingView.camera;
		delete camera.lastAverageRay;
		delete camera.lastTouchAngle;
	}

	TouchPanZoomHandler.prototype.onZoom = function(zoomScale) {
		if(this.splittingViewUI.viewUnderPen) this.splittingViewUI.viewUnderPen.zoom(zoomScale);
	}

	return TouchPanZoomHandler;
});