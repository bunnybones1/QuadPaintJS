var Class = require('./class/Class');
var BaseObject = require('./core/BaseObject');
var Global = require('./Global');
var DisplayManager = require('./DisplayManager');
var UserInputManager = require('./UserInputManager');

var QuadPaint = new Class({
    Extends: BaseObject,
    displayManager: null,
    inputManager: null,
    initialize:function(values) {
        console.log("Initializing QuadPaint");
        this.canvas = document.getElementById('threejsCanvas')
        this.displayManager = new DisplayManager(this.canvas);
        this.userInputManager = new UserInputManager(this.canvas);
        Global.onResizeSignal.add(this.displayManager.onResize);
        Global.onResize();
        //Global.onMouseMoveSignal.add(this.inputManager.onMouseMove.bind(this.inputManager));
    }
});
module.exports = QuadPaint;
