var Class = require("./class/Class");
var ControllerTablet = new Class({
	parallax: null,
	orientationContributionX: 0,
	orientationContributionY: 0,
	mouseContributionX: 0,
	mouseContributionY: 0,
    magnitudeMouse: 150,
    magnitudeOrientation: 1.3,
	onChangeSignal: null,
	initialize:function(){
		this.parallax = {x:0, y:0};
		this.onChangeSignal = new signals.Signal();
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onDeviceOrientation = this.onDeviceOrientation.bind(this);
	},
	onMouseMove:function(x, y) {
        this.mouseContributionX = (x / Global.width - .5) * this.magnitudeMouse;
        this.mouseContributionY = (y / Global.height - .5) * this.magnitudeMouse;
		this._onParallax();
	},
	onDeviceOrientation:function(beta, gamma) {
		this.orientationContributionX = (beta || 0) * -this.magnitudeOrientation;
		this.orientationContributionY = (-gamma || 0) * -this.magnitudeOrientation;
		this._onParallax();
	},
    _onParallax:function() {
    	this.parallax.x = this.mouseContributionX + this.orientationContributionX;
    	this.parallax.y = this.mouseContributionY + this.orientationContributionY;
    	this.onChangeSignal.dispatch(this.parallax.x, this.parallax.y);
    }
})
module.exports = ControllerTablet;