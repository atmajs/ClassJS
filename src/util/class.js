var class_register,
	class_get,
	
	class_stringify,
	class_parse
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
	
	class_stringify = function(class_){
		
		return JSON.stringify(class_, stringify);
	};
	
	class_parse = function(str){
		
		return JSON.parse(str, parse);
	};
	
	
	// private
	
	function stringify(key, val) {
		
		if (val == null || typeof val !== 'object') 
			return val;
		
		var current = this,
			obj = current[key]
			;
		
		if (obj[str_CLASS_IDENTITY] && obj.toJSON) {
			
			val[str_CLASS_IDENTITY] = obj[str_CLASS_IDENTITY];
			return val;
		}
		
		
		return val;
	}
	
	function parse(key, val) {
		
		var Ctor;
		
		if (val != null && typeof val === 'object' && val[str_CLASS_IDENTITY]) {
			Ctor = Class(val[str_CLASS_IDENTITY]);
		
			if (typeof Ctor === 'function') {
				
				val = new Ctor(val);
			} else {
				
				console.error('<class:parse> Class was not registered', val[str_CLASS_IDENTITY]);
			}
		}
		
		return val;
	}
	
}());