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
        this.userInputManager.userInputTablet.onPenDownSignal.add(this.displayManager.splittingViewUI.onPenDown);
        this.userInputManager.userInputTablet.onPenUpSignal.add(this.displayManager.splittingViewUI.onPenUp);
        this.userInputManager.userInputMouse.onMouseMoveSignal.add(this.displayManager.splittingViewUI.onPenMove);
        this.userInputManager.userInputTablet.onPenDragSignal.add(this.displayManager.splittingViewUI.onPenDrag);
        this.userInputManager.userInputMouse.onMouseWheelSignal.add(this.displayManager.splittingViewUI.onMouseWheel);
        Global.onResizeSignal.add(this.displayManager.onResize);
        Global.onResize();
        //Global.onMouseMoveSignal.add(this.inputManager.onMouseMove.bind(this.inputManager));
    }
});
module.exports = QuadPaint;
