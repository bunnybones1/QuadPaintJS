var Class = require('./class/Class');
var Global = require('./Global');
var Rectangle = require('./geometry/Rectangle');
var SplittingSubView = require('./SplittingSubView');

var SplittingView = new Class({
	Extends: SplittingSubView,
	renderSignal: null,
	initialize:function(scene, renderer, parentView, viewRectangle) {
        renderer.autoClear = false;
		this.parent(scene, renderer, null, new Rectangle(0, 0, Global.width, Global.height));
        this.renderSignal = new signals.Signal();
        this.animate = this.animate.bind(this);
		this.animate();
	},
	animate: function() {
		this.render();
		requestAnimationFrame(this.animate);
	},
	render: function() {
		this.renderSignal.dispatch();
		this.renderer.clear();
		this.parent();
	},
	onResize:function(width, height) {
        this.renderer.setSize(width, height);
		this.parent(width, height);
		this.viewRectangle.onResize(width, height);
	}
});
module.exports = SplittingView;
