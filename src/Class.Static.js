/**
 * Can be used in Constructor for binding class's functions to class's context
 * for using, for example, as callbacks
 *
 * @obsolete - use 'Self' property instead
 */
Class.bind = function(cntx) {
	var arr = arguments,
		i = 1,
		length = arguments.length,
		key;

	for (; i < length; i++) {
		key = arr[i];
		cntx[key] = cntx[key].bind(cntx);
	}
	return cntx;
};

Class.cfg = function(mix, value){
	
	if (is_String(mix)) {
		
		if (arguments.length === 1) 
			return _cfg[mix];
		
		_cfg[mix] = value;
		return;
	}
	
	if (is_Object(mix)) {
		
		for(var key in mix){
			
			Class.cfg(key, mix[key]);
		}
	}
};
Class.mixin = function (base /**, ...mixins */) {
	return Class({
		Base: base,
		Extends: _Array_slice.call(arguments, 1)
	});
}



Class.Model = {};
Class.Serializable = Serializable;
Class.Deferred = Deferred;
Class.EventEmitter = EventEmitter;
Class.Await = Await;
Class.validate = obj_validate;

Class.stringify = class_stringify;
Class.parse = class_parse;
Class.patch = class_patch;
Class.properties = class_properties;