var Class = require('./class/Class');

var TestFactory = new Class({
    initialize:function(values) {
        console.log("Initializing TestFactory");
        this.sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
    },
    createLights:function(total) {
        var lights = [];
        for (var i = total - 1; i >= 0; i--) {
            var color = new THREE.Color(0xffffff);
            color.setRGB(Math.random(), Math.random(), Math.random());
            var light = new THREE.PointLight(Math.random()*0xffffff, 30, 000);
            this.randomizePosition(light.position, 10000);
            lights.push(light);
        };
        return lights;
    },
    createBalls:function(total, totalColors, position, radius) {
        if(radius == 0) return;
        radius = radius === undefined ? 50 : radius;
        var balls = [];
        var materials = [];
        var color = new THREE.Color(0xffffff);
        var colorAmbient = new THREE.Color(0xffffff);
        var colorSpecular = new THREE.Color(0xffffff);
        var colorEmissive = new THREE.Color(0xffffff);
        for (var i = totalColors - 1; i >= 0; i--) {
            color.setRGB(Math.random(), Math.random(), Math.random());
            color.multiplyScalar(.1);
            colorAmbient.setRGB(Math.random(), Math.random(), Math.random());
            colorSpecular.setRGB(Math.random(), Math.random(), Math.random());
            colorSpecular.multiplyScalar(Math.random());
            colorEmissive.setRGB(
                Math.max(0, Math.min(1, (Math.random()-.9) * 10)), 
                Math.max(0, Math.min(1, (Math.random()-.9) * 10)), 
                Math.max(0, Math.min(1, (Math.random()-.9) * 10))
                );
            var material = new THREE.MeshPhongMaterial(
                {
                    color:color.getHex(), 
                    ambient:colorAmbient.getHex(),
                    emissive: colorEmissive.getHex(),
                    light:true,
                    shininess: Math.pow(Math.random(), 4) * 200
                }
            );
            materials.push(material);
        };
        for (var i = total - 1; i >= 0; i--) {
            var ball = new THREE.Mesh(this.sphereGeometry, materials[i%totalColors]);
            ball.scale.x = ball.scale.y = ball.scale.z = radius;
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
