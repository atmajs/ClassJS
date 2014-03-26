
var obj_inherit,
	obj_getProperty,
	obj_setProperty,
	obj_defaults,
	obj_extend,
	
	obj_validate
	;

(function(){
	
	obj_inherit = function(target /* source, ..*/ ) {
		if (is_Function(target)) 
			target = target.prototype;
		
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = is_Function(arguments[i])
				? arguments[i].prototype
				: arguments[i]
				;
	
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
	
	
	
	obj_getProperty = function(obj, property) {
		var chain = property.split('.'),
			imax = chain.length,
			i = -1;
		while ( ++i < imax ) {
			if (obj == null) 
				return null;
			
			obj = obj[chain[i]];
		}
		return obj;
	};
	
	
	obj_setProperty = function(obj, property, value) {
		var chain = property.split('.'),
			imax = chain.length,
			i = -1,
			key;
	
		while ( ++i <  imax - 1) {
			key = chain[i];
			
			if (obj[key] == null) 
				obj[key] = {};
			
			obj = obj[key];
		}
	
		obj[chain[i]] = value;
	};
	
	obj_defaults = function(target, defaults) {
		for (var key in defaults) {
			if (target[key] == null) 
				target[key] = defaults[key];
		}
		return target;
	};
	
	obj_extend = function(target, source) {
		for (var key in source) {
			if (source[key] != null) 
				target[key] = source[key];
		}
		return target;
	};
	
	(function(){
		obj_validate = function(a, b) {
			if (a == null) 
				return 'Instance is undefined';
			
			if (b == null) 
				b = a.Validate;
			
			if (b == null) 
				return 'Validation object is undefined';
			
			
			return checkObject(a, b, a);
		};
		
		// private
		// a** - payload
		// b** - expect
		
		function checkObject(a, b, ctx) {
			var error,
				optional,
				key, aVal;
			for(key in b){
				
				switch(key.charCodeAt(0)) {
					case 63:
						// ? (optional)
						aVal = a[key.substring(1)]
						if (aVal == null) 
							continue;
						
						error = checkProperty(aVal, b[key], ctx);
						
						if (error) 
							return error + ': ' + key;
						
						continue;
					case 45:
						// - (unexpect)
						if (a[key.substring(1)] != null) 
							return 'Unexpected argument: ' + key;
						
						continue;
				}
					
				aVal = a[key];
				if (aVal == null) 
					return 'Argument expected: ' + key;
				
				error = checkProperty(aVal, b[key], ctx);
				if (error != null) 
					return error + ': ' + key;
			}
		}
		
		function checkProperty(aVal, bVal, ctx) {
			if (bVal == null) 
				return null;
			
			if (typeof bVal === 'function') {
				var error = bVal.call(ctx, aVal);
				if (error == null || error === true) 
					return;
				
				if (error === false) 
					return 'Invalid argument';
				
				return error;
			}
			
			if (aVal == null) 
				return 'Expected argument is undefined';
			
			if (typeof bVal === 'string') {
				switch(bVal) {
					case 'string':
						return typeof aVal !== 'string' || aVal.length === 0
							? 'String expected'
							: null;
					case 'number':
						return typeof aVal !== 'number'
							? 'Number expected'
							: null;
				}
			}
			
			if (bVal instanceof RegExp) {
				return bVal.test(aVal) === false
					? 'Invalid argument'
					: null;
			}
			
			if (Array.isArray(bVal)) {
				if (Array.isArray(aVal) === false) 
					return 'Array expected';
				
				var i = -1,
					imax = aVal.length,
					error;
				while ( ++i < imax ){
					error = checkObject(aVal[i], bVal[0])
					
					if (error) 
						return 'Invalid item <' + i + '> ' + error;
				}
				
				return null;
			}
			
			if (typeof aVal !== typeof bVal) 
				return 'Type missmatch';
			
			
			if (typeof aVal === 'object') 
				return checkObject(aVal, bVal);
			
			
			return null;
		}
	}());
}());