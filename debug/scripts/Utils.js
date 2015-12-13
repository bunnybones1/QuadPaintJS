define([
	'Class',
	'signals'
],function(
	Class,
	signals
){

	var Utils = new Class({

	});
	Utils.debug = false;
	Utils.activate = function(object, valueKey) {
		//validate object
		if(valueKey in object && !(("_"+valueKey) in object)) {
			//set up a signal and a getter/setter pair
			//signal
			var signal = new signals.Signal();
			var hiddenValueKey = "_" + valueKey;
			object[valueKey+"ChangedSignal"] = signal;
			//setter
			object[hiddenValueKey] = object[valueKey]; 
			Object.defineProperty(object, valueKey, {
				set: function(val){
					this[hiddenValueKey] = val;
					signal.dispatch(val);
				},
				get:  function(){
					return this[hiddenValueKey];
				}
			});
		}
	};
	return Utils;
});