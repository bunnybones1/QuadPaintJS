define([
	'Class',
	'Global',
	'three',
	'FaderGUI',
	'StepperGUI'
], function(
	Class,
	Global,
	three,
	FaderGUI,
	StepperGUI
){
	var GUIManager = new Class({
		scene: null,
		camera: null,
		faderWidth: 10,
		faderHeight: 100,
		faderSpacer: 4,
		cursor: 0,
		marginX: 10,
		marginY: 55,
		initialize:function(renderer) {
			console.log("Initializing GUIManager");
			var guiScale = 0.25;
			this.faderWidth *= guiScale;
			this.faderHeight *= guiScale;
			this.faderSpacer *= guiScale;
			this.marginY *= guiScale;
			this.marginX *= guiScale;
			this.renderer = renderer;
			this.camera = new THREE.OrthographicCamera(Global.width / - 2, Global.width / 2, Global.height / 2, Global.height / - 2, - 2000, 1000 );
			this.scene = new THREE.Scene();
			this.addFader = this.addFader.bind(this);
			this.onResize = this.onResize.bind(this);
		},
		onResize: function(width, height) {
			this.updateOffset();
			this.camera = new THREE.OrthographicCamera(-this.offsetX, Global.width - this.offsetX, Global.height - this.marginY, -this.marginY, - 2000, 1000 );
		},
		addFader:function(faderObject, color){
			var faderGUI = new FaderGUI(faderObject, this.faderWidth, this.faderHeight, color);
			this.scene.add(faderGUI.display);
			faderGUI.display.position.x = this.cursor;
			this.cursor += this.faderWidth + this.faderSpacer;
			this.updateOffset();
		},
		addStepper:function(stepperObject, color){
			var stepperGUI = new StepperGUI(stepperObject, this.faderWidth, this.faderHeight, color);
			this.scene.add(stepperGUI.display);
			stepperGUI.display.position.x = this.cursor;
			this.cursor += this.faderWidth + this.faderSpacer;
			this.updateOffset();
		},
		updateOffset: function() {
			this.offsetX = Global.width - this.cursor;
		},
		render:function() {
			this.renderer.render(this.scene, this.camera);
		}
	});
	return GUIManager;
});