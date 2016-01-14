define([
	'Class',
	'TestFactory'
], function(
	Class,
	TestFactory
) {
	var StrokeBase = new Class({
		paintBrush: null,
		display: null,
		spacingThreshold: 3,
		overallSpacingThreshold: .1,
		fovCompensator: 1,
		initialize:function(paintBrush) {
			this.paintBrush = paintBrush;
			this.start();
		},
		start:function() {
			this.display = TestFactory.createBalls(1, 1, null, 1)[0];
		},
		attemptToAdd:function(pos, size, angle) {
			this.worldPosition = pos;
			if(!this.lastWorldPosition) {
				this.lastWorldPosition = this.worldPosition.clone();
			} 
			var length = this.worldPosition.clone().sub(this.lastWorldPosition).length();
			if (length > this.overallSpacingThreshold) {
				this.add(pos, size, angle);
				this.lastWorldPosition = this.worldPosition;
			}
		},
		add:function(pos, size, angle) {
			this.display.position.copy(pos);
			this.display.visible = (size > 0);
			if(size > 0) {
				this.display.scale.set(size, size, size);
			}
		},
		finalize:function(pos) {
			throw ("Override this!");
		},
		updateZoomScale:function(scale) {
			this.fovCompensator = scale;
			this.overallSpacingThreshold = this.spacingThreshold * scale;
		}
	});
	return StrokeBase;
});