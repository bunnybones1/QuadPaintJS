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
	"db/Manager",
	"brush/PaintBrush",
	"Utils",
	"BlendUtils",
	"GUIManager",
	'RendererStats'
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
	DBManager,
	PaintBrush,
	Utils,
	BlendUtils,
	GUIManager,
	RendererStats
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
		skipFrames:0,
		skipFrameCounter:0,
		initialize: function () {
			console.log("Hello World!");
			this.addStrokeToScene = this.addStrokeToScene.bind(this);
			this.canvas = document.getElementById('threejsCanvas');
			this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, canvas:this.canvas, preserveDrawingBuffer: true});
			this.renderer.autoClear = false;
			this.scene = new THREE.Scene();
			this.displayManager = new DisplayManager(this.scene, this.renderer, this.canvas);
			this.guiManager = new GUIManager(this.renderer);
			this.dbManager = new DBManager();
			this.userInputManager = new UserInputManager(this.canvas);
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

			//keyboard and faders
			this.createFader(this.paintBrush.color, "r", 81, 65, 0xff0000);
			this.createFader(this.paintBrush.color, "g", 87, 83, 0x00ff00);
			this.createFader(this.paintBrush.color, "b", 69, 68, 0x0000ff);
			this.createFader(this.paintBrush.color, "a", 82, 70, 0xffffff);
			this.createFader(this.paintBrush.color, "pickup", 84, 71, 0x7f7f7f, .0001, 1.1);
			this.createStepper(this.paintBrush, "blendModeIndex", 89, 72, 0xff7f0f, BlendUtils.totalCurated);
			this.createFader(this.paintBrush.color, "wave", 85, 74, 0x7f7f7f, .0002, 1.1);
			this.createFader(this.paintBrush.color, "shiver", 73, 75, 0x7f7f7f, .0002, 1.1);

			this.userInputManager.hotKeys.addCallback(this.dbManager.promptSave, 83, true);
			this.userInputManager.hotKeys.addCallback(this.dbManager.promptLoad, 76, true);

			//brush
			this.userInputManager.tablet.onPenDownSignal.add(this.paintBrush.onPenDown);
			this.userInputManager.tablet.onPenUpSignal.add(this.paintBrush.onPenUp);
			this.userInputManager.tablet.onPenDragSignal.add(this.paintBrush.onPenDrag);
			this.userInputManager.tablet.onPenPressureChangeSignal.add(this.paintBrush.onPenPressureChange);
			this.paintBrush.onCreateBrushStrokeSignal.add(
				function(brushStroke) {
					this.brushStrokes.push(brushStroke);
					this.scene.add(brushStroke.display);
				}.bind(this)
			);
			//Global.onMouseMoveSignal.add(this.inputManager.onMouseMove.bind(this.inputManager));

			//stats
			stats = new Stats();
			$(document.body).append( stats.domElement );
			this.rendererStats = new THREEx.RendererStats();
			this.rendererStats.domElement.style.position = 'absolute'
			this.rendererStats.domElement.style.left = '0px'
			this.rendererStats.domElement.style.bottom   = '0px'
			document.body.appendChild( this.rendererStats.domElement );

			//tests
			this.strokes = [];

			//start the engine!
			Global.onResize();
			this.animate = this.animate.bind(this);
			this.animate();

			this.dbManager.begin();
			this.dbManager.onStrokeLoadedSignal.add(this.paintBrush.createStrokeFromLoaded);
			this.paintBrush.onFinalizeBrushStrokeSignal.add(this.dbManager.saveStroke);

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
			Global.now = (Date.now()*.001 - Global.startTime);
			requestAnimationFrame(this.animate);
			if(this.skipFrames > this.skipFrameCounter) {
				this.skipFrameCounter++;
				return;
			}else{
				this.skipFrameCounter = 0;
			}

			for (var i = this.strokes.length - 1; i >= 0; i--) {
				this.strokes[i].material.uniforms.time.value = Global.now;
			};
			this.userInputManager.update();
			this.displayManager.splittingViewUI.animate();
			
			this.render();
			this.rendererStats.update(this.renderer);
            this.paintBrush.animate();
            this.guiManager.render();
			stats.update();
		},
		
		addStrokeToScene: function(stroke){
			this.strokes.push(stroke);
			this.scene.add(stroke);
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
	})
	return MainPresenter;
})