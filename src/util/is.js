var is_Function,
	is_Object,
	is_Array,
	is_ArrayLike,
	is_String,
	is_notEmptyString,
	is_rawObject,
	is_NullOrGlobal;
(function(){

	is_Function = function(x) {
		return typeof x === 'function';
	};
	is_Object = function(x) {
		return x != null &&  typeof x === 'object';
	};
	is_Array = function(x) {
		return x != null
			&& typeof x.length === 'number'
			&& typeof x.slice === 'function';
	};
	is_ArrayLike = is_Array;
	
	is_String = function(x) {
		return typeof x === 'string';
	};
	is_notEmptyString = function(x) {
		return typeof x === 'string' && x !== '';
	};
	is_rawObject = function(obj) {
		if (obj == null) 
			return false;
		
		if (typeof obj !== 'object')
			return false;
		
		return obj.constructor === Object;
	};
	is_NullOrGlobal = function(ctx){
		return ctx === void 0 || ctx === global;
	};
	
}());
