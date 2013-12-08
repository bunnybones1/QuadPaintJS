var Class = require('./class/Class');
var TestFactory = require('./TestFactory');

var BrushStrokeBase = new Class({
    display: null,
    spacingThreshold: 10,
    overallSpacingThreshold: .1,
    initialize:function() {
        this.start();
    },
    start:function() {
        this.display = TestFactory.createBalls(1, 1, null, 1)[0];
    },
    attemptToAdd:function(pos, size) {
        this.worldPosition = pos;
        if(!this.lastWorldPosition) {
            this.lastWorldPosition = this.worldPosition.clone();
        } 
        var length = this.worldPosition.clone().sub(this.lastWorldPosition).length();
        if (length > this.overallSpacingThreshold) {

            this.add(pos, size);
            this.lastWorldPosition = this.worldPosition;
        }
    },
    add:function(pos, size) {
        this.display.position.copy(pos);
        this.display.visible = (size > 0);
        if(size > 0) {
            this.display.scale.set(size, size, size);
        }
    },
    finalize:function(pos) {
        
    },
    updateZoomScale:function(scale) {
        this.overallSpacingThreshold = this.spacingThreshold * scale;
    }
});
module.exports = BrushStrokeBase;