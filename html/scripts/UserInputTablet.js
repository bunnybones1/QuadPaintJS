var Class = require('./class/Class');
var UserInputMouse = require('./UserInputMouse');
var Global = require('./Global');

var UserInputTablet = new Class({
	pressure: 0,
	lastPressure: 0,
	userInputMouse: null,

	onPenDownSignal: null,
	onPenUpSignal: null,
	onPenMoveSignal: null,
	onPenDragSignal: null,
	onPenHoverSignal: null,
	onPenPressureChangeSignal: null,

	onEraserDownSignal: null,
	onEraserUpSignal: null,
	onEraserDragSignal: null,
	POINTER_TYPE_STYLUS: 1,
	POINTER_TYPE_ERASER: 2,

	pressureCheckArray: null,
	pressureCheckArrayLimit: 5,
	initialize: function(userInputMouse) {
		this.userInputMouse = userInputMouse || new UserInputMouse();

		this.onPenDownSignal = new signals.Signal();
		this.onPenUpSignal = new signals.Signal();
		this.onPenMoveSignal = new signals.Signal();
		this.onPenDragSignal = new signals.Signal();
		this.onPenHoverSignal = new signals.Signal();
		this.onPenPressureChangeSignal = new signals.Signal();

		this.onEraserDownSignal = new signals.Signal();
		this.onEraserUpSignal = new signals.Signal();
		this.onEraserDragSignal = new signals.Signal();

		this.update = this.update.bind(this);
		this.penDown = this.penDown.bind(this);
		this.penUp = this.penUp.bind(this);
		this._penDrag = this._penDrag.bind(this);
		this._penDragCautious = this._penDragCautious.bind(this);
		this.penHover = this.penHover.bind(this);
		this.penMove = this.penMove.bind(this);

		this.wacomPlugin = this.getWacomPlugin();
		var loadVersion = this.isPluginLoaded();
		if ( loadVersion != "" ) {
			console.log("Loaded wacom tablet webplugin: " + loadVersion);
			this.penDrag = this._penDragCautious;	//this is to detect and discourage wacom owners from using their mouse

			this.userInputMouse.onMouseDownSignal.add(this.penDown);
			this.userInputMouse.onMouseUpSignal.add(this.penUp);
			this.userInputMouse.onMouseDragSignal.add(this.penDrag);
			this.userInputMouse.onMouseMoveSignal.add(this.penMove);
			this.userInputMouse.onMouseHoverSignal.add(this.penHover);
			this.pressureCheckArray = [];
		} else {
			console.log("wacom tablet webplugin is NOT Loaded (or undiscoverable). Emulating tablet with a mouse.");
			this.penDrag = this._penDrag;
			this.wacomPlugin = {penAPI:{pressure:1}};
			//TODO
			return;
		}
	},

	getWacomPlugin: function() {
		return document.getElementById('wtPlugin');
    },

   	isPluginLoaded: function() {
		var retVersion = "";
		var pluginVersion = this.getWacomPlugin().version;

		if ( pluginVersion != undefined ) {
	       	retVersion = pluginVersion;
			this.isRealTablet = true;
		}

		return retVersion;
    },

    update:function() {
    	this.pressure = this.isDown ? this.wacomPlugin.penAPI.pressure : 0;
    	if(this.pressure != this.lastPressure) this.onPenPressureChangeSignal.dispatch(this.pressure);
    	this.lastPressure = this.pressure;
    },

	penDown: function(x, y) {
		//console.log("penDown");
		this.isDown = true;
		this.onPenDownSignal.dispatch(x, y);
	},

	penUp: function(x, y) {
		//console.log("penUp");
		this.isDown = false;
		this.onPenUpSignal.dispatch(x, y);
	},
	
	penMove: function(x, y) {
		//console.log("penMove");
		this.onPenMoveSignal.dispatch(x, y);
	},

	_penDrag: function(x, y) {
		//console.log("penDrag");
		this.onPenDragSignal.dispatch(x, y);
		//if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_STYLUS) this.onPenDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
		//else if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_ERASER) this.onEraserDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
	},
	_penDragCautious: function(x, y) {
		this.pressureCheck();
		this._penDrag(x, y);
	},

	penHover: function(x, y) {
		//console.log("penHover");
		this.onPenHoverSignal.dispatch(x, y);
		//if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_STYLUS) this.onPenDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
		//else if(this.wacomPlugin.penAPI.pointerType == this.POINTER_TYPE_ERASER) this.onEraserDragSignal.dispatch(x, y, this.wacomPlugin.penAPI.pressure);
	},

	pressureCheck: function() {
		this.pressureCheckArray.push(this.pressure);
		if(this.pressureCheckArray.length == this.pressureCheckArrayLimit) {
			var usingWacom = false;
			for (var i = this.pressureCheckArray.length - 1; i >= 0; i--) {
				if(this.pressureCheckArray[i] != 0) usingWacom = true;
			};
			if(!usingWacom) alert("A wacom tablet has been detected so mouse brush has been disabled!");
			this.userInputMouse.onMouseDragSignal.remove(this.penDrag);
			this.penDrag = this._penDrag;
			this.userInputMouse.onMouseDragSignal.add(this.penDrag);
		}
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