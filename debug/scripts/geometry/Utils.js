define([
	'Class'
], function(
	Class
) {
	var GeometryUtils = new Class({
		// break geometry into
		// chunks of 21,845 triangles (3 unique vertices per triangle)
		// for indices to fit into 16 bit integer number
		// floor(2^16 / 3) = 21845
	    maxIndices: 65536,
	    chunkSize: 21845,
	    initialize:function() {
	    }
	});
	return new GeometryUtils();
});
