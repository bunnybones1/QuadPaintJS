var Class = require('./class/Class');
var SplittingView = require('./SplittingView');
var SplittingViewUI = require('./SplittingViewUI');
var TestFactory = require('./TestFactory');
var Global = require('./Global');

var DisplayManager = new Class({
    splittingViewUI: null,
    orbits: null,
    orbitSpeed: .01,
    initialize:function(canvas) {
        console.log("Initializing DisplayManager");

        this.addToScene = this.addToScene.bind(this);
        this.addToSceneAndOrbit = this.addToSceneAndOrbit.bind(this);
        this.onResize = this.onResize.bind(this);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, canvas:canvas});
        this.scene = new THREE.Scene();
        this.splittingView = new SplittingView(this.scene, this.renderer);
        this.splittingView.renderSignal.add(this.render.bind(this));
        this.camera = this.splittingView.camera;
        var firstSplit = this.splittingView.split("x", .33);
        //firstSplit[0].split("y", .33)[0].split("x", .33)[0].split("y", .33)[0].split("x", .33);
        firstSplit[0].split("y", .5);
        //var middleSplit = firstSplit[1].split("x", .5);
        //middleSplit[0].split("y", .5);
        //middleSplit[1].split("y", .66)[1].split("x", .66)[1].split("y", .66);

        this.splittingViewUI = new SplittingViewUI(this.splittingView, this.canvas);
        var _this = this;
        this.splittingViewUI.testPositionSignal.add(function(pos, size) {
            _.each(TestFactory.createBalls(1, 1, pos, 10 * size), _this.addToScene);
        });
        //stats
        stats = new Stats();
        $(document.body).append( stats.domElement );
        this.orbits = [];

        //tests

        var color = new THREE.Color(0xffffff);
        color.setRGB(Math.random(), Math.random(), Math.random());
        color.multiplyScalar(.2);
        this.addToScene(new THREE.AmbientLight(color.getHex()));
        var _this = this;
        _.each(TestFactory.createLights(2), _this.addToSceneAndOrbit);
        _.each(TestFactory.createBalls(300, 20, null, 15), _this.addToSceneAndOrbit);
        Global.startTime = new Date().getTime();
    },
    addToScene: function(thing){
        this.scene.add(thing);
    },
    addToSceneAndOrbit: function(thing){
        var pivot = new THREE.Object3D();
        pivot.add(thing);
        pivot.rotateBy = {
            x:(Math.random() - .5) * this.orbitSpeed, 
            y:(Math.random() - .5) * this.orbitSpeed, 
            z:(Math.random() - .5) * this.orbitSpeed
        };
        this.orbits.push(pivot);
        this.scene.add(pivot);
    },
    render:function() {
        
        for (var i = this.orbits.length - 1; i >= 0; i--) {
            this.orbits[i].rotateX(this.orbits[i].rotateBy.x);
            this.orbits[i].rotateY(this.orbits[i].rotateBy.y);
            this.orbits[i].rotateZ(this.orbits[i].rotateBy.z);
        };
        
        Global.now = new Date().getTime() - Global.startTime;
        this.splittingViewUI.update();
        //this.renderer.clear();
        //this.renderer.render(this.scene, this.camera);
        stats.update();
        //requestAnimationFrame(this.animate);
        //this.camera.rotation.y+=.01;
    },
    onResize:function(width, height) {
        this.splittingView.onResize(width, height);
        console.log("resize");
        //this.splittingViewUI.onResize(width, height);
        //this.canvas.width = width;
        //this.canvas.height = height;
    }
});
module.exports = DisplayManager;
