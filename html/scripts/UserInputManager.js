var Class = require("./class/Class");
var UserInputMouse = require('./UserInputMouse');
var UserInputTablet = require('./UserInputTablet');

var UserInputManager = new Class({
	userInputMouse: null,
	userInputTablet: null,
	initialize:function(){
		console.log("Initializing User Input Manager");

		//input devices
		this.userInputMouse = new UserInputMouse();
		this.userInputTablet = new UserInputTablet(this.userInputMouse);
	}
})
module.exports = UserInputManager;