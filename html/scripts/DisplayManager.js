var Class = require('./class/Class');
var BaseObject = require('./core/BaseObject');
var SplittingView = require('./SplittingView');
var SplittingViewUI = require('./SplittingViewUI');
var TestFactory = require('./TestFactory');
var Global = require('./Global');

var DisplayManager = new Class({
    Extends: BaseObject,
    splittingViewUI: null,
    initialize:function(values) {
        console.log("Initializing DisplayManager");
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.scene = new THREE.Scene();
        this.splittingView = new SplittingView(this.scene, this.renderer);
        this.splittingView.renderSignal.add(this.render.bind(this));
        this.camera = this.splittingView.camera;
        var firstSplit = this.splittingView.split("x", .33);
        firstSplit[0].split("y", .33)[0].split("x", .33)[0].split("y", .33)[0].split("x", .33);
        var middleSplit = firstSplit[1].split("x", .5);
        middleSplit[0].split("y", .5);
        middleSplit[1].split("y", .66)[1].split("x", .66)[1].split("y", .66);
        //DOM
        var container = $('#threejsContainer');
        this.canvas = this.renderer.domElement;
        container.append(this.canvas);

        this.splittingViewUI = new SplittingViewUI(container, this.canvas);

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
        this.splittingViewUI.onResize(width, height);
        //this.canvas.width = width;
        //this.canvas.height = height;
    }
});
module.exports = DisplayManager;
