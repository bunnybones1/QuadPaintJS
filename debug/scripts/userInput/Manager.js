define([
	'Class',
	'userInput/Mouse',
	'userInput/Tablet',
	'userInput/Keyboard',
	'userInput/HotKeys',
	'userInput/Faders',
	'userInput/Steppers'
], function(
	Class,
	Mouse,
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