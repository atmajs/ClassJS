var class_inherit,
	class_inheritStatics,
	class_extendProtoObjects
	;

(function(){
	
	var PROTO = '__proto__';
	
	var _toString = Object.prototype.toString,
		_isArguments = function(args){
			return _toString.call(args) === '[object Arguments]';
		};
	
	
	class_inherit = PROTO in Object.prototype
		//? inherit_Object_create
		? inherit
		: inherit_protoLess
		;
	
	class_inheritStatics = function(_class, mix){
		if (mix == null) 
			return;
		
		if (is_ArrayLike(mix)) {
			var i = mix.length;
			while ( --i > -1 ) {
				class_inheritStatics(_class, mix[i]);
			}
			return;
		}
		
		var Static;
		if (is_Function(mix)) 
			Static = mix;
		else if (is_Object(mix.Static)) 
			Static = mix.Static;
		
		
		if (Static == null)
			return;
		
		obj_extendDescriptorsDefaults(_class, Static);
	};
	
	
	class_extendProtoObjects = function(proto, _base, _extends){
		var key,
			protoValue;
			
		for (key in proto) {
			protoValue = proto[key];
			
			if (!is_rawObject(protoValue))
				continue;
			
			if (_base != null){
				if (is_rawObject(_base.prototype[key])) 
					obj_defaults(protoValue, _base.prototype[key]);
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x){
					x = proto_getProto(x);
					
					if (is_rawObject(x[key])) 
						obj_defaults(protoValue, x[key]);
				});
			}
		}
	}
	
	// PRIVATE
	function proto_extend(proto, source) {
		if (source == null) 
			return;
		
		if (typeof proto === 'function') 
			proto = proto.prototype;
		
		if (typeof source === 'function') 
			source = source.prototype;
		
		var key, val;
		for (key in source) {
			if (key === 'constructor') 
				continue;
			
			val = source[key];
			if (val != null) 
				proto[key] = val;
		}
	}
	
	function proto_override(super_, fn) {
        var proxy;
		
		if (super_) {
			proxy = function(mix){
				
				var args = arguments.length === 1 && _isArguments(mix)
					? mix
					: arguments
					;
				
				return  fn_apply(super_, this, args);
			}
		} else{
			proxy = fn_doNothing;
		}
		
        
        return function(){
            this['super'] = proxy;
            
            return fn_apply(fn, this, arguments);
        };
    }

	function inherit(_class, _base, _extends, original, _overrides, defaults) {
		var prototype = original,
			proto = original;

		prototype.constructor = _class.prototype.constructor;

		if (_extends != null) {
			proto[PROTO] = {};

			arr_each(_extends, function(x) {
				proto_extend(proto[PROTO], x);
			});
			proto = proto[PROTO];
		}

		if (_base != null) 
			proto[PROTO] = _base.prototype;
		
		for (var key in defaults) {
			if (prototype[key] == null) 
				prototype[key] = defaults[key];
		}
		for (var key in _overrides) {
			prototype[key] = proto_override(prototype[key], _overrides[key]);
		}
		
		
		_class.prototype = prototype;
	}
	function inherit_Object_create(_class, _base, _extends, original, _overrides, defaults) {
		
		if (_base != null) {
			_class.prototype = Object.create(_base.prototype);
			obj_extendDescriptors(_class.prototype, original);
		} else {
			_class.prototype = Object.create(original);
		}
		
		_class.prototype.constructor = _class;
		
		if (_extends != null) {
			arr_each(_extends, function(x) {
				obj_defaults(_class.prototype, x);
			});
		}
		
		var proto = _class.prototype;
		obj_defaults(proto, defaults);
		for (var key in _overrides) {
			proto[key] = proto_override(proto[key], _overrides[key]);
		}
	}


	// browser that doesnt support __proto__ 
	function inherit_protoLess(_class, _base, _extends, original, _overrides, defaults) {
		
		if (_base != null) {
			var tmp = function() {};

			tmp.prototype = _base.prototype;

			_class.prototype = new tmp();
			_class.prototype.constructor = _class;
		}
		
		if (_extends != null) {
			arr_each(_extends, function(x) {
				
				delete x.constructor;
				proto_extend(_class, x);
			});
		}
		
		var prototype = _class.prototype;
		obj_defaults(prototype, defaults);
		
		for (var key in _overrides) {
			prototype[key] = proto_override(prototype[key], _overrides[key]);
		}
		proto_extend(_class, original); 
	}
	
		
	function proto_getProto(mix) {
		
		return is_Function(mix)
			? mix.prototype
			: mix
			;
	}
	
}());