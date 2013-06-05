

var class_inherit = (function() {
	
	function proto_extend(proto, source) {
		if (source == null) {
			return;
		}
		if (typeof proto === 'function') {
			proto = proto.prototype;
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
			__proxy = function(args){
				
				if (_isArguments(args)) {
					return __super.apply(this, arguments);
				}
				
				return __super.apply(this, arguments);
			};
        
        return function(){
            this.super = __proxy;
            
            fn.apply(this, arguments);
        };
    }

	function inherit(_class, _base, _extends, original, _overrides) {
		
		var prototype = original,
			proto = original;

		prototype.constructor = _class.prototype.constructor;

		if (_extends != null) {
			proto['__proto__'] = {};

			arr_each(_extends, function(x) {
				proto_extend(proto['__proto__'], x);
			});
			proto = proto['__proto__'];
		}

		if (_base != null) {
			proto['__proto__'] = _base.prototype;
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