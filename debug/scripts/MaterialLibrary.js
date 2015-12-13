define([
	'Class',
	'three',
	'Global',
	'text!test.vsh',
	'text!test.fsh'
], function(
	Class,
	three,
	Global,
	vertexShader,
	fragmentShader
){
	var MaterialLibrary = new Class({
		strokeMaterial: null,
		initialize:function() {
			this.strokeMaterial = new THREE.ShaderMaterial({
				uniforms: {
					time: Global.timeUniform,
					brightness: Global.brightnessUniform,
					// Barrel Distortion uniforms:
					// LensCenter: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
					// ScreenCenter: {type: 'v2', value: new THREE.Vector2(0.5, 0.5)},
					// Scale: {type: 'v2', value: new THREE.Vector2(1, 1)},
					// ScaleIn: {type: 'v2', value: new THREE.Vector2(1, 1)},
					// HmdWarpParam: {type: 'v4', value: new THREE.Vector4(4, 1, 1, 1)}
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				transparent: true,
				// wireframe: true,
				side: THREE.DoubleSide,
				depthTest: false,
				depthWrite: false
			});
		}
	});
	return new MaterialLibrary();
});