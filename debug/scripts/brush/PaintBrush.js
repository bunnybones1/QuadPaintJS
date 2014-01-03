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
		size: 10,
		onCreateBrushStrokeSignal: null,
		onFinalizeBrushStrokeSignal: null,
		worldMouse: null,
		lastWorldMouse: null,
		projector: null,
		x: 0,
		y: 0,
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
				g:.5,
				b:1,
				a:.7,
				pickup: 0.05,
				wave: 0.05,
				shiver: 0.00
			}; 
			this.color.pickerBuffer = new Uint8Array(4);
			this.projector = new THREE.Projector();
			this.onPenDown = this.onPenDown.bind(this);
			this.onPenDrag = this.onPenDrag.bind(this);
			this.newBrushStroke = this.newBrushStroke.bind(this);
			this.createStrokeFromLoaded = this.createStrokeFromLoaded.bind(this);
			this.onPenUp = this.onPenUp.bind(this);
			this.onPenPressureChange = this.onPenPressureChange.bind(this);
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
		onPenDown: function(x, y) {
			this.updateWorldMouse(x, y);
			if(!this.brushStroke) this.newBrushStroke();
		},
		newBrushStroke: function() {
			this.brushStroke = new BrushStrokeGeom(this);
			this.brushStroke.attemptToAdd(this.worldBrushPosition, 0);
			this.brushStroke.blendModeCurated = this.blendModeCurated;
			BlendUtils.jumpCurated(this.brushStroke.material, this.blendModeCurated);
			this.onCreateBrushStrokeSignal.dispatch(this.brushStroke.display);
			this.brushStroke.onStrokeFullSignal.add(this.onStrokeFull);
		},
		onStrokeFull: function(stroke) {
			stroke.onStrokeFullSignal.remove(this.onStrokeFull);
			stroke.finalize(this.worldBrushPosition);
			this.onFinalizeBrushStrokeSignal.dispatch(stroke);
			this.newBrushStroke();
		},
		onPenUp: function(x, y) {
			this.updateWorldMouse(x, y);
			if(this.brushStroke) {
				this.brushStroke.finalize(this.worldBrushPosition);
				this.onFinalizeBrushStrokeSignal.dispatch(this.brushStroke);
				this.brushStroke = null;
			}
		},
		onPenDrag: function(x, y) {
			this.updateWorldMouse(x, y);
			this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize);
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		onPenPressureChange: function(pressure) {
			if(!this.viewUI.viewUnderPen) return;
			this.overallSize = pressure * this.size;
			//clickedView.camera.rotation.set(0, 0, 0);
		},
		animate: function() {
			this.updateWorldMouse(this.x, this.y);
			if(this.brushStroke) {
				if(this.worldBrushPosition) this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize);
			}
			this.updatePicker();
		},
		updatePicker: function() {
			if(this.overallSize > 0) {
				this.gl.readPixels(this.x, this.gl.drawingBufferHeight-this.y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.color.pickerBuffer);
				this.color.r -= (this.color.r - this.color.pickerBuffer[0]/255) * this.color.pickup;
				this.color.g -= (this.color.g - this.color.pickerBuffer[1]/255) * this.color.pickup;
				this.color.b -= (this.color.b - this.color.pickerBuffer[2]/255) * this.color.pickup;
			}
		},
		updateWorldMouse: function(x, y) {
			this.x = x;
			this.y = y;
			if(!this.viewUI.viewUnderPen) return;
			var bounds = this.viewUI.viewUnderPen.viewRectangle;
			var screenMouse = new THREE.Vector3();
			screenMouse.x = ((x - bounds.x) / bounds.width) * 2 - 1;
			screenMouse.y = -(((y - bounds.y) / bounds.height) * 2 - 1);
			screenMouse.z = .5;

			this.worldMouse = screenMouse.clone();
			this.projector.unprojectVector(this.worldMouse, this.viewUI.viewUnderPen.camera);

			if(!this.lastWorldMouse) {
				this.lastWorldMouse = this.worldMouse.clone();
			} 

			var lastScreenMouse = this.lastWorldMouse.clone();
			this.projector.projectVector(lastScreenMouse, this.viewUI.viewUnderPen.camera);


			this.worldBrushPosition = this.worldMouse.clone();
			this.worldBrushPosition.x *= 100;
			this.worldBrushPosition.y *= 100;
			this.worldBrushPosition.z *= 100;


			this.lastWorldMouse = this.worldMouse;
			if(this.brushStroke) this.brushStroke.updateZoomScale(this.viewUI.viewUnderPen.fovCompensater);
		},
		createStrokeFromLoaded:function(data) {
			if(!data || !data.buffers || !data.buffers.position || !data.buffers.rgba || !data.buffers.custom || !(data.buffers.totalTriangles > 0)) return;
			var brushStroke = new BrushStrokeGeom(this, data);
			brushStroke.blendModeCurated = Number(data.buffers.blendModeCurated);
			BlendUtils.jumpCurated(brushStroke.material, brushStroke.blendModeCurated);
			this.onCreateBrushStrokeSignal.dispatch(brushStroke.display);
		}
	});
	return PaintBrush;
});