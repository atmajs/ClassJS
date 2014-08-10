var Class = function(mix) {
	
	var namespace,
		data;
	
	if (is_String(mix)) {
		namespace = mix;
		
		if (arguments.length === 1) 
			return class_get(mix);
		
		
		data = arguments[1];
		data[str_CLASS_IDENTITY] = namespace;
	} else {
		data = mix;
	}
	
	
	var _base = data.Base,
		_extends = data.Extends,
		_static = data.Static,
		_construct = data.Construct,
		_class = null,
		_store = data.Store,
		_self = data.Self,
		_overrides = data.Override,
		
		key;

	if (_base != null) 
		delete data.Base;
	
	if (_extends != null) 
		delete data.Extends;
	
	if (_static != null) 
		delete data.Static;
	
	if (_self != null) 
		delete data.Self;
	
	if (_construct != null) 
		delete data.Construct;
	
	
	if (_store != null) {
		
		if (_extends == null) {
			_extends = _store;
		} else if (is_Array(_extends)) {
			_extends.unshift(_store)
		} else {
			_extends = [_store, _extends];
		}
		
		delete data.Store;
	}
	
	if (_overrides != null) 
		delete data.Override;
	
	if (_base == null && _extends == null && _self == null) {
	
		if (data.toJSON === void 0) 
			data.toJSON = json_proto_toJSON;
		
		_class = _construct == null
			? function() {}
			: _construct
			;
		
		data.constructor = _class.prototype.constructor;

		if (_static != null) {
			obj_extendDescriptors(_class, _static);
		}

		_class.prototype = data;
		
		if (namespace != null) 
			class_register(namespace, _class);
		
		return _class;
	}

	_class = function() {
		
		//// consider to remove 
		////if (this instanceof _class === false) 
		////	return new (_class.bind.apply(_class, [null].concat(_Array_slice.call(arguments))));
		
	
		if (_extends != null) {
			var isarray = _extends instanceof Array,
				
				imax = isarray ? _extends.length : 1,
				i = 0,
				x = null;
			for (; i < imax; i++) {
				x = isarray
					? _extends[i]
					: _extends
					;
				if (typeof x === 'function') {
					fn_apply(x, this, arguments);
				}
			}
		}

		if (_base != null) {
			fn_apply(_base, this, arguments);
		}
		
		if (_self != null && is_NullOrGlobal(this) === false) {
			
			for (var key in _self) {
				this[key] = fn_proxy(_self[key], this);
			}
		}

		if (_construct != null) {
			var r = fn_apply(_construct, this, arguments);
			if (r != null) {
				return r;
			}
		}
		
		this['super'] = null;
		
		return this;
	};
	
	if (namespace != null) 
		class_register(namespace, _class);

	if (_static != null) {
		obj_extendDescriptors(_class, _static);
	}
	
	if (_base != null) 
		class_inheritStatics(_class, _base);
	
	if (_extends != null) 
		class_inheritStatics(_class, _extends);
	
	class_extendProtoObjects(data, _base, _extends);
	
	class_inherit(_class, _base, _extends, data, _overrides, {
		toJSON: json_proto_toJSON
	});
	
	data = null;
	_static = null;
	return _class;
};