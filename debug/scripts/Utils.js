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
			object[valueKey+"ChangedSignal"] = new signals.Signal();
			//setter
			object["_"+valueKey] = object[valueKey]; 
			Object.defineProperty(object, valueKey,{
				set: function(val){
					this["_"+valueKey] = val;
					this[valueKey+"ChangedSignal"].dispatch(val);
				},
				get:  function(){
					return this["_"+valueKey];
				}
			});
		}
	};
	return Utils;
});