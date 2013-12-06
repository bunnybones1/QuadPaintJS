var Class = require('./class/Class');
var UserInputMouse = require('./UserInputMouse');
var Global = require('./Global');

var UserInputTablet = new Class({
	userInputMouse: null,

	onPenDownSignal: null,
	onPenUpSignal: null,
	onPenMoveSignal: null,
	onPenDragSignal: null,
	onPenHoverSignal: null,

	onEraserDownSignal: null,
	onEraserUpSignal: null,
	onEraserDragSignal: null,
	POINTER_TYPE_STYLUS: 1,
	POINTER_TYPE_ERASER: 2,

	//pressureValidationArraySize: 3,
	//pressureValidationArray: null,
	initialize: function(userInputMouse) {
		this.userInputMouse = userInputMouse || new UserInputMouse();

		this.onPenDownSignal = new signals.Signal();
		this.onPenUpSignal = new signals.Signal();
		this.onPenMoveSignal = new signals.Signal();
		this.onPenDragSignal = new signals.Signal();
		this.onPenHoverSignal = new signals.Signal();

		this.onEraserDownSignal = new signals.Signal();
		this.onEraserUpSignal = new signals.Signal();
		this.onEraserDragSignal = new signals.Signal();

		this.penDown = this.penDown.bind(this);
		this.penUp = this.penUp.bind(this);
		this.penDrag = this.penDrag.bind(this);
		this.penHover = this.penHover.bind(this);
		this.penMove = this.penMove.bind(this);

		this.wacomPlugin = this.getWacomPlugin();
		var loadVersion = this.isPluginLoaded();
		if ( loadVersion != "" ) {
			alert("Loaded webplugin: " + loadVersion);

			this.userInputMouse.onMouseDownSignal.add(this.penDown);
			this.userInputMouse.onMouseUpSignal.add(this.penUp);
			this.userInputMouse.onMouseDragSignal.add(this.penDrag);
			this.userInputMouse.onMouseMoveSignal.add(this.penMove);
			this.userInputMouse.onMouseHoverSignal.add(this.penHover);
		} else {
			alert("webplugin is NOT Loaded (or undiscoverable). Emulating tablet with a mouse.");
			this.wacomPlugin = {penAPI:{pressure:1}};
			//TODO
			return;
		}

		//this.pressureValidationArray = [];
	},

	getWacomPlugin: function() {
		console.log(document.getElementById('wtPlugin'));
		return document.getElementById('wtPlugin');
    },

   	isPluginLoaded: function() {
		var retVersion = "";
		var pluginVersion = this.getWacomPlugin().version;

		if ( pluginVersion != undefined ) {
	       	retVersion = pluginVersion;
		}

		return retVersion;
    },

	penDown: function(x, y) {
		//console.log("penDown");
		this.isDown = true;
		this.userInputMouse.onMouseMoveSignal.add(this.penDrag);
		this.onPenDownSignal.dispatch(x, y);
	},

	penUp: function(x, y) {
		//console.log("penUp");
		this.isDown = false;
		this.userInputMouse.onMouseMoveSignal.remove(this.penDrag);
		this.onPenUpSignal.dispatch(x, y);
	},
	
	penMove: function(x, y) {
		//console.log("penMove");
		this.onPenMoveSignal.dispatch(x, y);
	},

	penDrag: function(x, y) {
		//console.log("penDrag");
		this.onPenDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
		//if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_STYLUS) this.onPenDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
		//else if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_ERASER) this.onEraserDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
	},

	penHover: function(x, y) {
		//console.log("penHover");
		this.onPenHoverSignal.dispatch(x, y);
		//if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_STYLUS) this.onPenDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
		//else if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_ERASER) this.onEraserDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
	},
	//this doesn't really work, anyways it's pointless. Wacom users should just draw with their tablet, not their mouse.
	validatePressureIsAnalog: function(pressure) {
		this.pressureValidationArray.unshift(pressure);
		if(this.pressureValidationArray.length > this.pressureValidationArraySize) this.pressureValidationArray.pop();
		for (var i = this.pressureValidationArray.length - 1; i >= 0; i--) {
			if(this.pressureValidationArray[i] != pressure) return true;
		};
		return false;
	}
});
module.exports = UserInputTablet;

//for reference
/*
	var isWacom      = getWacomPlugin().penAPI.isWacom;
	var isEraser     = getWacomPlugin().penAPI.isEraser;
	var pressure     = getWacomPlugin().penAPI.pressure;
	var posX         = getWacomPlugin().penAPI.posX;
	var posY         = getWacomPlugin().penAPI.posY;

	var sysX         = getWacomPlugin().penAPI.sysX;
	var sysY         = getWacomPlugin().penAPI.sysY;
	var tabX         = getWacomPlugin().penAPI.tabX;
	var tabY         = getWacomPlugin().penAPI.tabY;
	var rotationDeg  = getWacomPlugin().penAPI.rotationDeg;
	var rotationRad  = getWacomPlugin().penAPI.rotationRad;
	var tiltX        = getWacomPlugin().penAPI.tiltX;
	var tiltY        = getWacomPlugin().penAPI.tiltY;
	var tangPressure = getWacomPlugin().penAPI.tangentialPressure;
	var version      = getWacomPlugin().penAPI.version;
	var pointerType  = getWacomPlugin().penAPI.pointerType;
	var tabletModel  = getWacomPlugin().penAPI.tabletModel;
*/