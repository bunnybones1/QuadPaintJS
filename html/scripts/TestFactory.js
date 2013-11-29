var Class = require('./class/Class');

var TestFactory = new Class({
    initialize:function(values) {
        console.log("Initializing TestFactory");
    },
    createLights:function(total) {
        var lights = [];
        for (var i = total - 1; i >= 0; i--) {
            var color = new THREE.Color(0xffffff);
            color.setRGB(Math.random(), Math.random(), Math.random());
            var light = new THREE.PointLight(Math.random()*0xffffff, 3, 000);
            this.randomizePosition(light.position, 10000);
            lights.push(light);
        };
        console.log(lights);
        return lights;
    },
    createBalls:function(total, totalColors, position, radius) {
        radius = radius === undefined ? 50 : radius;
        var balls = [];
        var materials = [];
        var color = new THREE.Color(0xffffff);
        var colorAmbient = new THREE.Color(0xffffff);
        for (var i = totalColors - 1; i >= 0; i--) {
            color.setRGB(Math.random(), Math.random(), Math.random());
            var material = new THREE.MeshPhongMaterial(
                {
                    color:Math.random()*0xffffff, 
                    ambient:Math.random()*0xffffff,
                    light:true
                }
            );
            materials.push(material);
        };
        if(!this.sphereGeometry) this.sphereGeometry = new THREE.SphereGeometry(radius, 32, 16);
        for (var i = total - 1; i >= 0; i--) {
            var ball = new THREE.Mesh(this.sphereGeometry, materials[i%totalColors]);
            if(position) {
                ball.position = position;
            } else {
                this.randomizePosition(ball.position, 1000);
            }
            balls.push(ball);
        };
        return balls;
    },
    randomizePosition:function(position, magnitude) {
        var magnitudeHalf = magnitude * .5;
        position.x = Math.random() * magnitude - magnitudeHalf;
        position.y = Math.random() * magnitude - magnitudeHalf;
        position.z = Math.random() * magnitude - magnitudeHalf;

    }
});
module.exports = new TestFactory();
