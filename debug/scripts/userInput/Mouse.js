define([
	'Class',
	'Global',
	'signals'
], function(
	Class,
	Global,
	signals
) {
	var Mouse = new Class({
		onMouseDownSignal: null,
		onMouseUpSignal: null,
		onMouseMoveSignal: null,
		onMouseHoverSignal: null,
		onMouseDragSignal: null,
		onMouseWheelSignal: null,
		onMouseOutSignal: null,
		isDown: false,
		initialize:function(){
			this.onMouseDownSignal = new signals.Signal();
			this.onMouseUpSignal = new signals.Signal();
			this.onMouseMoveSignal = new signals.Signal();
			this.onMouseHoverSignal = new signals.Signal();
			this.onMouseDragSignal = new signals.Signal();
			this.onMouseWheelSignal = new signals.Signal();
			this.onMouseOutSignal = new signals.Signal();
			this.start();
		},
		start: function(){
			$(document).bind('mousedown', this._onMouseDown.bind(this));
			$(document).bind('mouseup', this._onMouseUp.bind(this));
			$(document).bind('mousemove', this._onMouseMove.bind(this));
			$(document).bind('mousewheel DOMMouseScroll', this._onMouseWheel.bind(this));
			$(document).bind('mouseout', this._onMouseOut.bind(this));
		},
		stop: function(){
			window.alert("can't stop the mouse! TODO");
		},
		_onMouseDown: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.isDown = true;
			this.onMouseDownSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
		},
		_onMouseUp: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.isDown = false;
			this.onMouseUpSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
		},
		_onMouseMove: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.onMouseMoveSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
			if(this.isDown) this.onMouseDragSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
			else this.onMouseHoverSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
		},
		_onMouseWheel: function(event) {
			if (!event) event = window.event; // IE does not pass evt as a parameter.
		    var scrollTo = 0;
		    if (event.type == 'mousewheel') {
		        scrollTo = (event.originalEvent.wheelDelta * -1);
		    }
		    else if (event.type == 'DOMMouseScroll') {
		        scrollTo = 40 * event.originalEvent.detail;
		    }
			this.onMouseWheelSignal.dispatch(scrollTo);
		},
		_onMouseOut: function(event){
			if (!event) event = window.event; // IE does not pass evt as a parameter.
			this.onMouseOutSignal.dispatch(event.pageX * Global.devicePixelRatio, event.pageY * Global.devicePixelRatio);
			//this._onMouseUp(event);
		}
	})
	return Mouse;
});