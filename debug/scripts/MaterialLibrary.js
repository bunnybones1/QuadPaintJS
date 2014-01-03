define([
	'Class',
	'three',
	'text!test.vsh',
	'text!test.fsh'
], function(
	Class,
	three,
	vertexShader,
	fragmentShader
){
	var MaterialLibrary = new Class({
		strokeMaterial: null,
		initialize:function() {
			this.strokeMaterial = new THREE.ShaderMaterial({
				uniforms: {
					time: {type:"f", value: 0}
				},
				attributes: {
					rgba: {type:"c", value: null},
					custom: {type:"v3", value: null}
				},
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				transparent: true,
				side: THREE.DoubleSide,
				depthTest: false
			});
		}
	});
	return new MaterialLibrary();
});