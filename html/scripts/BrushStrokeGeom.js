var Class = require('./class/Class');
var BrushStrokeBase = require('./BrushStrokeBase');
var TestFactory = require('./TestFactory');
var Global = require('./Global');
var GeometryUtils = require('./GeometryUtils');

var BrushStrokeGeom = new Class({
	Extends: BrushStrokeBase,
	geometry: null,
	material: null,
	totalTriangles: 0,
	cursor: 0,
	onStrokeFullSignal: null,
	initialize:function(paintBrush) {
		this.onVertexShaderLoaded = this.onVertexShaderLoaded.bind(this);
		this.onFragmentShaderLoaded = this.onFragmentShaderLoaded.bind(this);
		this.onStrokeFullSignal = new signals.Signal();
		this.parent(paintBrush);
	},
	start:function() {
        this.display = TestFactory.createBalls(1, 1, null, 1)[0];
		Global.resourceManager.get("scripts/test.vsh", this.onVertexShaderLoaded);
		Global.resourceManager.get("scripts/test.fsh", this.onFragmentShaderLoaded);
	},
	onVertexShaderLoaded:function(data) {
		this.vertexShader = data;
		if(this.fragmentShader) this.startStroke();
	},
	onFragmentShaderLoaded:function(data) {
		this.fragmentShader = data;
		if(this.vertexShader) this.startStroke();
	},
	startStroke:function() {
		if(this.display.parent) {
			var deferredStage = this.display.parent;
			deferredStage.remove(this.display);
		}
		attributes = {
			rgba: {type:"c", value: null}
		};
		uniforms = {
		};
	
		var material = this.material = new THREE.ShaderMaterial({
		  uniforms: uniforms,
		  attributes: attributes,
		  vertexShader: this.vertexShader,
		  fragmentShader: this.fragmentShader,
		  transparent: true,
		  side: THREE.DoubleSide
		});
	
		var triangles = this.totalTriangles = GeometryUtils.chunkSize;
		var geometry = this.geometry = new THREE.BufferGeometry();

		geometry.addAttribute( 'index', Uint16Array, triangles * 3, 1 );
		geometry.addAttribute( 'position', Float32Array, triangles * 3, 3 );
		geometry.addAttribute( 'rgba', Float32Array, triangles * 3, 4 );

		var indices = geometry.attributes.index.array;

		for ( var i = 0; i < indices.length; i ++ ) {

			indices[ i ] = i % ( 3 * GeometryUtils.chunkSize );

		}

		var positions = geometry.attributes.position.array;
		var colors = geometry.attributes.rgba.array;

		var color = new THREE.Color();

		var n = 800, n2 = n/2;  // triangles spread in the cube
		var d = 12, d2 = d/2;   // individual triangle size

		var pA = new THREE.Vector3();
		var pB = new THREE.Vector3();
		var pC = new THREE.Vector3();

		var cb = new THREE.Vector3();
		var ab = new THREE.Vector3();

		for ( var i = 0; i < positions.length; i ++ ) {
			positions[i] = 0;
		}

		for (var i = 0; i < colors.length; i++) {
			colors[i] = Math.random();
		}

		geometry.offsets = [];

		var offsets = triangles / GeometryUtils.chunkSize;

		for ( var i = 0; i < offsets; i ++ ) {

			var offset = {
				start: i * GeometryUtils.chunkSize * 3,
				index: i * GeometryUtils.chunkSize * 3,
				count: Math.min( triangles - ( i * GeometryUtils.chunkSize ), GeometryUtils.chunkSize ) * 3
			};

			geometry.offsets.push( offset );

		}

		geometry.dynamic = true;
		geometry.attributes.position.dynamic = true;

		this.display = new THREE.Mesh( geometry, material );
		if(deferredStage) deferredStage.add(this.display);
	},
	add:function(pos, size) {
		if(size > 0) {
			var i = this.cursor * 9;
			this.cursor++;

			var positions = this.geometry.attributes.position.array;

			var d = size*4, d2 = d/2;	// individual triangle size

			var x = pos.x;
			var y = pos.y;
			var z = pos.z;

			var ax = x + Math.random() * d - d2;
			var ay = y + Math.random() * d - d2;
			var az = z + Math.random() * d - d2;

			var bx = x + Math.random() * d - d2;
			var by = y + Math.random() * d - d2;
			var bz = z + Math.random() * d - d2;

			var cx = x + Math.random() * d - d2;
			var cy = y + Math.random() * d - d2;
			var cz = z + Math.random() * d - d2;

			positions[ i ]     = positions[ i - 6 ];
			positions[ i + 1 ] = positions[ i - 5 ];
			positions[ i + 2 ] = positions[ i - 4 ];

			positions[ i + 3 ] = positions[ i - 3 ];
			positions[ i + 4 ] = positions[ i - 2 ];
			positions[ i + 5 ] = positions[ i - 1 ];

			positions[ i + 6 ] = cx;
			positions[ i + 7 ] = cy;
			positions[ i + 8 ] = cz;

			this.geometry.attributes.position.needsUpdate = true;

			this.geometry.computeBoundingSphere();
			if(this.cursor == this.totalTriangles) this.onStrokeFullSignal.dispatch();
		}
	}
});
module.exports = BrushStrokeGeom;