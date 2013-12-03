var Class = require('./class/Class');
var UserInputMouse = require('./UserInputMouse');
var Global = require('./Global');

var UserInputTablet = new Class({
	userInputMouse: null,

	onPenDownSignal: null,
	onPenUpSignal: null,
	onPenDragSignal: null,
	initialize: function(userInputMouse) {
		this.userInputMouse = userInputMouse || new UserInputMouse();

		this.onPenDownSignal = new signals.Signal();
		this.onPenUpSignal = new signals.Signal();
		this.onPenDragSignal = new signals.Signal();

		this.penDown = this.penDown.bind(this);
		this.penUp = this.penUp.bind(this);
		this.penDrag = this.penDrag.bind(this);

		this.wacomPlugin = this.getWacomPlugin();
		var loadVersion = this.isPluginLoaded();
		if ( loadVersion != "" ) {
			alert("Loaded webplugin: " + loadVersion);

			this.userInputMouse.onMouseDownSignal.add(this.penDown);
			this.userInputMouse.onMouseUpSignal.add(this.penUp);
		} else {
			alert("webplugin is NOT Loaded (or undiscoverable). Emulating tablet with a mouse.");
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
		}

		return retVersion;
    },

	penDown: function(x, y) {
		console.log("penDown");
		this.userInputMouse.onMouseMoveSignal.add(this.penDrag);
		this.onPenDownSignal.dispatch(x, y);
	},

	penUp: function(x, y) {
		console.log("penUp");
		this.userInputMouse.onMouseMoveSignal.remove(this.penDrag);
		this.onPenUpSignal.dispatch(x, y);
	},
	
	penDrag: function(x, y) {
		console.log("penDrag", this.wacomPlugin.penAPI.pointerType, this.wacomPlugin.penAPI.isWacom, this.wacomPlugin.penAPI.pressure);
		this.onPenDragSignal.dispatch(x, y);
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