var Class = require('./class/Class');
var BrushStrokeGeom = require('./BrushStrokeGeom');
var BrushCursor = require('./BrushCursor');

var PaintBrush = new Class({
    viewUI: null,
    color: null,
    size: 10,
    onCreateBrushStrokeSignal: null,
    worldMouse: null,
    lastWorldMouse: null,
    cursor: null,
    x: 0,
    y: 0,
    initialize:function(viewUI) {
        console.log("Initializing PaintBrush");
        this.animate = this.animate.bind(this);
        this.updateWorldMouse = this.updateWorldMouse.bind(this);
        this.viewUI = viewUI;
        this.color = {r:1, g:1, b:1, a:1};
        this.projector = new THREE.Projector();
        this.onPenDown = this.onPenDown.bind(this);
        this.onPenDrag = this.onPenDrag.bind(this);
        this.newBrushStroke = this.newBrushStroke.bind(this);
        this.onPenUp = this.onPenUp.bind(this);
        this.onPenPressureChange = this.onPenPressureChange.bind(this);
        this.onCreateBrushStrokeSignal = new signals.Signal();
        this.cursor = new BrushCursor();
    },
    onPenDown: function(x, y) {
        this.updateWorldMouse(x, y);
        this.cursor.updatePosition(this.worldBrushPosition, 0);
        if(!this.brushStroke) this.newBrushStroke();
    },
    newBrushStroke: function() {
        if(this.brushStroke) this.brushStroke.onStrokeFullSignal.remove(this.newBrushStroke);
        this.brushStroke = new BrushStrokeGeom();
        this.brushStroke.attemptToAdd(this.worldBrushPosition, 0);
        this.onCreateBrushStrokeSignal.dispatch(this.brushStroke.display);
        this.brushStroke.onStrokeFullSignal.add(this.newBrushStroke);
    },
    onPenUp: function(x, y) {
        this.updateWorldMouse(x, y);
        this.cursor.updatePosition(this.worldBrushPosition, 0);
        if(this.brushStroke) this.brushStroke.finalize(this.worldBrushPosition);
    },
    onPenDrag: function(x, y) {
        this.updateWorldMouse(x, y);
        this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize);
        this.cursor.updatePosition(this.worldBrushPosition);
        //clickedView.camera.rotation.set(0, 0, 0);
    },
    onPenPressureChange: function(pressure) {
        if(!this.viewUI.viewUnderPen) return;
        this.overallSize = pressure * this.viewUI.viewUnderPen.fovCompensater * this.size;
        this.cursor.updateSize(this.overallSize);
        //clickedView.camera.rotation.set(0, 0, 0);
    },
    animate: function() {
        this.updateWorldMouse(this.x, this.y);
        if(this.worldBrushPosition) this.cursor.updatePosition(this.worldBrushPosition);
        this.cursor.updateSize(this.overallSize);
        if(this.brushStroke) {
            if(this.worldBrushPosition) this.brushStroke.attemptToAdd(this.worldBrushPosition, this.overallSize);
        }
    },
    updateWorldMouse: function(x, y) {
        this.x = x;
        this.y = y;
        if(!this.viewUI.viewUnderPen) return;
        var bounds = this.viewUI.viewUnderPen.viewRectangle;
        var screenMouse = new THREE.Vector3();
        screenMouse.x = ((x - bounds.x) / bounds.width) * 2 - 1;
        screenMouse.y = -(((y - bounds.y) / bounds.height) * 2 - 1);
        screenMouse.z = .5;

        this.worldMouse = screenMouse.clone();
        this.projector.unprojectVector(this.worldMouse, this.viewUI.viewUnderPen.camera);

        if(!this.lastWorldMouse) {
            this.lastWorldMouse = this.worldMouse.clone();
        } 

        var lastScreenMouse = this.lastWorldMouse.clone();
        this.projector.projectVector(lastScreenMouse, this.viewUI.viewUnderPen.camera);


        this.worldBrushPosition = this.worldMouse.clone();
        this.worldBrushPosition.x *= 100;
        this.worldBrushPosition.y *= 100;
        this.worldBrushPosition.z *= 100;


        this.lastWorldMouse = this.worldMouse;
        if(this.brushStroke) this.brushStroke.updateZoomScale(this.viewUI.viewUnderPen.fovCompensater);
    }
});
module.exports = PaintBrush;