define([
	'Class',
	'three'
], function(
	Class,
	three
) {
	var BlendUtils = new Class({
	    initialize:function() {
			this.equation = [
				THREE.AddEquation,
				THREE.SubtractEquation,
				THREE.ReverseSubtractEquation
			];
			this.src = [
				THREE.ZeroFactor,
				THREE.OneFactor,
				THREE.SrcColorFactor,
				THREE.OneMinusSrcColorFactor,
				THREE.SrcAlphaFactor,
				THREE.OneMinusSrcAlphaFactor,
				THREE.DstAlphaFactor,
				THREE.OneMinusDstAlphaFactor,
				THREE.DstColorFactor,
				THREE.OneMinusDstColorFactor,
				THREE.SrcAlphaSaturateFactor
			];
			this.dst = [
				THREE.ZeroFactor,
				THREE.OneFactor,
				THREE.SrcColorFactor,
				THREE.OneMinusSrcColorFactor,
				THREE.SrcAlphaFactor,
				THREE.OneMinusSrcAlphaFactor,
				THREE.DstAlphaFactor,
				THREE.OneMinusDstAlphaFactor
			];
			this.curatedModes = [
				//index	//alpha high	//alpha mid 	//alpha low
				//12,	//normal and screen, based on alpha
				//20,	//normal and screen, based on alpha
				//28,	//normal and screen, based on alpha
				37, 	//normal						//blank
				38, 	//screen						//blank
				34,		//screenish		//normal		//multiply
				//42, 	//multiply with screen on low alpha
				68,		//overlay up	//overlay mid 	//overlay down
				//75,	//inversion with hue reverse
				76, 	//screen						//invert
				//109, 	//normal with inversion on low alpha
				//117, 	//normal with inversion on low alpha
				165 	//invert				//invert multiply
			]
			this.totalCurated = this.curatedModes.length;
			this.total = this.equation.length * this.src.length * this.dst.length;
			/*
			for (var i = 0; i < this.total; i++) {
				this.jump(null, i);
			};
			*/
	    },
	    jumpFloat: function(material, float) {
	    	var index = ~~(this.total * float);
	    	this.jump(material, Math.min(index, this.total-1));
	    },
	    jumpCuratedFloat: function(material, float) {
	    	var index = ~~(this.totalCurated * float);
	    	this.jumpCurated(material, Math.min(index, this.totalCurated-1));
	    },
	    jumpCurated: function(material, index) {
	    	this.jump(material, this.curatedModes[Math.min(index, this.totalCurated-1)]);
	    },
	    jump: function(material, index) {
	    	var equation = ~~(index / this.dst.length / this.src.length);
	    	var src = ~~((index / this.dst.length) % this.src.length);
	    	var dst = ~~(index % this.dst.length);
	    	if(material) {
		    	material.blending = THREE.CustomBlending;
		    	material.blendSrc = this.src[~~src];
		    	material.blendDst = this.dst[~~dst];
		    	material.blendEquation = this.equation[~~equation];
		    }
	    	//console.log(index, src, dst, equation);
	    }
	});
	return new BlendUtils();
});
