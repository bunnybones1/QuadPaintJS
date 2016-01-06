define([],
function() {
	function DrawHandler(touchHandler, splittingViewUI, tablet) {
		touchHandler.register({
			startHandler: function(touches) {
				console.log('external draw start', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenDown(x, y);
				_this.userInputManager.tablet.penDown(x, y);
			}

			moveHandler: function(touches) {
				console.log('external draw move', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenDrag(x, y, 1);
				_this.userInputManager.tablet.penDrag(x, y);
			}

			endHandler: function(touches) {
				console.log('external draw end', touches.length);
				var x = touches[0].clientX;
				var y = touches[0].clientY;
				_this.displayManager.splittingViewUI.onPenUp(x, y);
				_this.userInputManager.tablet.penUp(x, y);
			}

			touches: 1
		});
	}
	return DrawHandler;
});