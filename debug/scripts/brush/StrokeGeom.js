define([
	'Class',
	'brush/StrokeBase',
	'TestFactory',
	'Global',
	'geometry/Utils',
	'signals',
	'MaterialLibrary'
], function(
	Class,
	BrushStrokeBase,
	TestFactory,
	Global,
	GeometryUtils,
	signals,
	MaterialLibrary
) {
	var StrokeGeom = new Class({
		Extends: BrushStrokeBase,
		geometry: null,
		material: null,
		totalTriangles: 0,
		cursor: 0,
		onStrokeFullSignal: null,
		localOffset: null,
		halfTurn: Math.PI * .5,
		initialize:function(paintBrush, initData) {
			this.onStrokeFullSignal = new signals.Signal();
			this.localOffset = new THREE.Vector3();
			if(initData && initData.buffers && initData.buffers.position && initData.buffers.rgba && initData.buffers.custom) {
				this.initData = initData;
			}
			this.parent(paintBrush);
		},

		start:function() {
			this.material = MaterialLibrary.strokeMaterial.clone();
			if(this.initData) {
				this.geometry = this.createGeometry(Number(this.initData.buffers.totalTriangles), false, this.initData);
			} else {
				this.geometry = this.createGeometry(GeometryUtils.chunkSize, true);
			}

			this.display = new THREE.Mesh( this.geometry, this.material );
		},

		createGeometry:function(triangles, dynamic, initData) {
			this.totalTriangles = triangles;
			var geometry = new THREE.BufferGeometry();

			var bufferSize = triangles + 2;

			geometry.addAttribute( 'index', Uint16Array, triangles * 3, 1 );
			geometry.addAttribute( 'position', Float32Array, bufferSize, 3 );
			geometry.addAttribute( 'rgba', Float32Array, bufferSize, 4 );
			geometry.addAttribute( 'custom', Float32Array, bufferSize, 3 );

			var indices = geometry.attributes.index.array;

			for ( var i = 0; i < indices.length; i ++ ) {
				indices[ i ] = i % 3 + ~~(i / 3);
			}

			var positions = geometry.attributes.position.array;
			var colors = geometry.attributes.rgba.array;
			var custom = geometry.attributes.custom.array;

			for ( var i = 0; i < positions.length; i ++ ) {
				positions[i] = 0;
			}

			for (var i = 0; i < colors.length; i++) {
				colors[i] = Math.random();
			}

			for (var i = 0; i < custom.length; i++) {
				custom[i] = 0;
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
			if(initData) {
				this.copyAttributeFromInitData(initData.buffers, geometry.attributes, 'position');
				this.copyAttributeFromInitData(initData.buffers, geometry.attributes, 'rgba');
				this.copyAttributeFromInitData(initData.buffers, geometry.attributes, 'custom');
				geometry.computeBoundingSphere();
			} else {
				if(dynamic) {
					geometry.dynamic = true;
					geometry.attributes.position.dynamic = true;
					geometry.attributes.rgba.dynamic = true;
					geometry.attributes.custom.dynamic = true;
				} else {
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'index');
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'position');
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'rgba');
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'custom');
					geometry.computeBoundingSphere();
				}
			}
			return geometry;
		},

		add:function(worldPos, size) {
			if(size > 0) {
				if(this.lastWorldPos) {
					this.halfTurn = -this.halfTurn;
					var radius = worldPos.length();
					var screenPos = worldPos.clone();
					this.paintBrush.projector.projectVector(screenPos, this.paintBrush.viewUI.viewUnderPen.camera);
					var lastScreenPos = this.lastWorldPos.clone();
					this.paintBrush.projector.projectVector(lastScreenPos, this.paintBrush.viewUI.viewUnderPen.camera);

					var localAngle = Math.atan2(lastScreenPos.y - screenPos.y, lastScreenPos.x - screenPos.x);
					this.localOffset.x = Math.cos(localAngle + this.halfTurn) * .01 * size;
					this.localOffset.y = Math.sin(localAngle + this.halfTurn) * .01 * size;
					var offsetScreenPos = screenPos.add(this.localOffset);
		            offsetScreenPos.z = .5;


					var drawToWorldPos = offsetScreenPos.clone();
					this.paintBrush.projector.unprojectVector(drawToWorldPos, this.paintBrush.viewUI.viewUnderPen.camera);
					drawToWorldPos.setLength(radius);

					var i3 = this.cursor * 3;
					var i4 = this.cursor * 4;
					this.cursor++;

					var positions = this.geometry.attributes.position.array;
					var rgba = this.geometry.attributes.rgba.array;
					var custom = this.geometry.attributes.custom.array;

					positions[ i3 ] = drawToWorldPos.x;
					positions[ i3 + 1 ] = drawToWorldPos.y;
					positions[ i3 + 2 ] = drawToWorldPos.z;

					rgba[ i4 ] = this.paintBrush.color.r;
					rgba[ i4 + 1 ] = this.paintBrush.color.g;
					rgba[ i4 + 2 ] = this.paintBrush.color.b;
					rgba[ i4 + 3 ] = this.paintBrush.color.a;

					custom[ i3 ] = Global.now;
					custom[ i3 + 1 ] = this.paintBrush.color.wave * this.fovCompensator * Global.brush.waveScale;
					custom[ i3 + 2 ] = this.paintBrush.color.shiver * this.fovCompensator * Global.brush.shiverScale;

					this.geometry.attributes.position.needsUpdate = true;
					this.geometry.attributes.rgba.needsUpdate = true;
					this.geometry.attributes.custom.needsUpdate = true;

					this.geometry.computeBoundingSphere();
					if(this.cursor == this.totalTriangles) this.onStrokeFullSignal.dispatch(this);
				}
				this.lastWorldPos = worldPos;
			}
		},

		finalize: function() {
			var scene = this.display.parent;
			this.display.parent.remove(this.display);
			if(this.cursor < 3) return;
			var geometry = this.createGeometry(this.cursor-2);
			this.geometry = geometry;
			this.display = new THREE.Mesh(this.geometry, this.material);
			scene.add(this.display);
		},

		copyAttribute: function(src, dst, attribute) {
			var srcAttribute = src[attribute].array;
			var dstAttribute = dst[attribute].array;
			for (var i = dstAttribute.length - 1; i >= 0; i--) {
				dstAttribute[i] = srcAttribute[i];
			};
		},

		copyAttributeFromInitData: function(src, dst, attribute) {
			var srcAttribute = src[attribute];
			var dstAttribute = dst[attribute].array;
			for (var i = dstAttribute.length - 1; i >= 0; i--) {
				dstAttribute[i] = srcAttribute[i];
			};
		}
	});
	return StrokeGeom;
});