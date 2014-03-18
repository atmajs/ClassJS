var class_register,
	class_get,
	
	class_patch,
	
	class_stringify,
	class_parse,
	class_properties
	
	;

(function(){
	
	class_register = function(namespace, class_){
		
		obj_setProperty(
			_cfg.ModelHost || Class.Model,
			namespace,
			class_
		);
	};
	
	class_get = function(namespace){
		
		return obj_getProperty(
			_cfg.ModelHost || Class.Model,
			namespace
		);
	};
	
	class_patch = function(mix, Proto){
		
		var class_ = is_String(mix)
			? class_get(mix)
			: mix
			;
			
		// if DEBUG
		!is_Function(class_)
			&& console.error('<class:patch> Not a Function', mix);
		// endif
			
		Proto.Base = class_;
		
		class_ = Class(Proto);
		
		if (is_String(mix)) 
			class_register(mix, class_);
		
		return class_;
	};
	
	class_stringify = function(class_){
		
		return JSON.stringify(class_, stringify);
	};
	
	class_parse = function(str){
		
		return JSON.parse(str, parse);
	};
	
	class_properties = function(Ctor) {
		return getProperties(Ctor);
	};
	
	// private
	
	function stringify(key, val) {
		
		if (val == null || typeof val !== 'object') 
			return val;
		
		var current = this,
			obj = current[key]
			;
		
		if (obj[str_CLASS_IDENTITY] && obj.toJSON) {
			
			return stringifyMetaJSON(obj[str_CLASS_IDENTITY], val)
			
			////val[str_CLASS_IDENTITY] = obj[str_CLASS_IDENTITY];
			////return val;
		}
		
		
		return val;
	}
	
	function stringifyMetaJSON(className, json){
		var out = {};
		out['json'] = json;
		out[str_CLASS_IDENTITY] = className;
		
		return out;
	}
	
	function parse(key, val) {
		
		var Ctor;
		
		if (val != null && typeof val === 'object' && val[str_CLASS_IDENTITY]) {
			Ctor = Class(val[str_CLASS_IDENTITY]);
		
			if (typeof Ctor === 'function') {
				
				val = new Ctor(val.json);
			} else {
				
				console.error('<class:parse> Class was not registered', val[str_CLASS_IDENTITY]);
			}
		}
		
		return val;
	}
	
	function getProperties(proto, out){
		if (typeof proto === 'function')
			proto = proto.prototype;
		
		if (out == null) 
			out = {};
		
		var type,
			key
        for(key in proto){
            type = proto[key] == null
				? null
				: typeof proto[key]
				;
				
            if (type === 'function')
				continue;
			
			var c = key.charCodeAt(0);
			if (c === 95 && key !== '_id')
				// _
				continue;
			
			if (c >= 65 && c <= 90)
				// A-Z
				continue;
			
            out[key] = type;
        }
        
        if (proto.__proto__) 
            getProperties(proto.__proto__, out);
        
        return out;
    }
	
}());