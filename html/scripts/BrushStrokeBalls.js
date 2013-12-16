var Class = require('./class/Class');
var BrushStrokeBase = require('./BrushStrokeBase');
var TestFactory = require('./TestFactory');

var BrushStrokeBalls = new Class({
    Extends: BrushStrokeBase,
    initialize:function(paintBrush) {
        this.parent(paintBrush);
    },
    start:function() {
        this.display = new THREE.Object3D();
        this.ball = TestFactory.createBalls(1, 1, null, 1)[0];
    },
    add:function(pos, size) {
        if(size > 0) {
            var ball = this.ball.clone();
            this.display.add(ball);
            this.ball.scale.set(size, size, size);
            this.ball.position.copy(pos);
        }
    }
});
module.exports = BrushStrokeBalls;