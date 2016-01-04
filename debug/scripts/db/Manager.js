define([
	'Class',
	'Global',
	'signals'
], function(
	Class,
	Global,
	signals
){
	var DBManager = new Class({
		initialize:function() {
			console.log("Initializing DBManager");
			this.promptLoad = this.promptLoad.bind(this);
			this.saveStroke = this.saveStroke.bind(this);
			this.load = this.load.bind(this);
			this.loadNextStroke = this.loadNextStroke.bind(this);
			this.onStrokeLoadedSignal = new signals.Signal();
			this.onEmptySceneSignal = new signals.Signal();
		},
		begin: function (overrideMessage) {
			var name = Global.urlParams.painting;
			if(!name) name = window.prompt(overrideMessage ? overrideMessage : "Name painting.", "default");
			if(name) this.load(name);
			else this.begin("No, really. You can't start until you ateast name your painting.");
		},
		promptLoad:function() {
			var name = window.prompt("Load painting", "default");
			if(name) this.load(name);
		},
		load:function(name) {
			var _this = this;
			this.paintingName = name;
			var jqxhr = $.get( "load/" + name)
			.done(function() {
				_this.paintingJSON = jqxhr.responseJSON;
				console.log( "load painting success" );
				_this.strokeCursor = 0;
				_this.strokeCursorTotal = _this.paintingJSON.length;
				if(_this.strokeCursorTotal > 0) {
					_this.loadNextStroke();
				} else {
					_this.onEmptySceneSignal.dispatch();
				}
			})
			.fail(function() {
				console.log( "load painting error" );
			})
		},
		loadNextStroke: function() {
			var _this = this;
			var jqxhr = $.get( "load/" + this.paintingName + "/" + this.paintingJSON[this.strokeCursor]._id)
			.done(function() {
				console.log( "load stroke success" );
				var data = jqxhr.responseJSON[0];
				var buffers = data.buffers;
				var i;
				if(buffers['position[]'] !== undefined) {
					buffers.position = buffers['position[]'];
					buffers.rgba = buffers['rgba[]'];
					buffers.custom = buffers['custom[]'];
				}
				if(buffers.position !== undefined) {
					buffers.totalTriangles = Number(buffers.totalTriangles);
					if(isNaN(buffers.totalTriangles)) {
						console.log('hotfix triangle count');
						buffers.totalTriangles = (buffers.position.length / 3) - 2;
					}
					buffers.blendModeCurated = Number(buffers.blendModeCurated);
					for (i = 0; i < buffers.custom.length; i++) {
						buffers.custom[i] = Number(buffers.custom[i]);
					}
					for (i = 0; i < buffers.position.length; i++) {
						buffers.position[i] = Number(buffers.position[i]);
					}
					for (i = 0; i < buffers.rgba.length; i++) {
						buffers.rgba[i] = Number(buffers.rgba[i]);
					}
					_this.onStrokeLoadedSignal.dispatch(data);
				}
				_this.strokeCursor++;
				if(_this.strokeCursor < _this.strokeCursorTotal) _this.loadNextStroke();
				else console.log("all strokes load complete.");
			})
			.fail(function() {
				console.log( "load stroke error" );
			});
		},
		saveStroke: function(stroke) {
			var data = {
				position: stroke.geometry.attributes.position.array,
				rgba: stroke.geometry.attributes.rgba.array,
				custom: stroke.geometry.attributes.custom.array,
				blendModeCurated: stroke.blendModeCurated,
				totalTriangles: stroke.totalTriangles
			};
			var temp = [];
			for (var i = 0; i < data.position.length; i++) {
				temp[i] = data.position[i];
			};
			data.position = temp;
			temp = [];
			for (var i = 0; i < data.rgba.length; i++) {
				temp[i] = data.rgba[i];
			};
			data.rgba = temp;
			temp = [];
			for (var i = 0; i < data.custom.length; i++) {
				temp[i] = data.custom[i];
			};
			data.custom = temp;
			var dataString = JSON.stringify(data);
			var jqxhr = $.post( "save/" + this.paintingName, data, "json")
			.done(function() {
				console.log( "save painting success" );
			})
			.fail(function() {
				console.log( "save painting error" );
			})
		},
		generateDemoBuffer:function(total, size) {
			var buf = new Float32Array(total*size);
			for (var i = buf.length - 1; i >= 0; i--) {
				buf[i] = Math.random();
			};
			return buf;
		}
	});
	return DBManager;
});