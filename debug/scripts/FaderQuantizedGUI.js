define([
	'Class',
	'Global',
	'Utils',
	'three',
	'TestFactory',
	'_',
	'FaderGUI',
	'BlendUtils',
	'text!test.vsh',
	'text!test.fsh'
], function(
	Class,
	Global,
	Utils,
	three,
	TestFactory,
	_,
	FaderGUI,
	BlendUtils,
	vertexShader,
	fragmentShader
){
	var FaderGUI = new Class({
		display: null,
		initialize:function(faderObject, width, height, color) {
			this.faderObject = faderObject;

			var colorObj = new THREE.Color(color);
			
			var outlineGeometry = new THREE.PlaneGeometry(width, height);
			var outlineMaterial = new THREE.MeshBasicMaterial(
				{
					color:colorObj.getHex(),
					transparent: true,
					wireframe: true
				}
			);
			this.outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
			

			var fillGeometry = new THREE.PlaneGeometry(width-4, height-4);
			var fillMaterial = new THREE.MeshBasicMaterial(
				{
					color:colorObj.getHex(),
					transparent: true
				}
			);

			this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
			this.fillPivot = new THREE.Object3D();
			this.fillPivot.add(this.fill);
			this.fill.position.y += (height - 4) * .5;
			this.fillPivot.position.y -= (height - 4) * .5;
			BlendUtils.jumpCuratedFloat(outlineMaterial, 1);

			this.display = new THREE.Object3D();
			this.display.add(this.outline);
			this.display.add(this.fillPivot);

			Utils.activate(faderObject.object, faderObject.valueKey);
			this.update = this.update.bind(this);
			faderObject.object[faderObject.valueKey+"ChangedSignal"].add(this.update);
		},
		update: function() {
			this.fillPivot.scale.y = this.faderObject.object[this.faderObject.valueKey];
			if(this.fillPivot.scale.y == 0) this.fillPivot.scale.y = .0001;
		}
	});
	return FaderGUI;
});