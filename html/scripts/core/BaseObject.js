var Class = require('./../class/Class');
var BaseObject = new Class({
	name: undefined,
	initialize : function(values) {
		this.setParams(values);
	},
	setParams: function(values) {
		if ( values === undefined ) return;

		for ( var key in values ) {
			var newValue = values[ key ];
			if ( newValue === undefined ) {
				// console.warn( 'BaseObject: \'' + key + '\' parameter is undefined.' );
				continue;
			}

			if ( key in this ) {
				this[ key ] = newValue;
			}
		}
	}
});
module.exports = BaseObject;
