
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
	};
	
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
		if (target == null) 
			target = {};
		if (source == null) 
			return target;
		
		var val,
			key;
		for(key in source) {
			val = source[key];
			if (val != null) 
				target[key] = val;
		}
		return target;
	};
	
	(function(){
		
		obj_validate = function(a, b, isStrict) {
			if (a == null) 
				return Err_Invalid('object');
			
			if (b == null) 
				b = a.Validate;
			
			if (b == null)
				// if no validation object - accept any.
				return null;
			
			_strict = isStrict;
			return checkObject(a, b, a);
		};
		
		// private
		
		// unexpect in `a` if not in `b`
		var _strict = false;
		
		// a** - payload
		// b** - expect
		// strict - 
		function checkObject(a, b, ctx) {
			var error,
				optional,
				key, aVal, aKey;
			for(key in b){
				
				switch(key.charCodeAt(0)) {
					case 63:
						// ? (optional)
						aKey = key.substring(1);
						aVal = a[aKey];
						//! accept falsy value
						if (!aVal) 
							continue;
						
						error = checkProperty(aVal, b[key], ctx);
						if (error != null) {
							error.setInvalidProperty(aKey);
							return error;
						}
						
						continue;
					case 45:
						// - (unexpect)
						aKey = key.substring(1);
						if (typeof a === 'object' && aKey in a) 
							return Err_Unexpect(aKey);
					
						continue;
				}
					
				aVal = a[key];
				if (aVal == null) 
					return Err_Expect(key);
				
				
				error = checkProperty(aVal, b[key], ctx);
				if (error != null) {
					error.setInvalidProperty(key);
					return error;
				}
			}
			
			if (_strict) {
				for(key in a){
					if (key in b || '?' + key in b) 
						continue;
					
					return Err_Unexpect(key);
				}
			}
		}
		
		function checkProperty(aVal, bVal, ctx) {
			if (bVal == null) 
				return null;
			
			if (typeof bVal === 'function') {
				var error = bVal.call(ctx, aVal);
				if (error == null || error === true) 
					return null;
				
				if (error === false) 
					return Err_Invalid();
				
				return Err_Custom(error);
			}
			
			if (aVal == null) 
				return Err_Expect();
			
			if (typeof bVal === 'string') {
				var str = 'string',
					num = 'number',
					bool = 'boolean'
					;
				
				switch(bVal) {
					case str:
						return typeof aVal !== str || aVal.length === 0
							? Err_Type(str)
							: null;
					case num:
						return typeof aVal !== num
							? Err_Type(num)
							: null;
					case bool:
						return typeof aVal !== bool
							? Err_Type(bool)
							: null;
				}
			}
			
			if (bVal instanceof RegExp) {
				return bVal.test(aVal) === false
					? Err_Invalid()
					: null;
			}
			
			if (Array.isArray(bVal)) {
				if (Array.isArray(aVal) === false) 
					return Err_Type('array');
				
				var i = -1,
					imax = aVal.length,
					error;
				while ( ++i < imax ){
					error = checkObject(aVal[i], bVal[0])
					
					if (error) {
						error.setInvalidProperty(i);
						return error;
					}
				}
				
				return null;
			}
			
			if (typeof aVal !== typeof bVal) 
				return Err_Type(typeof aVal);
			
			
			if (typeof aVal === 'object') 
				return checkObject(aVal, bVal);
			
			return null;
		}
		
		var Err_Type,
			Err_Expect,
			Err_Unexpect,
			Err_Custom,
			Err_Invalid
			;
		(function(){
			
			Err_Type = create('type',
				function TypeErr(expect) {
					this.expect = expect;
				},
				{
					toString: function(){
						return 'Invalid type.'
							+ (this.expect
							   ? ' Expect: ' + this.expect
							   : '')
							+ (this.property
							   ? ' Property: ' + this.property
							   : '')
							;
					}
				}
			);
			Err_Expect = create('expect',
				function ExpectErr(property) {
					this.property = property;
				},
				{
					toString: function(){
						return 'Property expected.'
							+ (this.property
							   ? '`' + this.property + '`'
							   : '')
							;
					}
				}
			);
			Err_Unexpect = create('unexpect',
				function UnexpectErr(property) {
					this.property = property;
				},
				{
					toString: function(){
						return 'Expected property'
							+ (this.property
							   ? '`' + this.property + '`'
							   : '')
							;
					}
				}
			);
			Err_Custom = create('custom',
				function CustomErr(error) {
					this.error = error
				},
				{
					toString: function(){
						return 'Custom validation: '
							+ this.error
							+ (this.property
							    ? ' Property: ' + this.property
								: '')
							;
					}
				}
			);
			Err_Invalid = create('invalid',
				function InvalidErr(expect) {
					this.expect = expect
				}, {
					toString: function(){
						return 'Invalid.'
							+ (this.expect
								? ' Expect: ' + this.expect
								: '')
							+ (this.property
								? ' Property: ' + this.property
								: '')
							;
					}
				}
			);
			
			function create(type, Ctor, proto) {
				proto.type = type;
				proto.property = null;
				proto.setInvalidProperty = setInvalidProperty;
				
				Ctor.prototype = proto;
				return function(mix){
					return new Ctor(mix);
				}
			}
			function setInvalidProperty(prop){
				if (this.property == null) {
					this.property = prop;
					return;
				}
				this.property = prop + '.' + this.property;
			}
		}()); /*< Errors */
		
	}());
}());