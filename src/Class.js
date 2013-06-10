var Class = function(data) {
	var _base = data.Base,
		_extends = data.Extends,
		_static = data.Static,
		_construct = data.Construct,
		_class = null,
		_store = data.Store,
		
		_overrides = data.Override,
		
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
	
	if (_store != null) {
		
		if (_extends == null) {
			_extends = _store;
		} else if (Array.isArray(_extends)) {
			_extends.push(_store)
		} else {
			_extends = [_extends, _store];
		}
		
		delete data.Store;
	}
	
	if (_overrides != null) {
		delete data.Override;
	}
	
	if (data.toJSON === void 0) {
		data.toJSON = JSONHelper.toJSON;
	}


	if (_base == null && _extends == null) {
		if (_construct == null) {
			_class = function() {};
		} else {
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

		if (_extends != null) {
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

	if (_static != null) {
		for (key in _static) {
			_class[key] = _static[key];
		}
	}
	
	if (_base != null) {
		class_inheritStatics(_class, _base);
	}
	
	if (_extends != null) {
		class_inheritStatics(_class, _extends);
	}


	class_inherit(_class, _base, _extends, data, _overrides);


	data = null;
	_static = null;

	return _class;
};