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
			this.loadStrokes = this.loadStrokes.bind(this);
			this.onStrokeLoadedSignal = new signals.Signal();
		},
		begin: function (overrideMessage) {
			var name = window.prompt(overrideMessage ? overrideMessage : "Name painting.", "default");
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
				_this.loadStrokes();
			})
			.fail(function() {
				console.log( "load painting error" );
			})
		},
		loadStrokes: function() {
			var _this = this;
			var jqxhr = $.get( "load/" + this.paintingName + "/" + this.paintingJSON[this.strokeCursor]._id)
			.done(function() {
				console.log( "load stroke success" );
				_this.onStrokeLoadedSignal.dispatch(jqxhr.responseJSON[0]);
				_this.strokeCursor++;
				if(_this.strokeCursor < _this.strokeCursorTotal) _this.loadStrokes();
				else console.log("all strokes load complete.")
			})
			.fail(function() {
				console.log( "load stroke error" );
			})
		},
		saveStroke: function(stroke) {
			var total = 200;
			var data = {
				position: stroke.geometry.attributes.position.array,
				rgba: stroke.geometry.attributes.rgba.array,
				custom: stroke.geometry.attributes.custom.array,
				blendModeCurated: stroke.blendModeCurated,
				totalTriangles: stroke.totalTriangles
			}
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