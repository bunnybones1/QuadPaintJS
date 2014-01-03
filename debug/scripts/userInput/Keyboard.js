define([
	'Class',
	'Global',
	'signals'
], function(
	Class,
	Global,
	signals
) {
	var Keyboard = new Class({
		onKeyDownSignal: null,
		onKeyUpSignal: null,
		states: null,
		initialize:function(){
			this.onKeyDownSignal = new signals.Signal();
			this.onKeyUpSignal = new signals.Signal();
			this.states = [];
			for (var i = 256 - 1; i >= 0; i--) {
				this.states[i] = false;
			};
			this.start();
		},
		start: function(){
			$(document).bind('keydown', this._onKeyDown.bind(this));
			$(document).bind('keyup', this._onKeyUp.bind(this));
		},
		stop: function(){
			window.alert("can't stop the keyboard! TODO");
		},
		_onKeyDown: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			if(this.states[event.keyCode] == true) return;
			this.states[event.keyCode] = true;
			this.onKeyDownSignal.dispatch(event.keyCode, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey);
			//console.log(event.keyCode);
		},
		_onKeyUp: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.states[event.keyCode] = false;
			this.onKeyUpSignal.dispatch(event.keyCode);
		}
	})
	return Keyboard;
});