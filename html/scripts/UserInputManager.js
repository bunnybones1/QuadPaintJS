var Class = require("./class/Class");
var UserInputMouse = require('./UserInputMouse');
var UserInputTablet = require('./UserInputTablet');
var ControllerTablet = require('./ControllerTablet');

var UserInputManager = new Class({
	userInputTablet: null,
	controllerTablet: null,
	initialize:function(){
		console.log("Initializing User Input Manager");

		//input devices
		this.userInputMouse = new UserInputMouse();
		this.userInputTablet = new UserInputTablet(this.userInputMouse);

		//controllers
		this.controllerTablet = new ControllerTablet();

		//hook up
		this.userInputTablet.onPenDragSignal.add(this.ControllerTablet.onPenDrag);
	}
})
module.exports = new UserInputManager();