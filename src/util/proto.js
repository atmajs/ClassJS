

var class_inherit = (function() {
	
	var PROTO = '__proto__';
	
	function proto_extend(proto, source) {
		if (source == null) {
			return;
		}
		if (typeof proto === 'function') {
			proto = proto.prototype;
		}
	
		if (typeof source === 'function') {
			source = source.prototype;
		}
		
		for (var key in source) {
			proto[key] = source[key];
		}
	}
	
	var _toString = Object.prototype.toString,
		_isArguments = function(args){
			return _toString.call(args) === '[object Arguments]';
		};
	
	
	function proto_override(proto, key, fn) {
        var __super = proto[key],
			__proxy = __super == null
				? function() {}
				: function(args){
				
					if (_isArguments(args)) {
						return __super.apply(this, args);
					}
					
					return __super.apply(this, arguments);
				};
        
        return function(){
            this.super = __proxy;
            
            return fn.apply(this, arguments);
        };
    }

	function inherit(_class, _base, _extends, original, _overrides) {
		
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

		if (_base != null) {
			proto[PROTO] = _base.prototype;
		}

		
		if (_overrides != null) {
			for (var key in _overrides) {
				prototype[key] = proto_override(prototype, key, _overrides[key]);
			}
		}
		
		_class.prototype = prototype;
	}


	// browser that doesnt support __proto__ 
	function inherit_protoLess(_class, _base, _extends, original) {
		if (_base != null) {
			var tmp = function() {};

			tmp.prototype = _base.prototype;

			_class.prototype = new tmp();
			_class.prototype.constructor = _class;
		}

		proto_extend(_class.prototype, original);


		if (_extends != null) {
			arr_each(_extends, function(x) {
				var a = {};
				proto_extend(a, x);
				
				delete a.constructor;
				for (var key in a) {
					_class.prototype[key] = a[key];
				}
			});
		}
	}

	return '__proto__' in Object.prototype === true ? inherit : inherit_protoLess;

}());

function proto_getProto(mix) {
	if (typeof mix === 'function') {
		return mix.prototype;
	}
	return mix;
}

var class_inheritStatics = function(_class, mix){
	if (mix == null) {
		return;
	}
	
	if (typeof mix === 'function') {
		for (var key in mix) {
			if (typeof mix[key] === 'function' && mix.hasOwnProperty(key) && _class[key] == null) {
				_class[key] = mix[key];
			}
		}
		return;
	}
	
	if (Array.isArray(mix)) {
		var imax = mix.length,
			i = 0;
		
		// backwards for proper inhertance flow
		while (imax-- !== 0) {
			class_inheritStatics(_class, mix[i++]);
		}
		return;
	}
	
	if (mix.Static) {
		mix = mix.Static;
		for (var key in mix) {
			if (mix.hasOwnProperty(key) && _class[key] == null) {
				_class[key] = mix[key];
			}
		}
		return;
	}
};

function class_extendProtoObjects(proto, _base, _extends){
	var key,
		protoValue;
		
	for (key in proto) {
		protoValue = proto[key];
		
		if (!obj_isRawObject(protoValue))
			continue;
		
		if (_base != null){
			if (obj_isRawObject(_base.prototype[key])) 
				obj_defaults(protoValue, _base.prototype[key]);
		}
		
		if (_extends != null) {
			arr_each(_extends, function(x){
				x = proto_getProto(x);
				
				if (obj_isRawObject(x[key])) 
					obj_defaults(protoValue, x[key]);
			});
		}
	}
}