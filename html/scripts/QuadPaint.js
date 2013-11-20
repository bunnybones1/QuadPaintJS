var Class = require('./class/Class');
var BaseObject = require('./core/BaseObject');
var Global = require('./Global');
var DisplayManager = require('./DisplayManager');

var QuadPaint = new Class({
    Extends: BaseObject,
    displayManager: null,
    inputManager: null,
    initialize:function(values) {
        console.log("Initializing QuadPaint");
        this.displayManager = new DisplayManager();
        Global.onResizeSignal.add(this.displayManager.onResize.bind(this.displayManager));
        Global.onResize();
        //Global.onMouseMoveSignal.add(this.inputManager.onMouseMove.bind(this.inputManager));
    }
});
module.exports = QuadPaint;
