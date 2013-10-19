function obj_inherit(target /* source, ..*/ ) {
	if (typeof target === 'function') {
		target = target.prototype;
	}
	var i = 1,
		imax = arguments.length,
		source, key;
	for (; i < imax; i++) {

		source = typeof arguments[i] === 'function' ? arguments[i].prototype : arguments[i];

		for (key in source) {
			
			if ('Static' === key) {
				if (target.Static != null) {
					
					for (key in target.Static) {
						target.Static[key] = target.Static[key];
					}
					
					continue;
				}
			}
			
			
			target[key] = source[key];
			
		}
	}
	return target;
}

 function obj_getProperty(o, chain) {
	if (typeof o !== 'object' || chain == null) {
		return o;
	}

	var value = o,
		props = chain.split('.'),
		length = props.length,
		i = 0,
		key;

	for (; i < length; i++) {
		key = props[i];
		value = value[key];
		if (value == null) 
			return value;
		
	}
	return value;
}

function obj_isRawObject(value) {
	if (value == null) 
		return false;
	
	if (typeof value !== 'object')
		return false;
	
	return value.constructor === Object;
}

function obj_defaults(value, _defaults) {
	for (var key in _defaults) {
		if (value[key] == null) {
			value[key] = _defaults[key];
		}
	}
	return value;
}

function obj_extend(target, source) {
	for (var key in source) {
		if (source[key]) 
			target[key] = source[key];
		
	}
	return target;
}


var JSONHelper = {
	toJSON: function(){
		var obj = {},
			key, val;
		
		for (key in this) {
			
			// _ (private)
			if (key.charCodeAt(0) === 95 && key !== '_id')
				continue;
			
			if ('Static' === key || 'Validate' === key)
				continue;
			
			val = this[key];
			
			if (val == null) 
				continue;
			
			switch(typeof val){
				case 'function':
					continue;
				case 'object':
					if (is_Function(val.toJSON)) {
						obj[key] = val.toJSON();
						continue;
					}
			}
			
			obj[key] = val;
		}
		return obj;
	},
	
	arrayToJSON: function(){
		var array = new Array(this.length),
			i = 0,
			imax = this.length,
			x;
		
		for(; i < imax; i++){
			
			x = this[i];
			
			if (typeof x !== 'object') {
				array[i] = x;
				return;
			}
			
			array[i] = is_Function(x.toJSON)
				? x.toJSON()
				: JSONHelper.toJSON.call(x)
				;
			
		}
		
		return array;
	}
};
