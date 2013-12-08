var Class = require('./class/Class');
var TestFactory = require('./TestFactory');

var BrushCursor = new Class({
    display: null,
    initialize:function() {
        this.display = TestFactory.createBalls(1, 1, null, 1)[0];
    },
    updatePosition:function(pos) {
        this.display.position.copy(pos);
    },
    updateSize:function(size) {
        this.display.visible = (size > 0);
        if(size > 0) {
            this.display.scale.set(size, size, size);
        }
    }
});
module.exports = BrushCursor;