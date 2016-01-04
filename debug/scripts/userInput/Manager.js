define([
	'Class',
	'userInput/Mouse',
	'userInput/Touch',
	'userInput/Tablet',
	'userInput/Keyboard',
	'userInput/HotKeys',
	'userInput/Faders',
	'userInput/Steppers'
], function(
	Class,
	Mouse,
	Touch,
	Tablet,
	Keyboard,
	HotKeys,
	Faders,
	Steppers
) {
	var Manager = new Class({
		mouse: null,
		tablet: null,
		keyboard: null,
		hotKeys: null,
		faders: null,
		steppers: null,
		initialize:function(){
			console.log("Initializing User Input Manager");

			//input devices
			this.mouse = new Mouse();
			this.touch = new Touch();
			this.tablet = new Tablet(this.mouse);

			this.keyboard = new Keyboard();
			this.hotKeys = new HotKeys(this.keyboard);
			this.faders = new Faders(this.keyboard);
			this.steppers = new Steppers(this.keyboard);
		},
		update: function() {
			this.faders.update();
			this.tablet.update();
		}
	})
	return Manager;
});