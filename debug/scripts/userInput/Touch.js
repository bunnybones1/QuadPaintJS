define([
	'Class',
	'Global',
	'signals'
], function(
	Class,
	Global,
	signals
) {
	var Touch = new Class({
		onTouchStartSignal: null,
		onTouchEndSignal: null,
		onTouchMoveSignal: null,
		initialize:function(){
			this.onTouchStartSignal = new signals.Signal();
			this.onTouchEndSignal = new signals.Signal();
			this.onTouchMoveSignal = new signals.Signal();
			this.start();
		},
		start: function(){
			var doc = $(document)[0];
			doc.addEventListener('touchstart', this._onTouchStart.bind(this));
			doc.addEventListener('touchend', this._onTouchEnd.bind(this));
			doc.addEventListener('touchmove', this._onTouchMove.bind(this));
		},
		stop: function(){
			window.alert("can't stop the touch! TODO");
		},
		_onTouchStart: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.onTouchStartSignal.dispatch(event);
		},
		_onTouchEnd: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.onTouchEndSignal.dispatch(event);
		},
		_onTouchMove: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.onTouchMoveSignal.dispatch(event);
		}
	})
	return Touch;
});