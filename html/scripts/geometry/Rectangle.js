var Class = require('.././class/Class');

var Rectangle = new Class({
	x: null,
	y: null,
	width: null,
	height: null,
	axis: null,
	splits: null,
	fraction: .5,
	antiFraction: .5,
	childrenRects: null,
	initialize:function(x, y, width, height, axis) {
		this.axis = axis;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.widthHalf = width * .5;
		this.heightHalf = height * .5;
	},
	split:function(axis, fraction) {
		this.axis = axis;
		this.childrenRects = [];
		this.fraction = fraction;
		this.antiFraction = 1-fraction;
		switch (this.axis) {
			case "x":
				this.childrenRects[0] = new Rectangle(this.x, this.y, this.width * this.fraction, this.height, "y");
				this.childrenRects[1] = new Rectangle(this.x + this.width * this.fraction, this.y, this.width * this.antiFraction, this.height, "y");
			break;
			case "y":
				this.childrenRects[0] = new Rectangle(this.x, this.y, this.width, this.height * this.fraction, "x");
				this.childrenRects[1] = new Rectangle(this.x, this.y + this.height * this.fraction, this.width, this.height * this.antiFraction, "x");
			break;
		}
		this.onResize(this.width, this.height);
		return this.childrenRects;
	},
	onResize:function(width, height) {
		this.width = width;
		this.height = height;
		this.widthHalf = width * .5;
		this.heightHalf = height * .5;
		if(this.childrenRects) {
			switch (this.axis) {
				case "x":
					this.childrenRects[0].setPos(this.x, this.y);
					this.childrenRects[0].onResize(this.width * this.fraction, this.height);
					this.childrenRects[1].setPos(this.x + this.width * this.fraction, this.y);
					this.childrenRects[1].onResize(this.width * this.antiFraction, this.height);
				break;
				case "y":
					this.childrenRects[0].setPos(this.x, this.y + this.height * this.antiFraction);
					this.childrenRects[0].onResize(this.width, this.height * this.fraction);
					this.childrenRects[1].setPos(this.x, this.y);
					this.childrenRects[1].onResize(this.width, this.height * this.antiFraction);
				break;
			}
		}
	},
	setPos:function(x, y) {
		this.x = x;
		this.y = y;
	},
	contains: function(x, y){
		if(x < this.x) return false;
		if(x > (this.x + this.width)) return false;
		if(y < this.y) return false;
		if(y > (this.y + this.height)) return false;
		return true;
	},
	getRelative:function(global) {
		return {
			x: (global.x - this.x) / this.widthHalf - 1,
			y: (global.y - this.y) / this.heightHalf - 1
		}
	}
});
module.exports = Rectangle;
