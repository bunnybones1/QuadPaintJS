define([
	'Class',
	'Global',
	'Utils',
	'three',
	'BlendUtils',
	'text!test.vsh',
	'text!test.fsh'
], function(
	Class,
	Global,
	Utils,
	three,
	BlendUtils,
	vertexShader,
	fragmentShader
){
	var StepperGUI = new Class({
		display: null,
		initialize:function(stepperObject, width, height, color) {
			this.height = height;
			this.stepHeight = height / stepperObject.total;
			this.stepperObject = stepperObject;

			var colorObj = new THREE.Color(color);
			
			var outlineGeometry = new THREE.PlaneGeometry(width, this.stepHeight - 4);
			var outlineMaterial = new THREE.MeshBasicMaterial(
				{
					color:colorObj.getHex(),
					transparent: true,
					wireframe: true
				}
			);

			var fillGeometry = new THREE.PlaneGeometry(width-4, (height/stepperObject.total)-8);
			var fillMaterial = new THREE.MeshBasicMaterial(
				{
					color:colorObj.getHex(),
					transparent: true
				}
			);

			this.fill = new THREE.Mesh(fillGeometry, fillMaterial);
			BlendUtils.jumpCuratedFloat(outlineMaterial, 1);

			this.display = new THREE.Object3D();

			for (var i = stepperObject.total - 1; i >= 0; i--) {
				var outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
				this.display.add(outline);
				outline.position.y = i * this.stepHeight - height * .5 + this.stepHeight * .5;
			};
			this.display.add(this.fill);

			Utils.activate(stepperObject.object, stepperObject.valueKey);
			this.update = this.update.bind(this);
			stepperObject.object[stepperObject.valueKey+"ChangedSignal"].add(this.update);
			this.update();
		},
		update: function() {
			this.fill.position.y = this.stepperObject.object[this.stepperObject.valueKey] / this.stepperObject.total * this.height - this.height * .5 + this.stepHeight*.5;
		}
	});
	return StepperGUI;
});