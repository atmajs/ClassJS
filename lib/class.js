(function(global) {

	var helper = {
		each: function(arr, fn) {
			if (arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) {
				return;
			}
			switch (typeof x) {
			case 'function':
				prototype = x.prototype;
				break;
			case 'object':
				prototype = x;
				break;
			default:
				return;
			}
			for (var key in prototype) {
				proto[key] = prototype[key];
			}
		},

		extendClass: function(_class, _base, _extends, original) {
			
			if (typeof original !== 'object') {
				return;
			}

			this.extendPrototype = original['__proto__'] == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, _base, _extends, original);
		},
		proto: function(_class, _base, _extends, original) {
			var prototype = original,
				proto = original;
			
			prototype.constructor = _class.prototype.constructor;
			
			if (_extends != null) {
				proto['__proto__'] = {};
				
				helper.each(_extends, function(x) {					
					helper.extendProto(proto['__proto__'], x);
				});
				proto = proto['__proto__'];
			}
			
			if (_base != null) {
				proto['__proto__'] = _base.prototype;
			}

			_class.prototype = prototype;			
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, _base, _extends, original) {

			if (_base != null) {
				var proto = {},
					tmp = function(){};
					
				tmp.prototype = _base.prototype;
				
				_class.prototype = new tmp();				
				_class.prototype.constructor = _class;
			}
			
			helper.extendProto(_class.prototype, original);
			
			
			if (_extends != null) {				
				helper.each(_extends, function(x){
					var a = {};
					helper.extendProto(a, x);
					delete a.constructor;
					for(var key in a){
						_class.prototype[key] = a[key];
					}
				});				
			}
		}
	};

	global.Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			key;
			
		if (_base != null) {
			delete data.Base;
		}
		if (_extends != null) {
			delete data.Extends;
		}
		if (_static != null) {
			delete data.Static;
		}
		if (_construct != null) {
			delete data.Construct;
		}
		
		
		if (_base == null && _extends == null) {
			if (_construct == null)   {
				_class = function() {};
			}
			else {
				_class = _construct;
			}
			
			data.constructor = _class.prototype.constructor;
			
			if (_static != null) {
				for (key in _static) {
					_class[key] = _static[key];
				}
			}
	
			_class.prototype = data;
			return _class;

		}
		
		_class = function() {
			
			if (_extends != null){				
				var isarray = _extends instanceof Array,
					length = isarray ? _extends.length : 1,
					x = null;
				for (var i = 0; isarray ? i < length : i < 1; i++) {
					x = isarray ? _extends[i] : _extends;
					if (typeof x === 'function') {
						x.apply(this, arguments);
					}
				}				
			}
			
			if (_base != null) {								
				_base.apply(this, arguments);			
			}
			
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) {
					return r;
				}
			}
			return this;
		};
		
		if (_static != null)  {
			for (key in _static) {
				_class[key] = _static[key];
			}
		}
		
		
		helper.extendClass(_class, _base, _extends, data);
		
		
		data = null;
		_static = null;
		
		return _class;
	};



}(typeof window === 'undefined' ? global : window));
