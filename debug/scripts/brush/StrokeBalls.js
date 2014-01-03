define([
    'Class',
    'brush/StrokeBase',
    'TestFactory'
], function(
    Class,
    BrushStrokeBase,
    TestFactory
) {
    var StrokeBalls = new Class({
        Extends: BrushStrokeBase,
        initialize:function(paintBrush) {
            this.parent(paintBrush);
            console.log("!!!!!");
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
    return StrokeBalls;
});