define([
	'Class',
	'Global'
], function(
	Class,
	Global
){
	var TouchPanZoomController = new Class({
		startDurationTolerance: 100,
		identifiersStarting: [],
		functionalTouchGroups: [],
		initialize: function(inputTouch, splittingView) {
			console.log("Initializing TouchPanZoomController");

			this.splittingView = splittingView;

			this.averagePoint = new THREE.Vector2();
			this.averageRay = new THREE.Vector3();

			this.startCutoffPeriod = this.startCutoffPeriod.bind(this);
			this.startingTouches = [];
			for (var i = 0; i < this.startingTouches.length; i++) {
				this.startingTouches[i] = undefined;
			};

			this.drawMoveHandler = this.drawMoveHandler.bind(this);
			this.drawEndHandler = this.drawEndHandler.bind(this);
			this.panZoomMoveHandler = this.panZoomMoveHandler.bind(this);
			this.panZoomEndHandler = this.panZoomEndHandler.bind(this);
			this.magicMoveHandler = this.magicMoveHandler.bind(this);
			this.magicEndHandler = this.magicEndHandler.bind(this);

			inputTouch.onTouchStartSignal.add(this.touchStartHandler.bind(this));
			inputTouch.onTouchMoveSignal.add(this.touchMoveHandler.bind(this));
			inputTouch.onTouchEndSignal.add(this.touchEndHandler.bind(this));
		},

		touchStartHandler: function(event) {
			var _this = this;
			Array.prototype.forEach.call(event.changedTouches, function(touch){
				_this.touchHandler('start', event);
				_this.identifiersStarting.push(touch.identifier);
				_this.startingTouches[touch.identifier] = touch;
				if(_this.startTimeoutId === undefined) {
					_this.startTimeoutId = setTimeout(_this.startCutoffPeriod, _this.startDurationTolerance);
				}
			});
		},

		startCutoffPeriod: function() {
			delete this.startTimeoutId;
			console.log('gesture', this.identifiersStarting.length );
			var _this = this;
			var touches = this.startingTouches.filter(function(touch){
				if(touch && _this.identifiersStarting.indexOf(touch.identifier) !== -1) return touch;
			});
			if(this.identifiersStarting.length === 1) {
				this.drawStartHandler(touches);
				this.functionalTouchGroups.push({
					identifiers: this.identifiersStarting.slice(),
					onMove: this.drawMoveHandler,
					onEnd: this.drawEndHandler,
					name: 'draw'
				});
			} else if(this.identifiersStarting.length === 2) {
				this.panZoomStartHandler(touches);
				this.functionalTouchGroups.push({
					identifiers: this.identifiersStarting.slice(),
					onMove: this.panZoomMoveHandler,
					onEnd: this.panZoomEndHandler,
					name: 'panZoom'
				});
			} else if(this.identifiersStarting.length === 3) {
				this.magicStartHandler(touches);
				this.functionalTouchGroups.push({
					identifiers: this.identifiersStarting.slice(),
					onMove: this.magicMoveHandler,
					onEnd: this.magicEndHandler,
					name: 'magic'
				});
			}
			this.identifiersStarting.length = 0;
		},

		touchEndHandler: function(event) {
			this.touchHandler('end', event);
			var _this = this;
			Array.prototype.forEach.call(event.changedTouches, function(touch) {
				var index = _this.identifiersStarting.indexOf(touch.identifier);
				if(index !== -1) _this.identifiersStarting.splice(index, 1);
			});
			var groupToEndIndex = -1;
			this.functionalTouchGroups.forEach(function(group, i){
				Array.prototype.forEach.call(event.changedTouches, function(touch) {
					index = group.identifiers.indexOf(touch.identifier);
					if(index !== -1) {
						groupToEndIndex = i;
					}
				});
			});
			if(groupToEndIndex !== -1) {
				var group = this.functionalTouchGroups[groupToEndIndex];
				var implicatedChangedTouches = Array.prototype.filter.call(event.changedTouches, function(touch) {
					return group.identifiers.indexOf(touch.identifier) !== -1;
				});
				var implicatedTouches = Array.prototype.filter.call(event.touches, function(touch) {
					return group.identifiers.indexOf(touch.identifier) !== -1;
				});
				group.onEnd(implicatedTouches.concat(implicatedChangedTouches));

				this.functionalTouchGroups.splice(groupToEndIndex, 1);
			}
		},

		touchMoveHandler: function(event) {
			this.touchHandler('move', event);
			this.functionalTouchGroups.forEach(function(group) {
				group.onMove(Array.prototype.filter.call(event.touches, function(touch) {
					return (group.identifiers.indexOf(touch.identifier) !== -1);
				}));
			});
		},

		drawStartHandler: function(touches) {
			console.log('draw start', touches.length);
		},

		drawMoveHandler: function(touches) {
			console.log('draw', touches.length);
		},

		drawEndHandler: function(touches) {
			console.log('draw end', touches.length);
		},

		panZoomStartHandler: function(touches) {
			console.log('panZoom start', touches.length);
		},

		panZoomMoveHandler: function(touches) {
			if(this.stop) return;

			var camera = this.splittingView.camera;
			console.log('panZoom', touches.length);
			this.averagePoint.x = (touches[0].clientX + touches[1].clientX) * 0.5;
			this.averagePoint.y = this.splittingView.viewRectangle.height - (touches[0].clientY + touches[1].clientY) * 0.5;
			this.averageRay.x = this.averagePoint.x / this.splittingView.viewRectangle.width * 2 - 1;
			this.averageRay.y = this.averagePoint.y / this.splittingView.viewRectangle.height * 2 - 1;
			this.averageRay.z = 0.5;
			var touchGapWidth = Math.sqrt(Math.pow(touches[1].clientY - touches[0].clientY, 2) + Math.pow(touches[1].clientX - touches[0].clientX, 2));
			var touchAngle = -Math.atan2(touches[1].clientY - touches[0].clientY, touches[1].clientX - touches[0].clientX);
			this.averageRay.unproject(camera);
			camera.worldToLocal(this.averageRay);
			this.averageRay.normalize();
			if(camera.lastAverageRay) {
				var roll = camera.lastTouchAngle - touchAngle;
				var zoom = camera.lastTouchGapWidth / touchGapWidth;
				var quat1 = new THREE.Quaternion();
				quat1.setFromUnitVectors(this.averageRay, camera.lastAverageRay);
				var euler = new THREE.Euler();
				euler.setFromQuaternion(quat1);
				// camera.quaternion.copy(quat1.multiply(camera.quaternion));
				camera.rotateX(euler.x);
				camera.rotateY(euler.y);

				var forwardVector = new THREE.Vector3(0, 0, -1);
				// forwardVector.normalize();
				var localRecenterRotationQuat = new THREE.Quaternion();
				localRecenterRotationQuat.setFromUnitVectors(forwardVector, this.averageRay);
				var localRecenterRotationEuler = new THREE.Euler();
				localRecenterRotationEuler.setFromQuaternion(localRecenterRotationQuat);
				// localRecenterRotationEuler.y *= 1.5;
				// localRecenterRotationEuler.x *= 2;
				camera.rotateX(localRecenterRotationEuler.x);
				camera.rotateY(localRecenterRotationEuler.y);
				camera.rotateZ(roll);
				// this.stop = true;
				camera.rotateY(-localRecenterRotationEuler.y);
				camera.rotateX(-localRecenterRotationEuler.x);

				this.zoomHandler(zoom);
 			}

			if(!camera.lastAverageRay) {
				camera.lastAverageRay = this.averageRay.clone();
			} else {
				camera.lastAverageRay.copy(this.averageRay);
			}
			camera.lastTouchAngle = touchAngle;
			camera.lastTouchGapWidth = touchGapWidth;
		},

		panZoomEndHandler: function(touches) {
			console.log('panZoom end', touches.length);
			delete this.splittingView.camera.lastAverageRay;
			delete this.splittingView.camera.lastTouchAngle;
		},

		magicStartHandler: function(touches) {
			console.log('magic start', touches.length);
		},

		magicMoveHandler: function(touches) {
			console.log('magic', touches.length);
		},

		magicEndHandler: function(touches) {
			console.log('magic end', touches.length);
		},

		touchHandler: function(type, event) {
			event.preventDefault();
			Array.prototype.forEach.call(event.changedTouches, function(touch) {
				console.log(type, touch.identifier, touch.pageX, touch.pageY);
			});
		},
		
		zoomHandler: function(zoom) {
			console.log('zoom', zoom);
		}
	});
	return TouchPanZoomController;
});