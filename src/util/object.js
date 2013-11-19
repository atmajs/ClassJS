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
					
					for (key in source.Static) {
						target.Static[key] = source.Static[key];
					}
					
					continue;
				}
			}
			
			
			target[key] = source[key];
			
		}
	}
	return target;
}



function obj_getProperty(obj, property) {
	var chain = property.split('.'),
		length = chain.length,
		i = 0;
	for (; i < length; i++) {
		if (obj == null) {
			return null;
		}

		obj = obj[chain[i]];
	}
	return obj;
}


function obj_setProperty(obj, property, value) {
	var chain = property.split('.'),
		length = chain.length,
		i = 0,
		key = null;

	for (; i < length - 1; i++) {
		key = chain[i];
		if (obj[key] == null) {
			obj[key] = {};
		}
		obj = obj[key];
	}

	obj[chain[i]] = value;
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


function obj_isNullOrGlobal(ctx){
	return ctx === void 0 || ctx === global;
}