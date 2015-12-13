function newBlankFloat32Attribute(totalItems, itemSize) {
	var length = totalItems * itemSize;
	var array = new Array(length);
	for (var i = 0; i < length; i++) {
		array[i] = 0;
	}

	return new THREE.Float32Attribute(array, itemSize);
}

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
		halfTurn: Math.PI * 0.5,
		initialize:function(paintBrush, initData) {
			this.onStrokeFullSignal = new signals.Signal();
			// console.log('new', initData ? 'with initData' : 'blank');

			this.localOffset = new THREE.Vector3();
			if(initData && initData.buffers && initData.buffers.position && initData.buffers.rgba && initData.buffers.custom) {
				this.initData = initData;
			}
			this.parent(paintBrush);
		},

		start:function() {
			this.material = MaterialLibrary.strokeMaterial.clone();
			this.material.uniforms.brightness = MaterialLibrary.strokeMaterial.uniforms.brightness;
			this.material.uniforms.time = MaterialLibrary.strokeMaterial.uniforms.time;
			if(this.initData) {
				this.geometry = this.createGeometry(Number(this.initData.buffers.totalTriangles), false, this.initData);
			} else {
				this.geometry = this.createGeometry(GeometryUtils.chunkSize, true);
			}

			this.display = new THREE.Mesh( this.geometry, this.material );
		},

		createGeometry:function(triangles, dynamic, initData) {
			this.totalTriangles = triangles;
			// console.log('total', triangles);
			var geometry = new THREE.BufferGeometry();

			var i;

			var indicesArray = [];
			var totalIndices;

			if(initData) {
				var breaks = initData.breaks || [];
				// console.log('breaks', breaks);
				totalIndices = triangles * 3;
				for ( i = 0; indicesArray.length < totalIndices; i ++ ) {
					var breakIndex = ~~(i / 3);
					// console.log('trying', breakIndex);
					if((breaks.indexOf(breakIndex) !== -1)) {
						// console.log('skipping', breakIndex);
					} else if((breaks.indexOf(breakIndex-1) !== -1)) {
						// console.log('skipping', breakIndex);
					} else {
						indicesArray.push(i % 3 + ~~(i / 3));
					}
				}
			} else {
				totalIndices = triangles * 3;
				for ( i = 0; i < totalIndices; i ++ ) {
					indicesArray[ i ] = i % 3 + ~~(i / 3);
				}
			}

			if(initData) {
				geometry.setIndex(new THREE.Uint16Attribute(indicesArray, 1));
				geometry.addAttribute( 'position', new THREE.Float32Attribute(initData.buffers.position, 3));
				geometry.addAttribute( 'rgba', new THREE.Float32Attribute(initData.buffers.rgba, 4));
				geometry.addAttribute( 'custom',  new THREE.Float32Attribute(initData.buffers.custom, 3));
				geometry.breaks = initData.breaks;
				geometry.computeBoundingBox();
				geometry.computeBoundingSphere();
			} else {
				var bufferSize = triangles + 2;
				geometry.setIndex(new THREE.Uint16Attribute(indicesArray, 1));
				geometry.addAttribute( 'position', newBlankFloat32Attribute(bufferSize, 3));
				geometry.addAttribute( 'rgba', newBlankFloat32Attribute(bufferSize, 4));
				geometry.addAttribute( 'custom',  newBlankFloat32Attribute(bufferSize, 3));
				if(dynamic) {
					geometry.dynamic = true;
					geometry.attributes.position.dynamic = true;
					geometry.attributes.rgba.dynamic = true;
					geometry.attributes.custom.dynamic = true;
				} else {
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'position');
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'rgba');
					this.copyAttribute(this.geometry.attributes, geometry.attributes, 'custom');
					geometry.computeBoundingBox();
					geometry.computeBoundingSphere();
				}
			}
			return geometry;
		},

		add:function(worldPos, size, angle) {
			// console.log('add');
			if(size > 0 && this.paintBrush.viewUI.viewUnderPen) {
				if(angle !== undefined || this.lastWorldPos) {
					var camera = this.paintBrush.viewUI.viewUnderPen.camera;
					this.halfTurn = -this.halfTurn;
					var radius = worldPos.length();
					var screenPos = worldPos.clone();
					screenPos.project(camera);
					if(angle === undefined) {
						var lastScreenPos = this.lastWorldPos.clone();
						lastScreenPos.project(camera);
						angle = Math.atan2(lastScreenPos.y - screenPos.y, lastScreenPos.x - screenPos.x);
					}

					var turnedAngle = angle + this.halfTurn;
					var localSize = 0.5 * size;
					this.localOffset.x = Math.cos(turnedAngle) * localSize / camera.aspect;
					this.localOffset.y = Math.sin(turnedAngle) * localSize;
					var offsetScreenPos = screenPos.add(this.localOffset);
		            offsetScreenPos.z = 0.5;


					var drawToWorldPos = offsetScreenPos.clone();
					drawToWorldPos.unproject(camera);
					drawToWorldPos.setLength(radius);

					this.addExplicitWorldPoint(drawToWorldPos);

					if(this.cursor == this.totalTriangles) {
						this.onStrokeFullSignal.dispatch(this);
					} else {
						var temp = this.doubledOnStart;
						this.doubledOnStart = true;
						if(!temp) {
							this.add(worldPos, size, angle);
						}
					} 
				}
				this.lastWorldPos = worldPos;
			}
		},

		addExplicitWorldPoint: function(worldPoint) {
			var i3 = this.cursor * 3;
			var i4 = this.cursor * 4;
			this.cursor++;

			var positions = this.geometry.attributes.position.array;
			var rgba = this.geometry.attributes.rgba.array;
			var custom = this.geometry.attributes.custom.array;

			positions[ i3 ] = worldPoint.x;
			positions[ i3 + 1 ] = worldPoint.y;
			positions[ i3 + 2 ] = worldPoint.z;

			rgba[ i4 ] = this.paintBrush.color.r;
			rgba[ i4 + 1 ] = this.paintBrush.color.g;
			rgba[ i4 + 2 ] = this.paintBrush.color.b;
			rgba[ i4 + 3 ] = this.paintBrush.color.a * this.paintBrush.fadeByTilt;

			custom[ i3 ] = Global.now;
			custom[ i3 + 1 ] = this.paintBrush.color.wave * this.fovCompensator * Global.brush.waveScale;
			custom[ i3 + 2 ] = this.paintBrush.color.shiver * this.fovCompensator * Global.brush.shiverScale;

			this.geometry.attributes.position.needsUpdate = true;
			this.geometry.attributes.rgba.needsUpdate = true;
			this.geometry.attributes.custom.needsUpdate = true;

			this.geometry.computeBoundingBox();
			this.geometry.computeBoundingSphere();
		},

		finalize: function() {
			var scene = this.display.parent;
			this.display.parent.remove(this.display);
			this.display.geometry.dispose();
			if(this.cursor < 3) return;
			var geometry = this.createGeometry(this.cursor-2);
			this.geometry = geometry;
			this.display = new THREE.Mesh(this.geometry, this.material);
			scene.add(this.display);
		},

		copyData: function(src, dst, name, srcOffset, dstOffset, length) {
			var srcAttribute = src[name];
			var dstAttribute = dst[name];
			srcOffset = srcOffset || 0;
			dstOffset = dstOffset || 0;
			length = length || dstAttribute.length;
			for (var i = 0; i < length; i++) {
				dstAttribute[i + dstOffset] = Number(srcAttribute[i + srcOffset]);
			}
		},

		copyAttribute: function(src, dst, name) {
			var srcAttribute = src[name].array;
			var dstAttribute = dst[name].array;
			for (var i = 0, l = dstAttribute.length; i < l; i++) {
				dstAttribute[i] = srcAttribute[i];
			}
		},

		copyAttributeFromInitData: function(src, dst, name) {
			var srcAttribute = src[name];
			var dstAttribute = dst[name].array;
			for (var i = 0, l = dstAttribute.length; i < l; i++) {
				dstAttribute[i] = srcAttribute[i];
			}
		},

		copyInitDataFromAttribute: function(src, dst, name) {
			var srcAttribute = src[name].array;
			var dstAttribute = dst[name];
			var length = Math.min(dstAttribute.length, srcAttribute.length);
			for (var i = 0; i < length; i++) {
				dstAttribute[i] = srcAttribute[i];
			}
		},

		integrateData: function(data) {
			// console.log('integrating data', data.buffers.totalTriangles);
			var oldGeometry = this.display.geometry;

			var oldBufferSize = (oldGeometry.attributes.position.array.length / 3);
			var newBufferSize = Number(data.buffers.totalTriangles) + 2;
			var aggragateBufferSize = oldBufferSize + newBufferSize;

			var aggragateTotalTriangles = Number(this.totalTriangles) + Number(data.buffers.totalTriangles);

			var newInitData = {
				buffers: {
					position: new Array(aggragateBufferSize * 3),
					rgba: new Array(aggragateBufferSize * 4),
					custom: new Array(aggragateBufferSize * 3)
				},
				breaks: oldGeometry.breaks || []
			};

			newInitData.breaks.push(oldBufferSize - 2);

			this.copyInitDataFromAttribute(oldGeometry.attributes, newInitData.buffers, 'position');
			this.copyInitDataFromAttribute(oldGeometry.attributes, newInitData.buffers, 'rgba');
			this.copyInitDataFromAttribute(oldGeometry.attributes, newInitData.buffers, 'custom');

			this.copyData(data.buffers, newInitData.buffers, 'position', 0, oldBufferSize * 3, newBufferSize * 3);
			this.copyData(data.buffers, newInitData.buffers, 'rgba', 0, oldBufferSize * 4, newBufferSize * 4);
			this.copyData(data.buffers, newInitData.buffers, 'custom', 0, oldBufferSize * 3, newBufferSize * 3);

			var newGeometry = this.createGeometry(aggragateTotalTriangles, false, newInitData);
			this.geometry = newGeometry;
			this.display.geometry = newGeometry;
			oldGeometry.dispose();

			data.buffers.position = [];
			data.buffers.rgba = [];
			data.buffers.custom = [];
		},
		integrateStroke: function(stroke) {
			// console.log('integrating stroke', stroke.totalTriangles);
			var attributes = stroke.display.geometry.attributes;
			this.integrateData({
				buffers: {
					position: attributes.position.array,
					rgba: attributes.rgba.array,
					custom: attributes.custom.array,
					totalTriangles: stroke.totalTriangles
				}
			});
		}
	});
	return StrokeGeom;
});