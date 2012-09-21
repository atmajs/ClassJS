;
(function(w) {

	var helper = {
		typeOf: function(o){
			if (o == null) return 'undefined';
			
			var type = typeof o;
			switch(type){
				case 'object':
					if (this.isArray(o)) return 'array';
					return type;
				default:
					return type;
			}
		},
		isArray: function(arr) {
			return arr != null && arr.splice != null;
		},
		each: function(arr, fn) {
			if (this.isArray(arr)) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) return;
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
			
			if (typeof original !== 'object') return;

			this.extendPrototype = original.__proto__ == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, _base, _extends, original);
		},
		proto: function(_class, _base, _extends, original) {
			var prototype = original,
				proto = original;
			
			if (_extends != null) {
				proto.__proto__ = {};
				helper.each(_extends, function(x) {
					helper.extendProto(proto.__proto__, x);
				});
				proto = proto.__proto__;
			}
			
			if (_base != null) {
				proto.__proto__ = _base.prototype;
			}

			_class.prototype = prototype;
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, _base, _extends, original) {
			
			if (_base != null) {
				var proto = {},
					tmp = new Function;
					
				tmp.prototype = _base.prototype;
				_class.prototype = new tmp();
				_class.constructor = _base;
			}
			
			helper.extendProto(_class.prototype, original);
			if (_extends != null) {				
				helper.each(_extends, function(x){
					helper.extendProto(_class.prototype, x);
				});				
			}
		},
		doNothing: function() {}
	}

	w.Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null;
			
		if (_base != null) delete data.Base;
		if (_extends != null) delete data.Extends;
		if (_static != null) delete data.Static;
		if (_construct != null) delete data.Construct;
		
		
		if (_base == null && _extends == null) {
			if (_construct == null)   _class = function() {};
			else _class = _construct;				
			
			if (_static != null) {
				for (var key in _static) _class[key] = _static[key];				
			}

			_class.prototype = data;
			return _class;

		}
		var _class = function() {
			
			if (_extends != null){
				
				if (helper.isArray(_extends)){
					for (var i = 0; i < _extends.length; i++) {
						if (typeof _extends[i] === 'function') _extends[i].apply(this, arguments);
					}
				}else{
					_extends.apply(this, arguments);
				}
			}
			
			if (_base != null) {								
				_base.apply(this, arguments);			
			}
			
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) return r;
			}
			return this;
		}
		
		if (_static) {
			for (var key in _static) _class[key] = _static[key]; 			
		}
		
		helper.extendClass(_class, _base, _extends, data);
		
		data = null;
		_static = null;
		

		return _class;
	}



})(window);
//