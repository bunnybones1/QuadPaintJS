define([
	'Class',
	'brush/StrokeGeom',
	'brush/StrokeBalls',
	'signals',
	'Utils',
	'BlendUtils',
	'Global'
], function(
	Class,
	BrushStrokeGeom,
	BrushStrokeBalls,
	signals,
	Utils,
	BlendUtils,
	Global
) {
	var PaintBrush = new Class({
		viewUI: null,
		color: null,
		size: 1,
		onCreateBrushStrokeSignal: null,
		onFinalizeBrushStrokeSignal: null,
		worldMouse: null,
		lastWorldMouse: null,
		projector: null,
		x: 0,
		y: 0,
		angleLength: 1,
		fadeByTilt: 1,
		blendModeIndex: 0,
		blendModeCurated: 0,
		initialize:function(viewUI, gl) {
			console.log("Initializing PaintBrush");
			this.animate = this.animate.bind(this);
			this.updateWorldMouse = this.updateWorldMouse.bind(this);
			this.viewUI = viewUI;
			this.gl = gl;
			this.color = {
				r:1,
				g:0.5,
				b:1,
				a:1.0,
				pickup: 0.015,
				wave: 0.00,
				shiver: 0.00
			};
			this.color.pickerBuffer = new Uint8Array(4);
			this.onPenDown = this.onPenDown.bind(this);
			this.onPenDrag = this.onPenDrag.bind(this);
			this.onPenMove = this.onPenMove.bind(this);
			this.newBrushStroke = this.newBrushStroke.bind(this);
			this.createStrokeFromLoaded = this.createStrokeFromLoaded.bind(this);
			this.createStrokesForEmptyScene = this.createStrokesForEmptyScene.bind(this);
			this.onPenUp = this.onPenUp.bind(this);
			this.onPenPressureChange = this.onPenPressureChange.bind(this);
			this.onPenTiltChange = this.onPenTiltChange.bind(this);
			this.onCreateBrushStrokeSignal = new signals.Signal();
			this.onFinalizeBrushStrokeSignal = new signals.Signal();

			Utils.activate(this, "blendModeIndex");

			this.blendModeIndexChangedSignal.add(
				function(val) {
					this.blendModeCurated = val;
					if(this.brushStroke) {
						this.brushStroke.blendModeCurated = val;
						BlendUtils.jumpCurated(this.brushStroke.material, val);
					}
				}.bind(this)
			);
		},
		createStrokesForEmptyScene: function() {
			this.createRingStroke(10, 0.05, 0x000000, 0x444444);
			this.createRingStroke(0.05, 0.005, 0x444444, 0x666666);
			this.createRingStroke(0.005, 0.0005, 0x666666, 0x888888);
			this.createRingStroke(0.0005, 0.00005, 0x888888, 0xaaaaaa);
			this.createRingStroke(0.00005, 0, 0xaaaaaa, 0xcccccc);
			this.createRingStroke(0, -0.00005, 0xaaaaaa, 0x777777);
			this.createRingStroke(-0.00005, -0.0005, 0x777777, 0x555555);
			this.createRingStroke(-0.0005, -0.005, 0x555555, 0x444444);
			this.createRingStroke(-0.005, -0.05, 0x444444, 0x333333);
			this.createRingStroke(-0.05, -10, 0x333333, 0x000000);
		},
		createRingStroke: function(startY, stopY, startColor, stopColor) {
			this.brushStroke = new BrushStrokeGeom(this);
			this.brushStroke.blendModeCurated = this.blendModeCurated;
			BlendUtils.jumpCurated(this.brushStroke.material, this.blendModeCurated);
			this.onCreateBrushStrokeSignal.dispatch(this.brushStroke);
			var worldPoint = new THREE.Vector3();
			startColor = new THREE.Color(startColor);
			stopColor = new THREE.Color(stopColor);
			var fudgeAngle = Math.PI * 2 * 1 / 64;
			for (var i = 0; i <= 65; i++) {
				var even = (i%2) === 0;
				var angle = (i/64) * Math.PI * 2 - (even ? fudgeAngle : 0);
				worldPoint.set(
					Math.sin(angle),
					even ? startY : stopY,
					Math.cos(angle)
				).normalize()
				.multiplyScalar(400);
				var color = even ? startColor : stopColor;
				this.color.r = color.r;
				this.color.g = color.g;
				this.color.b = color.b;
				this.brushStroke.addExplicitWorldPoint(worldPoint);
			}
			this.brushStroke.finalize();
			this.onFinalizeBrushStrokeSignal.dispatch(this.brushStroke);
			// this.newBrushStroke();
		},
		onPenDown: function(x, y) {
			this.updateWorldMouse(x, y);
			if(!this.brushStroke) this.newBrushStroke();
		},
		newBrushStroke: function() {
			this.brushStroke = new BrushStrokeGeom(this);
			this.brushStroke.attemptToAdd(this.worldBrushPosition, 0);
			this.brushStroke.blendModeCurated = this.blendModeCurated;
			BlendUtils.jumpCurated(this.brushStroke.material, this.blendModeCurated);
			this.onCreateBrushStrokeSignal.dispatch(this.brushStroke);
			this.brushStroke.onStrokeFullSignal.add(this.onStrokeFull);
		},
		onStrokeFull: function(stroke) {
			stroke.onStrokeFullSignal.remove(this.onStrokeFull);
			stroke.finalize();
			this.onFinalizeBrushStrokeSignal.dispatch(stroke);
			this.newBrushStroke();
		},
		onPenUp: function(x, y) {
			this.updateWorldMouse(x, y);
			if(this.brushStroke) {
				if(this.brushStroke.totalTriangles > 0) {
					this.brushStroke.finalize();
					this.onFinalizeBrushStrokeSignal.dispatch(this.brushStroke);
				}
				if(this.brushStroke.totalTriangles !== 21845) {
					if(this.lastBrushStroke && this.lastBrushStroke.blendModeCurated === this.brushStroke.blendModeCurated) {
						this.lastBrushStroke.integrateStroke(this.brushStroke);
						var mesh = this.brushStroke.display;
						if(mesh.parent) mesh.parent.remove(mesh);
						mesh.geometry.dispose();
					} else {
						this.lastBrushStroke = this.brushStroke;
					}
				}
				this.brushStroke = null;
			}
		},
		onPenDrag: function(x, y) {
			this.updateWorldMouse(x, y);
			this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize, this.angle);
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		onPenMove: function(x, y) {
			this.updateWorldMouse(x, y);
			// this.brushStroke.attemptToAdd(this.worldBrushPosition, this.angleLength * this.size, this.angle);
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		onPenPressureChange: function(pressure) {
			if(!this.viewUI.viewUnderPen) return;
			this.overallSize = pressure * this.angleLength * this.size;
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		onPenTiltChange: function(tiltX, tiltY) {
			if(!this.viewUI.viewUnderPen) return;
			var x = Math.sin(tiltX * Math.PI * 0.5);
			var y = Math.sin(tiltY * Math.PI * 0.5);
			this.angle = Math.atan2(y, x) + Math.PI * 0.5;
			this.angleLength = Math.sqrt(x*x + y*y);
			this.fadeByTilt = 1 - this.angleLength * 0.5;
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		animate: function() {
			this.updateWorldMouse(this.x, this.y);
			if(this.brushStroke) {
				if(this.worldBrushPosition) this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize, this.angle);
			}
			this.updatePicker();
		},
		requestFullPickUp: function() {
			this.fullPickUp = true;
		},
		updatePicker: function() {
			var color = this.color;
			var dpr = window.devicePixelRatio;
			var gl = this.gl;
			var pickup = this.fullPickUp ? 1 : color.pickup;
			if(this.overallSize > 0 || this.fullPickUp) {
				gl.readPixels(this.x * dpr, gl.drawingBufferHeight - this.y * dpr, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color.pickerBuffer);
				color.r -= (color.r - color.pickerBuffer[0]/255) * pickup;
				color.g -= (color.g - color.pickerBuffer[1]/255) * pickup;
				color.b -= (color.b - color.pickerBuffer[2]/255) * pickup;
			}
			this.fullPickUp = false;
		},
		updateWorldMouse: function(x, y) {
			this.x = x;
			this.y = y;
			if(!this.viewUI.viewUnderPen) return;
			var bounds = this.viewUI.viewUnderPen.viewRectangle;
			var screenMouse = new THREE.Vector3();
			screenMouse.x = ((x - bounds.x) / bounds.width) * 2 - 1;
			screenMouse.y = -(((y - bounds.y) / bounds.height) * 2 - 1);
			screenMouse.z = 0.5;

			this.worldMouse = screenMouse.clone();
			this.worldMouse.unproject(this.viewUI.viewUnderPen.camera);

			if(!this.lastWorldMouse) {
				this.lastWorldMouse = this.worldMouse.clone();
			} 

			this.worldBrushPosition = this.worldMouse.clone();
			this.worldBrushPosition.x *= 100;
			this.worldBrushPosition.y *= 100;
			this.worldBrushPosition.z *= 100;


			this.lastWorldMouse = this.worldMouse;
			if(this.brushStroke) this.brushStroke.updateZoomScale(this.viewUI.viewUnderPen.fovCompensater);
		},
		createStrokeFromLoaded: function(data) {
			if(!data || !data.buffers || !data.buffers.position || !data.buffers.rgba || !data.buffers.custom || data.buffers.totalTriangles === 0) {
				console.log('bad stroke');
				return;
			}
			if(this.lastBrushStroke && this.lastBrushStroke.blendModeCurated === Number(data.buffers.blendModeCurated)) {
				this.lastBrushStroke.integrateData(data);
			}
			if(data.buffers.position.length > 0) {
				var brushStroke = new BrushStrokeGeom(this, data);
				brushStroke.blendModeCurated = Number(data.buffers.blendModeCurated);
				BlendUtils.jumpCurated(brushStroke.material, brushStroke.blendModeCurated);
				this.onCreateBrushStrokeSignal.dispatch(brushStroke);
				this.lastBrushStroke = brushStroke;
			} else {
				console.log('NO GOOD!');
			}
		}
	});
	return PaintBrush;
});