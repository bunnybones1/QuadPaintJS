var Class = require('./class/Class');
var BaseObject = require('./core/BaseObject');
var SplittingView = require('./SplittingView');
var TestFactory = require('./TestFactory');
var Global = require('./Global');

var DisplayManager = new Class({
    Extends: BaseObject,
    viewports: null,
    initialize:function(values) {
        console.log("Initializing DisplayManager");
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.scene = new THREE.Scene();
        this.splittingView = new SplittingView(this.scene, this.renderer);
        this.splittingView.renderSignal.add(this.render.bind(this));
        this.camera = this.splittingView.camera;
        this.splittingView.split("x", 8, 2);
        //DOM
        var container = $('#threejsContainer');
        this.canvas = this.renderer.domElement;
        container.append(this.canvas);

        //stats
        stats = new Stats();
        container.append( stats.domElement );

        //tests
        _.each(TestFactory.createLights(2), this.addToScene.bind(this));
        _.each(TestFactory.createBalls(100, 10), this.addToScene.bind(this));
        Global.startTime = new Date().getTime();
    },
    addToScene: function(thing){
    	this.scene.add(thing);
    },
    render:function() {
        Global.now = new Date().getTime() - Global.startTime;
        //this.renderer.clear();
        //this.renderer.render(this.scene, this.camera);
        stats.update();
        //requestAnimationFrame(this.animate);
        this.camera.rotation.y+=.01;
    },
    onResize:function(width, height) {
        this.splittingView.onResize(width, height);
        console.log("resize");
        //this.canvas.width = width;
        //this.canvas.height = height;
    }
});
module.exports = DisplayManager;
