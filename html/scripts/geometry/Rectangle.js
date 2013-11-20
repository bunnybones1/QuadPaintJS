var Class = require('.././class/Class');

var Rectangle = new Class({
	x: null,
	y: null,
	width: null,
	height: null,
	splitAxis: null,
	splits: null,
	splitRatioRange: null,
	childrenRects: null,
	initialize:function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	},
	split:function(axis, total) {
		this.splitAxis = axis;
		this.splits = total;
		this.childrenRects = [];
		this.splitRatioRange = 1/total;
		for (var i = 0; i < total; i++) {
			this.childrenRects[i] = new Rectangle();
		};
		this.onResize(this.width, this.height);
		return this.childrenRects;
	},
	onResize:function(width, height) {
		this.width = width;
		this.height = height;

		if(this.childrenRects) {
			switch (this.splitAxis) {
				case "y":
					for (var i = 0; i < this.splits; i++) {
						var ratioIn = i / this.splits;
						var ratioOut = (i+1) / this.splits;
						this.childrenRects[i].x = this.x + this.width * ratioIn;
						this.childrenRects[i].y = this.y;
						this.childrenRects[i].onResize(this.width * this.splitRatioRange, this.height);
					};
					break;
				case "x":
					for (var i = 0; i < this.splits; i++) {
						var ratioIn = i / this.splits;
						var ratioOut = (i+1) / this.splits;
						this.childrenRects[i].x = this.x;
						this.childrenRects[i].y = this.y + this.height * ratioIn;
						this.childrenRects[i].onResize(this.width, this.height * this.splitRatioRange);
					};
					break;
			}
		}
	}
});
module.exports = Rectangle;
