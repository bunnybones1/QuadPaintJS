var Class = require('./class/Class');
var Global = require('./Global');

var SplittingViewUI = new Class({
	splittingView: null,
	initialize:function(splittingViewBase, canvas) {
		this.splittingView = splittingViewBase;
		this.canvas = canvas;
		this.onClick = this.onClick.bind(this);
        $(this.canvas).on('click', this.onClick);
	},
	onClick:function(event) {
		splittingView.splitUnderCoordinate(event.offsetX, event.offsetY);
	},
    onResize:function(width, height) {
    }
});
module.exports = SplittingViewUI;
