var Class = require('./class/Class');

var ResourceManager = new Class({
	dataByURLs: null,
	callbacksByURLs: null,
	initialize:function() {
		this.dataByURLs = {};
		this.callbacksByURLs = {};
	},
	get:function(url, callback) {
		if(this.dataByURLs[url]) {
			callback(this.dataByURLs[url]);
			return;
		} else if(this.callbacksByURLs[url]) {
			this.callbacksByURLs.push(callback);
			return;
		} else {
			var callbacks = [callback];
			this.callbacksByURLs[url] = callbacks;
			var _this = this;
			$.ajax({
				url:url
			}).done(function(data) {
				_this.dataByURLs[url] = data;
				for (var i = callbacks.length - 1; i >= 0; i--) {
					callbacks[i](data);
				};
				delete _this.callbacksByURLs[url];
			})
		}
	}
});
module.exports = ResourceManager;