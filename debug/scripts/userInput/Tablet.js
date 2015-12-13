define([
	'Class',
	'userInput/Mouse',
	'Global',
	'signals'
], function(
	Class,
	Mouse,
	Global,
	signals
) {

	var Tablet = new Class({
		usingPhysicalTablet: false,
		pressure: 0.1,
		lastPressure: 0.1,
		tiltX: 0,
		lastTiltX: 0,
		tiltY: 0,
		lastTiltY: 0,
		userInputMouse: null,

		onPenDownSignal: null,
		onPenUpSignal: null,
		onPenMoveSignal: null,
		onPenDragSignal: null,
		onPenHoverSignal: null,
		onPenPressureChangeSignal: null,
		onPenTiltChangeSignal: null,

		onEraserDownSignal: null,
		onEraserUpSignal: null,
		onEraserDragSignal: null,
		POINTER_TYPE_STYLUS: 1,
		POINTER_TYPE_ERASER: 2,

		pressureCheckArray: null,
		pressureCheckArrayLimit: 30,
		fakePressureChangeSpeed: 0.1,
		initialize: function(userInputMouse) {
			var Signal = signals.Signal;
			this.userInputMouse = userInputMouse || new UserInputMouse();

			this.onPenDownSignal = new Signal();
			this.onPenUpSignal = new Signal();
			this.onPenMoveSignal = new Signal();
			this.onPenDragSignal = new Signal();
			this.onPenHoverSignal = new Signal();
			this.onPenPressureChangeSignal = new Signal();
			this.onPenTiltChangeSignal = new Signal();

			this.onEraserDownSignal = new Signal();
			this.onEraserUpSignal = new Signal();
			this.onEraserDragSignal = new Signal();

			this.updateEmulated = this.updateEmulated.bind(this);
			this.updatePhysical = this.updatePhysical.bind(this);
			this.penDown = this.penDown.bind(this);
			this.penUp = this.penUp.bind(this);
			this._penDrag = this._penDrag.bind(this);
			this._penDragCautious = this._penDragCautious.bind(this);
			this.penHover = this.penHover.bind(this);
			this.penMove = this.penMove.bind(this);

			this.wacomPlugin = this.getWacomPlugin();
			var loadVersion = this.isPluginLoaded();
			if ( loadVersion != "") {
				console.log("Loaded wacom tablet webplugin: " + loadVersion);
				this.penDrag = this._penDragCautious;	//this is to detect and discourage wacom owners from using their mouse

				this.pressureCheckArray = [];
				this.usingPhysicalTablet = true;
				this.update = this.updatePhysical;
			} else {
				console.log("wacom tablet webplugin is NOT Loaded (or undiscoverable). Emulating tablet with a mouse.");
				this.penDrag = this._penDrag;
				this.usingPhysicalTablet = false;
				this.update = this.updateEmulated;
			}
			this.userInputMouse.onMouseDownSignal.add(this.penDown);
			this.userInputMouse.onMouseUpSignal.add(this.penUp);
			this.userInputMouse.onMouseDragSignal.add(this.penDrag);
			this.userInputMouse.onMouseMoveSignal.add(this.penMove);
			this.userInputMouse.onMouseHoverSignal.add(this.penHover);

		},

		getWacomPlugin: function() {
			return document.getElementById('wtPlugin');
		},

		isPluginLoaded: function() {
			var retVersion = "";
			var pluginVersion = this.getWacomPlugin().version;

			if ( pluginVersion !== undefined ) {
				retVersion = pluginVersion;
				this.isRealTablet = true;
			}

			return retVersion;
		},

		updatePhysical:function() {
			this.pressure = this.isDown ? this.wacomPlugin.penAPI.pressure : 0;
			this.tiltX = this.wacomPlugin.penAPI.tiltX;
			this.tiltY = this.wacomPlugin.penAPI.tiltY;
			this.updatePressure(this.pressure);
			this.updateTilt(this.tiltX, this.tiltY);
		},	

		updateEmulated:function() {
			var targetPressure = this.isDown ? 1 : 0;
			if(this.pressure > targetPressure) this.pressure -= this.fakePressureChangeSpeed;
			else if(this.pressure < targetPressure) this.pressure += this.fakePressureChangeSpeed;
			if(this.pressure < 0.05) this.pressure = 0;
			if(this.pressure > 1) this.pressure = 1;
			this.updatePressure(this.pressure);
			this.updateTilt(this.tiltX, this.tiltY);
		},

		updatePressure: function(pressure) {
			this.pressure = pressure;
			if(this.pressure !== this.lastPressure) {
				this.onPenPressureChangeSignal.dispatch(this.pressure);
				this.lastPressure = this.pressure;
			}
		},

		updateTilt: function(tiltX, tiltY) {
			this.tiltX = tiltX;
			this.tiltY = tiltY;
			if(this.tiltX !== this.lastTiltX && this.tiltY !== this.lastTiltY) {
				this.onPenTiltChangeSignal.dispatch(this.tiltX, this.tiltY);
				this.lastTiltX = this.tiltX;
				this.lastTiltY = this.tiltY;
			}
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
			console.log("penMove");
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
					if(this.pressureCheckArray[i] !== 0) usingWacom = true;
				}
				if(!usingWacom && this.usingPhysicalTablet) {
					this.usingPhysicalTablet = false;
					this.update = this.updateEmulated;
					console.log("A wacom tablet is not being used. Mouse brush has been enabled!");
				} else if(usingWacom && !this.usingPhysicalTablet) {
					console.log("A wacom tablet has been detected so mouse brush has been disabled!");
					this.update = this.updatePhysical;
					usingPhysicalTablet = true;
				}
			}
		}
	});
	return Tablet;
});

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