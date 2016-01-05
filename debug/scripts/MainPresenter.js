define([
	"Class",
	"three",
	"jquery",
	"view/DisplayManager",
	"signals",
	"Global",
	"stats",
	"_",
	"TestFactory",
	"userInput/Manager",
	"view/TouchPanZoomController",
	"db/Manager",
	"brush/PaintBrush",
	"Utils",
	"BlendUtils",
	"GUIManager",
	'RendererStats',
	'screenfull',
	'hooker'
], function(
	Class,
	three,
	jquery,
	DisplayManager,
	signals,
	Global,
	Stats,
	_,
	TestFactory,
	UserInputManager,
	TouchPanZoomController,
	DBManager,
	PaintBrush,
	Utils,
	BlendUtils,
	GUIManager,
	RendererStats,
	screenfull,
	hooker
) {
	var MainPresenter = new Class({
		displayManager: null,
		inputManager: null,
		guiManager: null,
		scene: null,
		renderer: null,
		paintBrush: null,
		brushStrokes: null,
		strokes: null,
		skipFrames: 0,
		skipFrameCounter: 0,
		autoTiltCamera: true,
		initialize: function () {
			console.log("Hello World!");
			this.addStrokeToScene = this.addStrokeToScene.bind(this);
			this.canvas = document.getElementById('threejsCanvas');
			this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, canvas:this.canvas, preserveDrawingBuffer: true});
			this.renderer.sortObjects = false;
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.autoClear = false;
			this.scene = new THREE.Scene();
			this.displayManager = new DisplayManager(this.scene, this.renderer, this.canvas);
			this.guiManager = new GUIManager(this.renderer);
			this.dbManager = new DBManager();
			this.userInputManager = new UserInputManager(this.canvas);
			this.touchPanZoomController = new TouchPanZoomController(this.userInputManager.touch, this.displayManager.splittingView);
			var _this = this;
			this.paintBrush = new PaintBrush(this.displayManager.splittingViewUI, this.renderer.context);
			this.paintBrush.onCreateBrushStrokeSignal.add(this.addStrokeToScene);
			this.brushStrokes = [];

			//resizing
			this.onResize = this.onResize.bind(this);
			Global.onResizeSignal.add(this.onResize);

			//hooks
			//view and display controls
			this.userInputManager.tablet.onPenDownSignal.add(this.displayManager.splittingViewUI.onPenDown);
			this.userInputManager.tablet.onPenUpSignal.add(this.displayManager.splittingViewUI.onPenUp);
			this.userInputManager.mouse.onMouseMoveSignal.add(this.displayManager.splittingViewUI.onPenMove);
			this.userInputManager.tablet.onPenDragSignal.add(this.displayManager.splittingViewUI.onPenDrag);
			this.userInputManager.mouse.onMouseWheelSignal.add(this.displayManager.splittingViewUI.onMouseWheel);

			this.touchPanZoomController.drawStartHandler = function(touches) {
				console.log('external draw start', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenDown(x, y);
				_this.userInputManager.tablet.penDown(x, y);
			}

			this.touchPanZoomController.drawMoveHandler = function(touches) {
				console.log('external draw move', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenDrag(x, y, 1);
				_this.userInputManager.tablet.penDrag(x, y);
			}

			this.touchPanZoomController.drawEndHandler = function(touches) {
				console.log('external draw end', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenUp(x, y);
				_this.userInputManager.tablet.penUp(x, y);
			}

			this.touchPanZoomController.zoomHandler = function(zoomScale) {
				if(_this.displayManager.splittingViewUI.viewUnderPen) _this.displayManager.splittingViewUI.viewUnderPen.zoom(zoomScale);
			}

			var hookParams = {
				once: true, 
				pre: function() {
					console.log('touch detected');
					_this.autoTiltCamera = false;
					_this.displayManager.splittingViewUI.autoPan = false;
					_this.paintBrush.size = 0.1;
				}
			};
			hooker.hook(this.touchPanZoomController, 'panZoomStartHandler', hookParams);
			hooker.hook(this.touchPanZoomController, 'drawStartHandler', hookParams);

			hooker.hook(this.touchPanZoomController, 'panZoomStartHandler', {
				once: true,
				pre: function(touches) {
					var x = touches[0].clientX;
					var y = touches[0].clientY;
					_this.displayManager.splittingViewUI.viewUnderPen = _this.displayManager.splittingViewUI.splittingView.getViewUnderCoordinate(x, y);
				}
			});


			//keyboard and faders
			this.createFader(Global.brightnessUniform, "value", 88, 90, 0xffffff, 0.001, 1.01);
			this.createFader(this.paintBrush, "size", 81, 65, 0x7f7f7f, 0.0002, 1.1, false, false, true);
			this.createFader(this.paintBrush.color, "r", 81, 65, 0xff0000);
			this.createFader(this.paintBrush.color, "g", 87, 83, 0x00ff00);
			this.createFader(this.paintBrush.color, "b", 69, 68, 0x0000ff);
			this.createFader(this.paintBrush.color, "a", 82, 70, 0xffffff);
			this.createFader(this.paintBrush.color, "pickup", 84, 71, 0x7f7f7f, 0.0001, 1.1);
			this.createStepper(this.paintBrush, "blendModeIndex", 89, 72, 0xff7f0f, BlendUtils.totalCurated);
			this.createFader(this.paintBrush.color, "wave", 87, 83, 0x7f7f7f, 0.0002, 1.1, false, false, true);
			this.createFader(this.paintBrush.color, "shiver", 69, 68, 0x7f7f7f, 0.0002, 1.1, false, false, true);
			this.createFader(this.displayManager.splittingViewUI, "autoZoom", 81, 65, 0xafafaf, 0.0001, 1.1, true, false, false);

			this.userInputManager.hotKeys.addCallback(this.dbManager.promptSave, 83, true);
			this.userInputManager.hotKeys.addCallback(this.dbManager.promptLoad, 76, true);

			//brush
			this.userInputManager.tablet.onPenDownSignal.add(this.paintBrush.onPenDown);
			this.userInputManager.tablet.onPenUpSignal.add(this.paintBrush.onPenUp);
			this.userInputManager.tablet.onPenDragSignal.add(this.paintBrush.onPenDrag);
			this.userInputManager.tablet.onPenMoveSignal.add(this.paintBrush.onPenMove);
			this.userInputManager.tablet.onPenPressureChangeSignal.add(this.paintBrush.onPenPressureChange);
			this.userInputManager.tablet.onPenTiltChangeSignal.add(this.paintBrush.onPenTiltChange);
			this.paintBrush.onCreateBrushStrokeSignal.add(
				function(brushStroke) {
					this.brushStrokes.push(brushStroke);
					this.scene.add(brushStroke.display);
				}.bind(this)
			);
			//Global.onMouseMoveSignal.add(this.inputManager.onMouseMove.bind(this.inputManager));

			if(Global.urlParams.debug) {
				//stats
				this.stats = new Stats();
				$(document.body).append( this.stats.domElement );
				this.rendererStats = new THREEx.RendererStats();
				this.rendererStats.domElement.style.position = 'absolute';
				this.rendererStats.domElement.style.left = '0px';
				this.rendererStats.domElement.style.bottom   = '0px';
				document.body.appendChild( this.rendererStats.domElement );
			}

			//tests
			this.strokes = [];

			this.helper1 = new THREE.Object3D();
			this.scene.add(this.helper1);
			this.helper2 = new THREE.Object3D();
			this.scene.add(this.helper2);

			//start the engine!
			Global.onResize();
			this.animate = this.animate.bind(this);
			this.animate();

			this.saveStroke = this.saveStroke.bind(this);
			this.dbManager.begin();
			this.dbManager.onStrokeLoadedSignal.add(this.paintBrush.createStrokeFromLoaded);
			this.dbManager.onEmptySceneSignal.add(this.paintBrush.createStrokesForEmptyScene);
			this.paintBrush.onFinalizeBrushStrokeSignal.add(this.saveStroke);

			var canvas = this.canvas;
			var paintBrush = this.paintBrush;
			var displayManager = this.displayManager;
			window.addEventListener("keypress", function(event) {
				console.log(event.charCode, event.keyCode, event.ctrlKey, String.fromCharCode(event.keyCode));
				switch(event.charCode) {
					case 102:
						screenfull.request(canvas);
						window.document.body.style.cursor = 'none';
						break;
					case 122:
						if(event.ctrlKey) displayManager.splittingViewUI.autoZoom = 0.5;
						break;
					case 26:
						displayManager.splittingViewUI.autoZoom = 0.5;
						break;
					case 32:
						paintBrush.requestFullPickUp();
						event.preventDefault();
						break;
				}
			}, false);

		},
		saveStroke: function(data) {
			if(data.totalTriangles !== 21845) this.dbManager.saveStroke(data);
		},
		createFader: function(object, valueKey, keyIncrement, keyDecrement, uiColor, stepSize, stepScale, ctrlKey, altKey, shiftKey, metaKey) {
			var faderObj = this.userInputManager.faders.addValue(object, valueKey, keyIncrement, keyDecrement, stepSize, stepScale, ctrlKey, altKey, shiftKey, metaKey);
			this.guiManager.addFader(faderObj, uiColor);
		},
		createStepper: function(object, valueKey, keyIncrement, keyDecrement, uiColor, total, ctrlKey, altKey, shiftKey, metaKey) {
			var stepperObj = this.userInputManager.steppers.addValue(object, valueKey, keyIncrement, keyDecrement, total, ctrlKey, altKey, shiftKey, metaKey);
			this.guiManager.addStepper(stepperObj, uiColor);
		},
		animate: function() {
			Global.now = (Date.now()*0.001 - Global.startTime);
			Global.timeUniform.value = Global.now;
			requestAnimationFrame(this.animate);
			if(this.skipFrames > this.skipFrameCounter) {
				this.skipFrameCounter++;
				return;
			}else{
				this.skipFrameCounter = 0;
			}
			this.userInputManager.update();
			this.displayManager.splittingViewUI.animate();
			if(this.autoTiltCamera) {
				var helper1 = this.helper1;
				var helper2 = this.helper2;
				var camera = this.displayManager.camera;
				helper1.position.copy(camera.position);
				helper1.rotation.copy(camera.rotation);
				helper1.translateZ(1);
				helper2.lookAt(helper1.position);
				camera.quaternion.slerp(helper2.quaternion, 0.03 * (1-Math.abs(helper1.position.y)));
			}
			this.render();
			if(this.rendererStats) this.rendererStats.update(this.renderer);
            this.paintBrush.animate();
            this.guiManager.render();
			if(this.stats) this.stats.update();
		},
		
		addStrokeToScene: function(stroke){
			this.strokes.push(stroke);
			this.scene.add(stroke.display);
		},

		render:function() {
			this.renderer.clear();
			this.displayManager.render();
		},
		onResize:function(width, height) {
			this.renderer.setSize(width, height);
			this.displayManager.onResize(width, height);
			this.guiManager.onResize(width, height);
		}
	});
	return MainPresenter;
});