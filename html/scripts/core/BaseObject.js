define([
	'Class'
],function(
	Class
) {
	var BaseClass = new Class({
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
	return BaseClass;
});