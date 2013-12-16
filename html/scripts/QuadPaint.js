var Class = require('./class/Class');
var Global = require('./Global');
var DisplayManager = require('./DisplayManager');
var UserInputManager = require('./UserInputManager');
var TestFactory = require('./TestFactory');
var PaintBrush = require('./PaintBrush');

var QuadPaint = new Class({
	displayManager: null,
	inputManager: null,
	scene: null,
	renderer: null,
	paintBrush: null,
	brushStrokes: null,
	orbits: null,
	orbitSpeed: .01,
	skipFrames:0,
	skipFrameCounter:0,
	initialize:function() {
		console.log("Initializing QuadPaint");
		this.addToScene = this.addToScene.bind(this);

		this.canvas = document.getElementById('threejsCanvas');
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, canvas:this.canvas});
        this.renderer.autoClear = false;
		this.scene = new THREE.Scene();
		this.displayManager = new DisplayManager(this.scene, this.renderer, this.canvas);
		this.userInputManager = new UserInputManager(this.canvas);
		this.paintBrush = new PaintBrush(this.displayManager.splittingViewUI);
		this.paintBrush.onCreateBrushStrokeSignal.add(this.addToScene);
		this.scene.add(this.paintBrush.cursor.display);
		this.brushStrokes = [];

		//hooks
		//view and display controls
		this.userInputManager.userInputTablet.onPenDownSignal.add(this.displayManager.splittingViewUI.onPenDown);
		this.userInputManager.userInputTablet.onPenUpSignal.add(this.displayManager.splittingViewUI.onPenUp);
		this.userInputManager.userInputMouse.onMouseMoveSignal.add(this.displayManager.splittingViewUI.onPenMove);
		this.userInputManager.userInputTablet.onPenDragSignal.add(this.displayManager.splittingViewUI.onPenDrag);
		this.userInputManager.userInputMouse.onMouseWheelSignal.add(this.displayManager.splittingViewUI.onMouseWheel);

		//resizing
		this.onResize = this.onResize.bind(this);
		Global.onResizeSignal.add(this.onResize);

		//brush
		this.userInputManager.userInputTablet.onPenDownSignal.add(this.paintBrush.onPenDown);
		this.userInputManager.userInputTablet.onPenUpSignal.add(this.paintBrush.onPenUp);
		this.userInputManager.userInputTablet.onPenDragSignal.add(this.paintBrush.onPenDrag);
		this.userInputManager.userInputTablet.onPenPressureChangeSignal.add(this.paintBrush.onPenPressureChange);
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



		//tests
		this.orbits = [];

		this.addToSceneAndOrbit = this.addToSceneAndOrbit.bind(this);

		var color = new THREE.Color(0xffffff);
		color.setRGB(Math.random(), Math.random(), Math.random());
		color.multiplyScalar(.2);
		this.addToScene(new THREE.AmbientLight(color.getHex()));
		var _this = this;
		_.each(TestFactory.createLights(2), _this.addToSceneAndOrbit);
		_.each(TestFactory.createBalls(300, 20, null, 15), _this.addToSceneAndOrbit);
		Global.startTime = new Date().getTime();

		var _this = this;



		//start the engine!
		Global.onResize();
		this.animate = this.animate.bind(this);
		this.animate();
	},
	animate: function() {
		requestAnimationFrame(this.animate);
		if(this.skipFrames > this.skipFrameCounter) {
			this.skipFrameCounter++;
			return;
		}else{
			this.skipFrameCounter = 0;
		}
		Global.now = new Date().getTime() - Global.startTime;

		this.userInputManager.userInputTablet.update();
		this.displayManager.splittingViewUI.animate();
		this.paintBrush.animate();
		
		for (var i = this.orbits.length - 1; i >= 0; i--) {
			this.orbits[i].rotateX(this.orbits[i].rotateBy.x);
			this.orbits[i].rotateY(this.orbits[i].rotateBy.y);
			this.orbits[i].rotateZ(this.orbits[i].rotateBy.z);
		};


		this.render();
		stats.update();
	},
	addToScene: function(thing){
		this.scene.add(thing);
	},
	addToSceneAndOrbit: function(thing){
		var pivot = new THREE.Object3D();
		pivot.add(thing);
		pivot.rotateBy = {
			x:(Math.random() - .5) * this.orbitSpeed, 
			y:(Math.random() - .5) * this.orbitSpeed, 
			z:(Math.random() - .5) * this.orbitSpeed
		};
		this.orbits.push(pivot);
		this.scene.add(pivot);
	},
	render:function() {
		this.renderer.clear();
		this.displayManager.render();
	},
	onResize:function(width, height) {
        this.renderer.setSize(width, height);
		this.displayManager.onResize(width, height);
	}
});
module.exports = QuadPaint;
