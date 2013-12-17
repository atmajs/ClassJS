function is_Function(x) {
	return typeof x === 'function';
}

function is_Object(x) {
	return x != null &&  typeof x === 'object';
}

function is_Array(x) {
	return x != null
		&& typeof x.length === 'number'
		&& typeof x.slice === 'function';
}

function is_String(x) {
	return typeof x === 'string';
}

function is_notEmptyString(x) {
	return typeof x === 'string' && x !== '';
}

function is_rawObject(obj) {
	if (obj == null) 
		return false;
	
	if (typeof obj !== 'object')
		return false;
	
	return obj.constructor === Object;
}

function is_NullOrGlobal(ctx){
	return ctx === void 0 || ctx === global;
}