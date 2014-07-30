// source /src/license.txt
/*!
 * ClassJS v1.0.66
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2014 Atma.js and other contributors
 */
// end:source /src/license.txt
// source /src/umd.js
(function(root, factory){
	"use strict";

	var _global = typeof window === 'undefined' || window.navigator == null
			? global
			: window
			,
		_exports
		;

    
	_exports = root || _global;
    

    function construct(){

        return factory(_global, _exports);
    };

    
    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    construct();
	
	if (typeof module !== 'undefined') 
		module.exports = _exports.Class;
	
}(this, function(global, exports){
	"use strict";
// end:source /src/umd.js
	
	// source /src/vars.js
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort,
		
		_cfg = {
			ModelHost: null, // @default: Class.Model
		};
		
	
	var str_CLASS_IDENTITY = '__$class__';
	// end:source /src/vars.js
	// source /src/util/is.js
	var is_Function,
		is_Object,
		is_Array,
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
	
	// end:source /src/util/is.js
	// source /src/util/array.js
	var arr_each,
		arr_isArray,
		arr_remove
		;
		
	(function(){
	
		arr_each = function(array, callback) {
			
			if (arr_isArray(array)) {
				for (var i = 0, imax = array.length; i < imax; i++){
					callback(array[i], i);
				}
				return;
			}
			
			callback(array);
		};
		
		arr_isArray = function(array) {
			return array != null
				&& typeof array === 'object'
				&& typeof array.length === 'number'
				&& typeof array.splice === 'function';
		};
		
		arr_remove = function(array, fn){
			var imax = array.length,
				i = -1;
			while ( ++i < imax){
				if (fn(array[i]) === true) {
					array.splice(i, 1);
					i--;
					imax--;
				}
			}
		};
		
		/* polyfill */
		if (typeof Array.isArray !== 'function') {
			Array.isArray = function(array){
				if (array instanceof Array){
					return true;
				}
				
				if (array == null || typeof array !== 'object') {
					return false;
				}
				
				
				return array.length !== void 0 && typeof array.slice === 'function';
			};
		}
		
	}());
	
	// end:source /src/util/array.js
	// source /src/util/class.js
	var class_register,
		class_get,
		
		class_patch,
		
		class_stringify,
		class_parse,
		class_properties
		
		;
	
	(function(){
		
		class_register = function(namespace, class_){
			
			obj_setProperty(
				_cfg.ModelHost || Class.Model,
				namespace,
				class_
			);
		};
		
		class_get = function(namespace){
			
			return obj_getProperty(
				_cfg.ModelHost || Class.Model,
				namespace
			);
		};
		
		class_patch = function(mix, Proto){
			
			var class_ = is_String(mix)
				? class_get(mix)
				: mix
				;
				
			// if DEBUG
			!is_Function(class_)
				&& console.error('<class:patch> Not a Function', mix);
			// endif
				
			Proto.Base = class_;
			
			class_ = Class(Proto);
			
			if (is_String(mix)) 
				class_register(mix, class_);
			
			return class_;
		};
		
		class_stringify = function(class_){
			
			return JSON.stringify(class_, stringify);
		};
		
		class_parse = function(str){
			
			return JSON.parse(str, parse);
		};
		
		class_properties = function(Ctor) {
			return getProperties(Ctor);
		};
		
		// private
		
		function stringify(key, val) {
			
			if (val == null || typeof val !== 'object') 
				return val;
			
			var current = this,
				obj = current[key]
				;
			
			if (obj[str_CLASS_IDENTITY] && obj.toJSON) {
				
				return stringifyMetaJSON(obj[str_CLASS_IDENTITY], val)
				
				////val[str_CLASS_IDENTITY] = obj[str_CLASS_IDENTITY];
				////return val;
			}
			
			
			return val;
		}
		
		function stringifyMetaJSON(className, json){
			var out = {};
			out['json'] = json;
			out[str_CLASS_IDENTITY] = className;
			
			return out;
		}
		
		function parse(key, val) {
			
			var Ctor;
			
			if (val != null && typeof val === 'object' && val[str_CLASS_IDENTITY]) {
				Ctor = Class(val[str_CLASS_IDENTITY]);
			
				if (typeof Ctor === 'function') {
					
					val = new Ctor(val.json);
				} else {
					
					console.error('<class:parse> Class was not registered', val[str_CLASS_IDENTITY]);
				}
			}
			
			return val;
		}
		
		function getProperties(proto, out){
			if (typeof proto === 'function')
				proto = proto.prototype;
			
			if (out == null) 
				out = {};
			
			var type,
				key,
				val;
	        for(key in proto){
				val = proto[key];
	            type = val == null
					? null
					: typeof val
					;
					
	            if (type === 'function')
					continue;
				
				var c = key.charCodeAt(0);
				if (c === 95 && key !== '_id')
					// _
					continue;
				
				if (c >= 65 && c <= 90)
					// A-Z
					continue;
				
				if (type === 'object') {
					var ctor = val.constructor,
						ctor_name = ctor && ctor.name
						;
					
					if (ctor_name !== 'Object' && ctor_name && global[ctor_name] === ctor) {
						// built-in objects
						out[key] = ctor_name;
						continue;
					}
					
					out[key] = getProperties(val);
					continue;
				}
				
	            out[key] = type;
	        }
	        
	        if (proto.__proto__) 
	            getProperties(proto.__proto__, out);
	        
	        return out;
	    }
		
	}());
	// end:source /src/util/class.js
	// source /src/util/proto.js
	var class_inherit,
		class_inheritStatics,
		class_extendProtoObjects
		;
	
	(function(){
		
		var PROTO = '__proto__';
		
		var _toString = Object.prototype.toString,
			_isArguments = function(args){
				return _toString.call(args) === '[object Arguments]';
			};
		
		
		class_inherit = PROTO in Object.prototype
			? inherit
			: inherit_protoLess
			;
		
		class_inheritStatics = function(_class, mix){
			if (mix == null) 
				return;
			
			if (is_Function(mix)) {
				for (var key in mix) {
					if (mix.hasOwnProperty(key) && _class[key] == null) {
						_class[key] = mix[key];
					}
				}
				return;
			}
			
			if (Array.isArray(mix)) {
				var imax = mix.length,
					i = -1;
				
				
				while ( ++i < imax ) {
					class_inheritStatics(_class, mix[i]);
				}
				return;
			}
			
			if (mix.Static) {
				mix = mix.Static;
				for (var key in mix) {
					if (mix.hasOwnProperty(key) && _class[key] == null) {
						_class[key] = mix[key];
					}
				}
				return;
			}
		};
		
		
		class_extendProtoObjects = function(proto, _base, _extends){
			var key,
				protoValue;
				
			for (key in proto) {
				protoValue = proto[key];
				
				if (!is_rawObject(protoValue))
					continue;
				
				if (_base != null){
					if (is_rawObject(_base.prototype[key])) 
						obj_defaults(protoValue, _base.prototype[key]);
				}
				
				if (_extends != null) {
					arr_each(_extends, function(x){
						x = proto_getProto(x);
						
						if (is_rawObject(x[key])) 
							obj_defaults(protoValue, x[key]);
					});
				}
			}
		}
		
		// PRIVATE
		function proto_extend(proto, source) {
			if (source == null) 
				return;
			
			if (typeof proto === 'function') 
				proto = proto.prototype;
			
			if (typeof source === 'function') 
				source = source.prototype;
			
			var key, val;
			for (key in source) {
				val = source[key];
				if (val != null) 
					proto[key] = val;
			}
		}
		
		function proto_override(super_, fn) {
	        var proxy;
			
			if (super_) {
				proxy = function(mix){
					
					var args = arguments.length === 1 && _isArguments(mix)
						? mix
						: arguments
						;
					
					return  fn_apply(super_, this, args);
				}
			} else{
				
				proxy = fn_doNothing;
			}
			
	        
	        return function(){
	            this['super'] = proxy;
	            
	            return fn_apply(fn, this, arguments);
	        };
	    }
	
		function inherit(_class, _base, _extends, original, _overrides, defaults) {
			var prototype = original,
				proto = original;
	
			prototype.constructor = _class.prototype.constructor;
	
			if (_extends != null) {
				proto[PROTO] = {};
	
				arr_each(_extends, function(x) {
					proto_extend(proto[PROTO], x);
				});
				proto = proto[PROTO];
			}
	
			if (_base != null) 
				proto[PROTO] = _base.prototype;
			
			for (var key in defaults) {
				if (prototype[key] == null) 
					prototype[key] = defaults[key];
			}
			for (var key in _overrides) {
				prototype[key] = proto_override(prototype[key], _overrides[key]);
			}
			
			
			_class.prototype = prototype;
		}
	
	
		// browser that doesnt support __proto__ 
		function inherit_protoLess(_class, _base, _extends, original, _overrides, defaults) {
			
			if (_base != null) {
				var tmp = function() {};
	
				tmp.prototype = _base.prototype;
	
				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x) {
					
					delete x.constructor;
					proto_extend(_class, x);
				});
			}
			
			var prototype = _class.prototype;
			obj_defaults(prototype, defaults);
			
			for (var key in _overrides) {
				prototype[key] = proto_override(prototype[key], _overrides[key]);
			}
			proto_extend(_class, original); 
		}
		
			
		function proto_getProto(mix) {
			
			return is_Function(mix)
				? mix.prototype
				: mix
				;
		}
		
	}());
	// end:source /src/util/proto.js
	// source /src/util/json.js
	// Create from Complex Class Instance a lightweight json object
	
	var json_key_SER = '__$serialization',
		json_proto_toJSON,
		json_proto_arrayToJSON
		;
		
	(function(){
		
		json_proto_toJSON = function(serialization){
			
			var object = this,
				json = {},
				
				key, val, s;
				
			if (serialization == null) 
				serialization = object[json_key_SER];
			
			
			var asKey;
			
			for(key in object){
				asKey = key;
				
				if (serialization != null && serialization.hasOwnProperty(key)) {
					s = serialization[key];
					if (s != null && typeof s === 'object') {
						
						if (s.key) 
							asKey = s.key;
							
						if (s.hasOwnProperty('serialize')) {
							if (s.serialize == null) 
								continue;
							
							json[asKey] = s.serialize(object[key]);
							continue;
						}
						
					}
				}
				
				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;
	
				if ('Static' === key || 'Validate' === key)
					continue;
	
				val = object[key];
	
				if (val == null)
					continue;
				
				if ('_id' === key) {
					json[asKey] = val;
					continue;
				}
	
				switch (typeof val) {
					case 'function':
						continue;
					case 'object':
						
						var toJSON = val.toJSON;
						if (toJSON == null) 
							break;
						
						json[asKey] = val.toJSON();
						continue;
						//@removed - serialize any if toJSON is implemented
						//if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
						//	json[asKey] = val.toJSON();
						//	continue;
						//}
						
						break;
				}
	
				json[asKey] = val;
			}
			
			// make mongodb's _id property not private
			if (object._id != null)
				json._id = object._id;
			
			return json;	
		};
		
		json_proto_arrayToJSON =  function() {
			var array = this,
				imax = array.length,
				i = 0,
				output = new Array(imax),
				
				x;
	
			for (; i < imax; i++) {
	
				x = array[i];
				
				if (x != null && typeof x === 'object') {
					
					var toJSON = x.toJSON;
					if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
						
						output[i] = x.toJSON();
						continue;
					}
					
					if (toJSON == null) {
						
						output[i] = json_proto_toJSON.call(x);
						continue;
					}
				}
				
				output[i] = x;
			}
	
			return output;
		};
		
	}());
	// end:source /src/util/json.js
	// source /src/util/object.js
	
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
			
			obj_validate = function(a /*, b , ?isStrict, ?property, ... */) {
				if (a == null) 
					return Err_Invalid('object');
				
				_props = null;
				_strict = false;
				
				var i = arguments.length,
					validator, x;
				while (--i > 0) {
					x = arguments[i];
					switch(typeof x){
						case 'string':
							if (_props == null) 
								_props = {};
							_props[x] = 1;
							continue;
						case 'boolean':
							_strict = x;
							continue;
						case 'undefined':
							continue;
						default:
							if (i !== 1) {
								return Err_Invalid('validation argument at ' + i)
							}
							validator = x;
							continue;
					}
				}
				if (validator == null) 
					validator = a.Validate;
				if (validator == null)
					// if no validation object - accept any.
					return null;
				
				return checkObject(a, validator, a);
			};
			
			// private
			
				// unexpect in `a` if not in `b`
			var _strict = false,
				// validate only specified properties
				_props = null;
			
			// a** - payload
			// b** - expect
			// strict - 
			function checkObject(a, b, ctx) {
				var error,
					optional,
					key, aVal, aKey;
				for(key in b){
					
					if (_props != null && a === ctx && _props.hasOwnProperty(key) === false) {
						continue;
					}
					
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
							return 'Unexpected property'
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
	// end:source /src/util/object.js
	// source /src/util/patchObject.js
	var obj_patch,
		obj_patchValidate;
	
	(function(){
		
		obj_patch = function(obj, patch){
			
			for(var key in patch){
				
				var patcher = patches[key];
				if (patcher) 
					patcher[fn_WALKER](obj, patch[key], patcher[fn_MODIFIER]);
				else
					console.error('Unknown or not implemented patcher', key);
			}
			return obj;
		};
		
		obj_patchValidate = function(patch){
			if (patch == null) 
				return 'Undefined';
			
			var has = false;
			for(var key in patch){
				has = true;
				
				if (patches[key] == null) 
					return 'Unsupported patcher: ' + key;
			}
			if (has === false) 
				return 'No data';
			
			return null;
		};
		
		// === private
		
		function walk_mutator(obj, data, fn) {
			for (var key in data) 
				fn(obj_getProperty(obj, key), data[key], key);
			
		}
		
		function walk_modifier(obj, data, fn){
			for(var key in data)
				obj_setProperty(
					obj,
					key,
					fn(obj_getProperty(obj, key), data[key], key)
				);
		}
		
		function fn_IoC(){
			var fns = arguments;
			return function(val, mix, prop){
				for (var i = 0, fn, imax = fns.length; i < imax; i++){
					fn = fns[i];
					if (fn(val, mix, prop) === false) 
						return;
				}
			}
		}
		
		function arr_checkArray(val, mix, prop) {
			if (arr_isArray(val) === false) {
				// if DEBUG
				console.warn('<patch> property is not an array', prop);
				// endif
				return false;
			}
		}
		
		function arr_push(val, mix, prop){
			if (mix.hasOwnProperty('$each')) {
				for (var i = 0, imax = mix.$each.length; i < imax; i++){
					val.push(mix.$each[i]);
				}
				return;
			}
			val.push(mix);
		}
		
		function arr_pop(val, mix, prop){
			 val[mix > 0 ? 'pop' : 'shift']();
		}
		function arr_pull(val, mix, prop) {
			arr_remove(val, function(item){
				return query_match(item, mix);
			});
		}
		
		function val_inc(val, mix, key){
			return val + mix;
		}
		function val_set(val, mix, key){
			return mix;
		}
		function val_unset(){
			return void 0;
		}
		
		function val_bit(val, mix){
			if (mix.or) 
				return val | mix.or;
			
			if (mix.and) 
				return val & mix.and;
			
			return val;
		}
		
		var query_match;
		(function(){
			/** @TODO improve object matcher */
			query_match = function(obj, mix){
				for (var key in mix) {
					if (obj[key] !== mix[key]) 
						return false;
				}
				return true;
			};
		}());
		
		
		var fn_WALKER = 0,
			fn_MODIFIER = 1
			;
			
		var patches = {
			'$push': [walk_mutator, fn_IoC(arr_checkArray, arr_push)],
			'$pop':  [walk_mutator, fn_IoC(arr_checkArray, arr_pop)],
			'$pull': [walk_mutator, fn_IoC(arr_checkArray, arr_pull)],
			
			'$inc':   [walk_modifier, val_inc],
			'$set':   [walk_modifier, val_set],
			'$unset': [walk_modifier, val_unset],
			'$bit':   [walk_modifier, val_unset],
		};
		
		
		
	}());
	// end:source /src/util/patchObject.js
	// source /src/util/function.js
	var fn_proxy,
		fn_apply,
		fn_createDelegate,
		fn_doNothing,
		fn_argsId
		;
		
	(function(){
	
		fn_proxy = function(fn, ctx) {
			return function() {
				return fn_apply(fn, ctx, arguments);
			};
		};
		
		fn_apply = function(fn, ctx, _arguments){
			switch (_arguments.length) {
				case 0:
					return fn.call(ctx);
				case 1:
					return fn.call(ctx, _arguments[0]);
				case 2:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1]);
				case 3:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2]);
				case 4:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2],
						_arguments[3]);
				case 5:
					return fn.call(ctx,
						_arguments[0],
						_arguments[1],
						_arguments[2],
						_arguments[3],
						_arguments[4]
						);
			};
			return fn.apply(ctx, _arguments);
		};
		
		fn_createDelegate = function(fn /* args */) {
			var args = _Array_slice.call(arguments, 1);
			return function(){
				if (arguments.length > 0) 
					args = args.concat(_Array_slice.call(arguments));
				
				return fn_apply(fn, null, args);
			};
		};
		
		fn_doNothing = function(){};
		
		fn_argsId = function(args, cache){
			if (args.length === 0)
				return 0;
			
			var imax = cache.length,
				i = -1;
			while( ++i < imax ){
				if (args_match(cache[i], args))
					return i + 1;
			}
			cache.push(args);
			return cache.length;
		};
		
		// === private
		
		function args_match(a, b){
			if (a.length !== b.length) 
				return false;
			
			var imax = a.length,
				i = 0;
			for (; i < imax; i++){
				if (a[i] !== b[i])
					return false;
			}
			return true;
		}
	}());
	
	// end:source /src/util/function.js
	
	
	// source /src/xhr/XHR.js
	var XHR = {};
	
	(function(){
		
		// source promise.js
		/*
		 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
		 *  Licensed under the New BSD License.
		 *  https://github.com/stackp/promisejs
		 */
		
		(function(exports) {
		
		    var ct_URL_ENCODED = 'application/x-www-form-urlencoded',
		        ct_JSON = 'application/json';
		    
		    var e_NO_XHR = 1,
		        e_TIMEOUT = 2,
		        e_PRAPAIR_DATA = 3;
		        
		    function Promise() {
		        this._callbacks = [];
		    }
		
		    Promise.prototype.then = function(func, context) {
		        var p;
		        if (this._isdone) {
		            p = func.apply(context, this.result);
		        } else {
		            p = new Promise();
		            this._callbacks.push(function () {
		                var res = func.apply(context, arguments);
		                if (res && typeof res.then === 'function')
		                    res.then(p.done, p);
		            });
		        }
		        return p;
		    };
		
		    Promise.prototype.done = function() {
		        this.result = arguments;
		        this._isdone = true;
		        for (var i = 0; i < this._callbacks.length; i++) {
		            this._callbacks[i].apply(null, arguments);
		        }
		        this._callbacks = [];
		    };
		
		    function join(promises) {
		        var p = new Promise();
		        var results = [];
		
		        if (!promises || !promises.length) {
		            p.done(results);
		            return p;
		        }
		
		        var numdone = 0;
		        var total = promises.length;
		
		        function notifier(i) {
		            return function() {
		                numdone += 1;
		                results[i] = Array.prototype.slice.call(arguments);
		                if (numdone === total) {
		                    p.done(results);
		                }
		            };
		        }
		
		        for (var i = 0; i < total; i++) {
		            promises[i].then(notifier(i));
		        }
		
		        return p;
		    }
		
		    function chain(funcs, args) {
		        var p = new Promise();
		        if (funcs.length === 0) {
		            p.done.apply(p, args);
		        } else {
		            funcs[0].apply(null, args).then(function() {
		                funcs.splice(0, 1);
		                chain(funcs, arguments).then(function() {
		                    p.done.apply(p, arguments);
		                });
		            });
		        }
		        return p;
		    }
		
		    /*
		     * AJAX requests
		     */
		
		    function _encode(data) {
		        var result = "";
		        if (typeof data === "string") {
		            result = data;
		        } else {
		            var e = encodeURIComponent;
		            for (var k in data) {
		                if (data.hasOwnProperty(k)) {
		                    result += '&' + e(k) + '=' + e(data[k]);
		                }
		            }
		        }
		        return result;
		    }
		
		    function new_xhr() {
		        var xhr;
		        if (window.XMLHttpRequest) {
		            xhr = new XMLHttpRequest();
		        } else if (window.ActiveXObject) {
		            try {
		                xhr = new ActiveXObject("Msxml2.XMLHTTP");
		            } catch (e) {
		                xhr = new ActiveXObject("Microsoft.XMLHTTP");
		            }
		        }
		        return xhr;
		    }
		
		
		    function ajax(method, url, data, headers) {
		        var p = new Promise(),
		            contentType = headers && headers['Content-Type'] || promise.contentType;
		        
		        var xhr,
		            payload;
		        
		
		        try {
		            xhr = new_xhr();
		        } catch (e) {
		            p.done(e_NO_XHR, "");
		            return p;
		        }
		        if (data) {
		            
		            if ('GET' === method) {
		                
		                url += '?' + _encode(data);
		                data = null;
		            } else {
		                
		                
		                switch (contentType) {
		                    case ct_URL_ENCODED:
		                        data = _encode(data);
		                        break;
		                    case ct_JSON:
		                        try {
		                            data = JSON.stringify(data);
		                        } catch(error){
		                            
		                            p.done(e_PRAPAIR_DATA, '');
		                            return p;
		                        }
		                    default:
		                        // @TODO notify not supported content type
		                        // -> fallback to url encode
		                        data = _encode(data);
		                        break;
		                }
		            }
		            
		        }
		        
		        xhr.open(method, url);
		        
		        if (data) 
		            xhr.setRequestHeader('Content-Type', contentType);
		        
		        for (var h in headers) {
		            if (headers.hasOwnProperty(h)) {
		                xhr.setRequestHeader(h, headers[h]);
		            }
		        }
		
		        function onTimeout() {
		            xhr.abort();
		            p.done(e_TIMEOUT, "", xhr);
		        }
		
		        var timeout = promise.ajaxTimeout;
		        if (timeout) {
		            var tid = setTimeout(onTimeout, timeout);
		        }
		
		        xhr.onreadystatechange = function() {
		            if (timeout) {
		                clearTimeout(tid);
		            }
		            if (xhr.readyState === 4) {
		                var err = (!xhr.status ||
		                           (xhr.status < 200 || xhr.status >= 300) &&
		                           xhr.status !== 304);
		                p.done(err, xhr.responseText, xhr);
		            }
		        };
		
		        xhr.send(data);
		        return p;
		    }
		
		    function _ajaxer(method) {
		        return function(url, data, headers) {
		            return ajax(method, url, data, headers);
		        };
		    }
		
		    var promise = {
		        Promise: Promise,
		        join: join,
		        chain: chain,
		        ajax: ajax,
		        get: _ajaxer('GET'),
		        post: _ajaxer('POST'),
		        put: _ajaxer('PUT'),
		        del: _ajaxer('DELETE'),
		        patch: _ajaxer('PATCH'),
		
		        /* Error codes */
		        ENOXHR: e_NO_XHR,
		        ETIMEOUT: e_TIMEOUT,
		        E_PREPAIR_DATA: e_PRAPAIR_DATA,
		        /**
		         * Configuration parameter: time in milliseconds after which a
		         * pending AJAX request is considered unresponsive and is
		         * aborted. Useful to deal with bad connectivity (e.g. on a
		         * mobile network). A 0 value disables AJAX timeouts.
		         *
		         * Aborted requests resolve the promise with a ETIMEOUT error
		         * code.
		         */
		        ajaxTimeout: 0,
		        
		        
		        contentType: ct_JSON
		    };
		
		    if (typeof define === 'function' && define.amd) {
		        /* AMD support */
		        define(function() {
		            return promise;
		        });
		    } else {
		        exports.promise = promise;
		    }
		
		})(this);
		
		// end:source promise.js
		
	}.call(XHR));
	
	arr_each(['get'], function(key){
		XHR[key] = function(path, sender){
			
			this
				.promise[key](path)
				.then(function(errored, response, xhr){
					
					if (errored) {
						sender.onError(errored, response, xhr);
						return;
					}
					
					sender.onSuccess(response);
				});
			
		};
	});
	
	arr_each(['del', 'post', 'put', 'patch'], function(key){
		XHR[key] = function(path, data, cb){
			this
				.promise[key](path, data)
				.then(function(error, response, xhr){
					cb(error, response, xhr);
				});
		};
	});
	
	
	// end:source /src/xhr/XHR.js
	
	// source /src/business/Serializable.js
	var Serializable;
	
	(function(){
		
		Serializable = function($serialization) {
			
			if (this === Class || this == null || this === global) {
				
				var Ctor = function(data){
					this[json_key_SER] = obj_extend(this[json_key_SER], $serialization);
					
					Serializable.call(this, data);
				};
				
				return Ctor;
			}
			
			if ($serialization != null) {
				
				if (this.deserialize) 
					this.deserialize($serialization);
				else
					Serializable.deserialize(this, $serialization);
				
			}
			
		}
		
		Serializable.serialize = function(instance) {
				
			if (is_Function(instance.toJSON)) 
				return instance.toJSON();
			
			
			return json_proto_toJSON.call(instance, instance[json_key_SER]);
		};
		
		Serializable.deserialize = function(instance, json) {
				
			if (is_String(json)) {
				try {
					json = JSON.parse(json);
				}catch(error){
					console.error('<json:deserialize>', json);
					return instance;
				}
			}
			
			if (is_Array(json) && is_Function(instance.push)) {
				instance.length = 0;
				for (var i = 0, imax = json.length; i < imax; i++){
					instance.push(json[i]);
				}
				return instance;
			}
			
			var props = instance[json_key_SER],
				asKeys, asKey,
				key,
				val,
				Mix;
			
			
			if (props != null) {
				var pname = '__desAsKeys';
				
				asKeys = props[pname];
				if (asKeys == null) {
					asKeys = props[pname] = {};
					for (key in props) {
						if (key !== '__desAsKeys' && props[key].hasOwnProperty('key') === true) 
							asKeys[props[key].key] = key;
					}
				}
			}
			
			for (key in json) {
				
				val = json[key];
				asKey = key;
				
				if (props != null) {
					Mix = props.hasOwnProperty(key) 
						? props[key]
						: null
						;
					if (asKeys[key]) {
						asKey = asKeys[key];
					}
					
					if (Mix != null) {
						if (is_Object(Mix)) 
							Mix = Mix.deserialize;
						
						if (is_String(Mix)) 
							Mix = class_get(Mix);
						
						if (is_Function(Mix)) {
							instance[asKey] = val instanceof Mix
								? val
								: new Mix(val)
								;
							continue;
						}
					}
				}
				
				instance[asKey] = val;
			}
			
			return instance;
		}	
		
	}());
	
	// end:source /src/business/Serializable.js
	// source /src/business/Route.js
	/**
	 *	var route = new Route('/user/:id');
	 *
	 *	route.create({id:5}) // -> '/user/5'
	 */
	var Route = (function(){
		
		
		function Route(route){
			this.route = route_parse(route);
		}
		
		Route.prototype = {
			constructor: Route,
			create: function(object){
				var path, query;
				
				path = route_interpolate(this.route.path, object, '/');
				if (path == null) {
					return null;
				}
				
				if (this.route.query) {
					query = route_interpolate(this.route.query, object, '&');
					if (query == null) {
						return null;
					}
				}
				
				return path + (query ? '?' + query : '');
			},
			
			hasAliases: function(object){
				
				var i = 0,
					imax = this.route.path.length,
					alias
					;
				for (; i < imax; i++){
					alias = this.route.path[i].parts[1];
					
					if (alias && object[alias] == null) {
						return false;
					}
				}
				
				return true;
			}
		};
		
		var regexp_pathByColon = /^([^:\?]*)(\??):(\??)([\w]+)$/,
			regexp_pathByBraces = /^([^\{\?]*)(\{(\??)([\w]+)\})?([^\s]*)?$/;
		
		function parse_single(string) {
			var match = regexp_pathByColon.exec(string);
			
			if (match) {
				return {
					optional: (match[2] || match[3]) === '?',
					parts: [match[1], match[4]]
				};
			}
			
			match = regexp_pathByBraces.exec(string);
			
			if (match) {
				return {
					optional: match[3] === '?',
					parts: [match[1], match[4], match[5]]
				};
			}
			
			console.error('Paths breadcrumbs should be matched by regexps');
			return { parts: [string] };
		}
		
		function parse_path(path, delimiter) {
			var parts = path.split(delimiter);
			
			for (var i = 0, imax = parts.length; i < imax; i++){
				parts[i] = parse_single(parts[i]);
			}
			
			return parts;
		}
		
		function route_parse(route) {
			var question = /[^\:\{]\?[^:]/.exec(route),
				query = null;
			
			if (question){
				question = question.index + 1;
				query = route.substring(question + 1);
				route = route.substring(0, question);
			}
			
			
			return {
				path: parse_path(route, '/'),
				query: query == null ? null : parse_path(query, '&')
			};
		}
		
		/** - route - [] */
		function route_interpolate(breadcrumbs, object, delimiter) {
			var route = [],
				key,
				parts;
			
			
			for (var i = 0, x, imax = breadcrumbs.length; i < imax; i++){
				x = breadcrumbs[i];
				parts = x.parts.slice(0);
				
				if (parts[1] == null) {
					// is not an interpolated breadcrumb
					route.push(parts[0]);
					continue;
				}
				
				key = parts[1];
				parts[1] = object[key];
				
				if (parts[1] == null){
				
					if (!x.optional) {
						console.error('Object has no value, for not optional part - ', key);
						return null;
					}
					
					continue;
				}
				
				route.push(parts.join(''));
			}
			
			return route.join(delimiter);
		}
		
		
		return Route;
	}());
	// end:source /src/business/Route.js
	// source /src/business/Deferred.js
	var Deferred;
	
	(function(){
		Deferred = function(){};
		Deferred.prototype = {
			_isAsync: true,
				
			_done: null,
			_fail: null,
			_always: null,
			_resolved: null,
			_rejected: null,
			
			defer: function(){
				this._rejected = null;
				this._resolved = null;
			},
			
			isResolved: function(){
				return this._resolved != null;
			},
			isRejected: function(){
				return this._rejected != null;
			},
			isBusy: function(){
				return this._resolved == null && this._rejected == null;
			},
			
			resolve: function() {
				var done = this._done,
					always = this._always
					;
				
				this._resolved = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(done, this, arguments);
				arr_callOnce(always, this, [ this ]);
				
				return this;
			},
			
			reject: function() {
				var fail = this._fail,
					always = this._always
					;
				
				this._rejected = arguments;
				
				dfr_clearListeners(this);
				arr_callOnce(fail, this, arguments);
				arr_callOnce(always, this, [ this ]);
		
				return this;
			},
			
			resolveDelegate: function(){
				return fn_proxy(this.resolve, this);
			},
			
			rejectDelegate: function(){
				return fn_proxy(this.reject, this);
			},
			
			then: function(filterSuccess, filterError){
				return this.pipe(filterSuccess, filterError);
			},
			
			done: function(callback) {
				if (this._rejected != null) 
					return this;
				return dfr_bind(
					this,
					this._resolved,
					this._done || (this._done = []),
					callback
				);
			},
			
			fail: function(callback) {
				if (this._resolved != null) 
					return this;
				return dfr_bind(
					this,
					this._rejected,
					this._fail || (this._fail = []),
					callback
				);
			},
			
			always: function(callback) {
				return dfr_bind(
					this,
					this._rejected || this._resolved,
					this._always || (this._always = []),
					callback
				);
			},
			
			pipe: function(mix /* ..methods */){
				var dfr;
				if (typeof mix === 'function') {
					dfr = new Deferred;
					var done_ = mix,
						fail_ = arguments.length > 1
							? arguments[1]
							: null;
						
					this
						.done(delegate(dfr, 'resolve', done_))
						.fail(delegate(dfr, 'reject',  fail_))
						;
					return dfr;
				}
				
				dfr = mix;
				var imax = arguments.length,
					done = imax === 1,
					fail = imax === 1,
					i = 0, x;
				while( ++i < imax ){
					x = arguments[i];
					switch(x){
						case 'done':
							done = true;
							break;
						case 'fail':
							fail = true;
							break;
						default:
							console.error('Unsupported pipe channel', arguments[i])
							break;
					}
				}
				done && this.done(dfr.resolveDelegate());
				fail && this.fail(dfr.rejectDelegate());
				
				function pipe(dfr, method) {
					return function(){
						dfr[method].apply(dfr, arguments);
					};
				}
				function delegate(dfr, name, fn) {
					
					return function(){
						if (fn != null) {
							var override = fn.apply(this, arguments);
							if (override != null) {
								if (isDeferred(override) === true) {
									override.pipe(dfr);
									return;
								}
								
								dfr[name](override)
								return;
							}
						}
						dfr[name].apply(dfr, arguments);
					};
				}
				
				return this;
			},
			pipeCallback: function(){
				var self = this;
				return function(error){
					if (error != null) {
						self.reject(error);
						return;
					}
					var args = _Array_slice.call(arguments, 1);
					fn_apply(self.resolve, self, args);
				};
			}
		};
		
		Deferred.run = function(fn, ctx){
			var dfr = new Deferred();
			if (ctx == null) 
				ctx = dfr;
			
			fn.call(ctx, dfr.resolveDelegate(), dfr.rejectDelegate(), dfr);
			return dfr;
		};
		/**
		 * Create function wich gets deferred object with first argument.
		 * Created function returns always that deferred object
		 */
		Deferred.create = function(fn){
			return function(){
				var args = _Array_slice.call(arguments),
					dfr = new Deferred;
				args.unshift(dfr);
				
				fn_apply(fn, this, args);
				return dfr;
			};
		};
		/**
		 * Similar as `create` it will also cache the deferred object,
		 *  sothat the target function is called once pro specific arguments
		 *
		 * var fn = Deferred.memoize((dfr, name) => dfr.resolve(name));
		 * fn('foo');
		 * fn('baz');
		 * fn('foo');
		 *  - is called only once for `foo`, and once for `baz`
		 */
		Deferred.memoize = function(fn){
			var dfrs = {}, args_store = [];
			return function(){
				var args = _Array_slice.call(arguments),
					id = fn_argsId(args_store, args);
				if (dfrs[id] != null) 
					return dfrs[id];
				
				var dfr = dfrs[id] = new Deferred;
				args.unshift(dfr);
				
				fn_apply(fn, this, args);
				return dfr;
			};
		};
	
		// PRIVATE
		
		function dfr_bind(dfr, arguments_, listeners, callback){
			if (callback == null) 
				return dfr;
			
			if ( arguments_ != null) 
				fn_apply(callback, dfr, arguments_);
			else 
				listeners.push(callback);
			
			return dfr;
		}
		
		function dfr_clearListeners(dfr) {
			dfr._done = null;
			dfr._fail = null;
			dfr._always = null;
		}
		
		function arr_callOnce(arr, ctx, args) {
			if (arr == null) 
				return;
			
			var imax = arr.length,
				i = -1,
				fn;
			while ( ++i < imax ) {
				fn = arr[i];
				
				if (fn) 
					fn_apply(fn, ctx, args);
			}
			arr.length = 0;
		}
		function isDeferred(x){
			if (x == null || typeof x !== 'object') 
				return false;
			
			if (x instanceof Deferred) 
				return true;
			
			return typeof x.done === 'function'
				&& typeof x.fail === 'function'
				;
		}
		
	}());
	// end:source /src/business/Deferred.js
	// source /src/business/EventEmitter.js
	var EventEmitter;
	(function(){
	 
		EventEmitter = function() {
			this._listeners = {};
		};
	    EventEmitter.prototype = {
	        constructor: EventEmitter,
			on: function(event, callback) {
	            if (callback != null){
					(this._listeners[event] || (this._listeners[event] = [])).push(callback);
				}
				
	            return this;
	        },
	        once: function(event, callback){
				if (callback != null) {
					callback._once = true;
					(this._listeners[event] || (this._listeners[event] = [])).push(callback);
				}
				
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					args;
				return function(){
					args = _Array_slice.call(arguments);
					args.unshift(event);
					
					fn_apply(that.trigger, that, args);
				};
			},
	        
			emit: event_trigger,
	        trigger: event_trigger,
			
	        off: function(event, callback) {
				var listeners = this._listeners[event];
	            if (listeners == null)
					return this;
				
				if (arguments.length === 1) {
					listeners.length = 0;
					return this;
				}
				
				var imax = listeners.length,
					i = -1;
				while (++i < imax) {
					
					if (listeners[i] === callback) {
						listeners.splice(i, 1);
						i--;
						imax--;
					}
					
				}
	            return this;
			}
	    };
	    
		function event_trigger() {
			var args = _Array_slice.call(arguments),
				event = args.shift(),
				fns = this._listeners[event],
				fn, imax, i = 0;
				
			if (fns == null)
				return this;
			
			for (imax = fns.length; i < imax; i++) {
				fn = fns[i];
				fn_apply(fn, this, args);
				
				if (fn._once === true){
					fns.splice(i, 1);
					i--;
					imax--;
				}
			}
		
			return this;
		}
	}());
	
	// end:source /src/business/EventEmitter.js
	
	
	// source /src/Class.js
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
				for (key in _static) {
					_class[key] = _static[key];
				}
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
			for (key in _static) {
				_class[key] = _static[key];
			}
		}
		
		if (_base != null) 
			class_inheritStatics(_class, _base);
		
		if (_extends != null) 
			class_inheritStatics(_class, _extends);
		
	
		class_extendProtoObjects(data, _base, _extends);
		//if (data.toJSON === void 0) 
		//	data.toJSON = json_proto_toJSON;
			
		class_inherit(_class, _base, _extends, data, _overrides, {
			toJSON: json_proto_toJSON
		});
		
		data = null;
		_static = null;
		return _class;
	};
	// end:source /src/Class.js
	
	// source /src/business/Await.js
	var Await;
	
	(function(){
		
		Await = Class({
			Extends: Deferred.prototype,
		
			_wait: 0,
			_timeout: null,
			_result: null,
			_resolved: [],
			
			Construct: function(/* promises <optional> */){
				var imax = arguments.length,
					i = -1,
					dfr
					;
				while ( ++i < imax ){
					dfr = arguments[i];
					if (dfr != null && typeof dfr.done === 'function') 
						await_deferredDelegate(this, null, dfr);
				}
			},
			
			delegate: function(name, errorable) {
				return await_createDelegate(this, name, errorable);
			},
		
			deferred: function(name) {
				
				return await_deferredDelegate(
					this,
					name,
					new Deferred);
			},
		
			Static: {
		
				TIMEOUT: 2000
			}
		});
	
		function await_deferredDelegate(await, name, dfr){
			var delegate = await_createDelegate(await, name, true),
				args
			;
			return dfr
				.done(function(){
					args = _Array_slice.call(arguments);
					args.unshift(null);
					
					delegate.apply(null, args);
				})
				.fail(function(error){
					
					delegate(error);
				})
				;
		}
		
		function await_createDelegate(await, name, errorable){
			if (errorable == null) 
				errorable = true;
			
			if (await._timeout)
				clearTimeout(await._timeout);
	
			await.defer();
			await._wait++;
	
			if (name){
				if (!await._result)
					await._result = {};
				
				if (name in await._result) 
					console.warn('<await>', name, 'already awaiting');
				
				await._result[name] = null;
			}
			
			var delegate = fn_createDelegate(await_listener, await, name, errorable)
				;
	
			await._timeout = setTimeout(delegate, Await.TIMEOUT);
	
			return delegate;
		}
		
		function await_listener(await, name, errorable /* .. args */ ) {
			
			if (arguments.length === 0) {
				// timeout
				await._wait = 0;
				await.reject('408: Timeout');
				return;
			}
			
			if (await._wait === 0) 
				return;
			
			var result = await._result;
			
			if (name) {
				var args = _Array_slice.call(arguments, 3);
				
				result[name] = {
					error: errorable ? args.shift() : null,
					arguments: args
				};
			} else if (errorable && arguments[3] != null) {
				
				if (result == null) 
					result = await._result = {};
				
				result.__error = arguments[3];
			}
			
			if (--await._wait === 0) {
				clearTimeout(await._timeout);
				
				var error = result && result.__error
					;
				var val,
					key;
				
				if (error == null) {
					for(key in result){
						
						val = result[key];
						error = val && val.error;
						
						if (error) 
							break;
					}
				}
				
				if (error) {
					await.reject(error, result);
					return;
				}
				
				await.resolve(result);
			}
		}
	
	}());
	// end:source /src/business/Await.js
	// source /src/store/Store.js
	var StoreProto = {
		
		
		// Abstract
		
		fetch: null,
		save: null,
		del: null,
		onSuccess: null,
		onError: null,
		
		Static: {
			fetch: function(data){
				return new this().fetch(data);
			}
		}
	};
	// end:source /src/store/Store.js
	// source /src/store/events.js
	var storageEvents_onBefore,
		storageEvents_onAfter,
		storageEvents_remove,
		storageEvents_overridenDefer
		;
		
	(function(){
		
		
		var event_START = 'start',
			event_SUCCESS = 'fulfilled',
			event_FAIL = 'rejected';
		
		var events_ = new EventEmitter,
			hasBeforeListeners_,
			hasAfterListeners_
			;
		
		storageEvents_onBefore = function(callback){
			events_.on(event_START, callback);
			hasBeforeListeners_ = true;
		};
		
		storageEvents_onAfter = function(onSuccess, onFailure){
			events_
				.on(event_SUCCESS, onSuccess)
				.on(event_FAIL, onFailure)
				;
			hasAfterListeners_ = true;
		};
		
		storageEvents_remove = function(callback){
			events_
				.off(event_SUCCESS, callback)
				.off(event_FAIL, callback)
				.off(event_START, callback)
				;
		};
		
		storageEvents_overridenDefer = function(type){
			
			Deferred.prototype.defer.call(this);
			
			if (hasBeforeListeners_) 
				emit([event_START, this, type]);
			
			if (hasAfterListeners_) 
				this.always(listenerDelegate(this, type));
			
			return this;
		};
		
		// PRIVATE
		
		function listenerDelegate(sender, type) {
			return function(){
				var isSuccess = sender._rejected == null,
					arguments_ = isSuccess 
						? sender._resolved
						: sender._rejected
						,
					event = isSuccess
						? event_SUCCESS
						: event_FAIL
					;
				emit([event, sender, type].concat(arguments_));
			};
		}
		
		
		function emit(arguments_/* [ event, sender, .. ]*/){
			events_.trigger.apply(events_, arguments_);
		}
		
		
	}());
	// end:source /src/store/events.js
	// source /src/store/Remote.js
	Class.Remote = (function(){
	
		var str_CONTENT_TYPE = 'content-type',
			str_JSON = 'json'
			;
			
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
			
			defer: storageEvents_overridenDefer,
			
			serialize: function(){
				
				return is_Array(this)
					? json_proto_arrayToJSON.call(this)
					: json_proto_toJSON.call(this)
					;
			},
			
			deserialize: function(json){
				return Serializable.deserialize(this, json);
			},
			
			fetch: function(data){
				this.defer('fetch');
				
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				this.defer('save');
				
				var json = this.serialize(),
					path = this._route.create(this),
					method = this._route.hasAliases(this)
						? 'put'
						: 'post'
					;
				
				XHR[method](path, json, resolveDelegate(this, callback, 'save'));
				return this;
			},
			
			patch: function(json){
				this.defer('patch');
				
				obj_patch(this, json);
				
				XHR.patch(
					this._route.create(this),
					json,
					resolveDelegate(this)
				);
				return this;
			},
			
			del: function(callback){
				this.defer('del');
				
				var json = this.serialize(),
					path = this._route.create(this)
					;
				
				XHR.del(path, json, resolveDelegate(this, callback));
				return this;
			},
			
			onSuccess: function(response){
				parseFetched(this, response);
			},
			onError: function(errored, response, xhr){
				reject(this, response, xhr);
			}
			
			
		});
		
		function parseFetched(self, response){
			var json;
				
			try {
				json = JSON.parse(response);	
			} catch(error) {
				
				reject(self, error);
				return;
			}
			
			
			self.deserialize(json);
			self.resolve(self);
		}
		
		function reject(self, response, xhr){
			var obj;
			if (typeof response === 'string' && is_JsonResponse(xhr)) {
				try {
					obj = JSON.parse(response);
				} catch (error) {
					obj = error;
				}
			}
			
			self.reject(obj || response);
		}
		
		function is_JsonResponse(xhr){
			var header = xhr.getResponseHeader(str_CONTENT_TYPE);
			
			return header != null
				&&  header.toLowerCase().indexOf(str_JSON) !== -1;
		}
		
		function resolveDelegate(self, callback, action){
			
			return function(error, response, xhr){
					
					if (is_JsonResponse(xhr)) {
						try {
							response = JSON.parse(response);
						} catch(error){
							console.error('<XHR> invalid json response', response);
							
							return reject(self, error, xhr);
						}
					}
					
					// @obsolete -> use deferred
					if (callback) 
						callback(error, response);
					
					if (error) 
						return reject(self, response, xhr);
					
					if ('save' === action && is_Object(response)) {
						
						if (is_Array(self)) {
							
							var imax = self.length,
								jmax = response.length,
								i = -1
								;
							
							while ( ++i < imax && i < jmax){
								
								Serializable.deserialize(self[i], response[i]);
							}
							
						} else {
							self.deserialize(response);
						}
						
						return self.resolve(self);
					}
					
					self.resolve(response);
			};
		}
		
		function Remote(route){
			
			return new XHRRemote(route);
		};
		
		Remote.onBefore = storageEvents_onBefore;
		Remote.onAfter = storageEvents_onAfter;
		
		arr_each(['get', 'post', 'put', 'delete'], function(method){
			
			Remote[method] = function(url, obj){
				
				var json = obj;
				if (obj.serialize != null) 
					json = obj.serialize();
				
				if (json == null && obj.toJSON) 
					json = obj.toJSON();
				
				var dfr = new Deferred();
				XHR[method](url, json, resolveDelegate(dfr));
				
				return dfr;
			};
		});
		
		return Remote;
	}());
	// end:source /src/store/Remote.js
	// source /src/store/mongo/MongoStore.js
	
	Class.MongoStore = (function(){
		
		// source utils.js
		var cb_createListener,
			cb_completeDelegate
			;
		
		(function(){
		
			cb_createListener = function(count, cb){
				var _error;
				return function(error){
					if (error)
						_error = error;
						
					if (--count === 0)
						cb(_error);
				};
			};
			
			cb_completeDelegate = function(dfr) {
				return function(error){
					if (error) 
						return dfr.reject(error);
					dfr.resolve();
				}
			};
			
		}());
		
		// end:source utils.js
		// source Settings.js
		
		var __ip = '127.0.0.1',
		    __port = 27017,
		    __db,
		    __connection,
		    __params = {
		        auto_reconnect: true,
		        native_parser: true,
		        w: 1
		    }
		    ;
		    
		var Settings = function(setts){
		    if (setts.ip) 
		        __ip = setts.ip; 
		    
		    if (setts.port) 
		        __port = setts.port; 
		    
		    if (setts.db) 
		        __db = setts.db;
		    
		    if (setts.params) 
		        __params = setts.params;
		    
		    __connection = setts.connection;
		};
		
		
		function settings_getConnectionString(){
		    if (__connection) 
		        return __connection;
		    
		    if (!__db) 
		        return null;
		    
		    return 'mongodb://'
		        + __ip
		        + ':'
		        + __port
		        + '/'
		        + __db
		        ;
		}
		// end:source Settings.js
		// source Driver.js
		
		var db_getDb,
		    db_getCollection,
		    db_findSingle,
		    db_findMany,
		    db_count,
		    db_insert,
		    db_updateSingle,
		    db_updateMany,
		    db_remove,
		    db_ensureObjectID,
		    db_patchSingle,
		    db_ensureIndex,
		    
		    db_getMongo,
		    
		    db_resolveCollection,
		    db_resolveDb,
		    
		    db_profiler_toggle,
		    db_profiler_getData
		    ;
		
		(function(){
		    // source DriverCore.js
		    var core_findSingle,
		    	core_findMany,
		    	
		    	core_upsertSingle,
		    	core_upsertMany,
		    	
		    	core_updateSingle,
		    	core_updateMany,
		    	
		    	core_removeSingle,
		    	core_removeMany,
		    	
		    	core_count,
		    	
		    	core_profileIndexes_Enable,
		    	core_profileIndexes_GetData
		    	;
		    	
		    (function(){
		    	
		    	core_findSingle = function(coll, query, options, callback /*<error, item>*/){
		    		var c = db.collection(coll);
		    		if (options == null) 
		    			return c.findOne(query, callback);
		    		
		    		c.findOne(query, options, callback);
		    	};
		    	
		    	core_findMany = function(coll, query, options, callback /*<error, array>*/){
		    		var c = db.collection(coll);
		    		if (options == null) 
		    			return c.find(query, onQuery);
		    		
		    		c.find(query, options, onQuery);
		    			
		    		function onQuery(error, cursor){
		    			if (error) 
		    				return callback(error);
		    			
		    			cursor.toArray(callback);
		    		}
		    	};
		    	
		    	core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
		    		db
		    			.collection(coll)
		    			.update(query, data, opt_upsertSingle, callback);
		    	};
		    	core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
		    		modifyMany(core_upsertSingle, coll, array, callback);
		    	};
		    	
		    	core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
		    		db
		    			.collection(coll)
		    			.update(query, mod, callback);
		    	};
		    	core_updateMany = function(coll, array/*[[query, data]]*/, callback){
		    		modifyMany(core_updateSingle, coll, array, callback);
		    	};
		    	
		    	core_removeSingle = function(coll, query, callback /*<error, count>*/){
		    		db
		                .collection(coll)
		                .remove(query, { justOne: true }, callback);
		    	};
		    	core_removeMany = function(coll, query, callback /*<error, count>*/){
		    		db
		    			.collection(coll)
		    			.remove(query, { justOne: false }, callback);
		    	};
		    	
		    	core_count = function(coll, query, callback/*<error, count>*/){
		    		db
		    			.collection(coll)
		    			.count(query, callback);
		    	}
		    	
		    	// ==== private
		    	
		    	var opt_upsertSingle = {
		    		upsert: true,
		    		multi: false,
		    	};
		    	function modifyMany(modifier, coll, array /*[[query, data]]*/, callback) {
		    		var error,
		    			imax = array.length,
		    			count = imax;
		    			i = -1;
		    		if (imax === 0) 
		    			return callback();
		    		
		    		while ( ++i < imax ){
		    			modifier(coll, array[i][0], array[i][1], listener);
		    		}
		    		
		    		function listener(err){
		    			if (err) 
		    				error = err;
		    			
		    			if (--count === 0) 
		    				callback(error);
		    		}
		    	}
		    	
		    }());
		    // end:source DriverCore.js
		    // source DriverProfiler.js
		    var core_profiler_toggle,
		    	core_profiler_getData
		    	;
		    
		    (function(){
		    	var state = false,
		    	
		    		// settins
		    		setts_slowLimit = 50,
		    		setts_onDetect = null,
		    		setts_detector = null,
		    		
		    		box = {
		    			count: 0,
		    			slow: [],
		    			errors: []
		    		},
		    		
		    		_core_findSingle = core_findSingle,
		    		_core_findMany = core_findMany,
		    		_core_upsertSingle = core_upsertSingle,
		    		_core_upsertMany = core_upsertMany,
		    		_core_updateSingle = core_updateSingle,
		    		_core_updateMany = core_updateMany,
		    		_core_removeSingle = core_removeSingle,
		    		_core_removeMany = core_removeMany,
		    		_core_count = core_count
		    		;
		    	
		    	core_profiler_getData = function(){
		    		return box;
		    	};
		    	
		    	core_profiler_toggle =  function(enable, settings){
		    		if (settings) {
		    			setts_slowLimit = settings.slow || setts_slowLimit;
		    			setts_onDetect = settings.onDetect || setts_onDetect;
		    			setts_detector = settings.detector || setts_detector;
		    		}
		    		
		    		if (state === enable) 
		    			return;
		    		if (enable == null) 
		    			enable = !!state;
		    		
		    		state = enable;
		    		if (state === false) {
		    			core_findSingle = _core_findSingle;
		    			core_findMany = _core_findMany;
		    			core_upsertSingle = _core_upsertSingle;
		    			core_upsertMany = _core_upsertMany;
		    			core_updateSingle = _core_updateSingle;
		    			core_updateMany = _core_updateMany;
		    			core_removeSingle = _core_removeSingle;
		    			core_removeMany = _core_removeMany;
		    			core_count = _core_count;
		    			return;
		    		}
		    		
		    		core_findSingle = function(coll, query, options, callback /*<error, item>*/){
		    			_core_findSingle.apply(null, arguments);
		    			_core_findSingle(
		    				coll
		    				, wrapQuery(query)
		    				, options
		    				, analizator(coll, query));
		    		};
		    		core_findMany = function(coll, query, options, callback /*<error, array>*/){
		    			_core_findMany.apply(null, arguments);
		    			_core_findMany(
		    				coll
		    				, wrapQuery(query)
		    				, options
		    				, analizator(coll, query));
		    		};
		    		core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
		    			_core_upsertSingle.apply(null, arguments);
		    			_core_upsertSingle(
		    				coll
		    				, wrapQuery(query)
		    				, data
		    				, analizator(coll, query));
		    		};
		    		core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
		    			_core_upsertMany.apply(null, arguments);
		    			_core_upsertMany(
		    				coll
		    				, wrapMany(array)
		    				, analizator(coll, array));
		    		};
		    		core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
		    			_core_updateSingle.apply(null, arguments);
		    			_core_updateSingle(
		    				coll
		    				, wrapQuery(query)
		    				, mod
		    				, analizator(coll, query));
		    		};
		    		core_updateMany = function(coll, array/*[[query, data]]*/, callback){
		    			_core_updateMany.apply(null, arguments);
		    			_core_updateMany(
		    				coll
		    				, wrapMany(array)
		    				, analizator(coll, array));
		    		};
		    		core_removeSingle = function(coll, query, callback /*<error, count>*/){
		    			_core_removeSingle.apply(null, arguments);
		    			_core_removeSingle(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    		core_removeMany = function(coll, query, callback /*<error, count>*/){
		    			_core_removeMany.apply(null, arguments);
		    			_core_removeMany(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    		core_count = function(coll, query, callback/*<error, count>*/){
		    			_core_count.apply(null, arguments);
		    			_core_count(
		    				coll
		    				, wrapQuery(query)
		    				, analizator(coll, query));
		    		};
		    	}
		    	
		    	function wrapQuery(query){
		    		if (query == null) 
		    			return { $query: {}, $explain: true };
		    		
		    		if (query.$query) {
		    			query.$explain = true;
		    			return query;
		    		}
		    		return {
		    			$query: query,
		    			$explain: true
		    		};
		    	}
		    	function wrapMany(array){
		    		return array.forEach(function(x){
		    			return [ wrapQuery(x[0]), x[1]];
		    		});
		    	}
		    	function analizator(coll, query) {
		    		return function(error, plan){
		    			box.count++;
		    			if (error) {
		    				box.errors.push(error);
		    				return;
		    			}
		    			analize(coll, query, plan);
		    		}
		    	}
		    	function analize(coll, query, plan, params){
		    		params = params || {};
		    		if (plan == null || typeof plan === 'number') 
		    			return;
		    		if (Array.isArray(plan)) {
		    			plan.forEach(function(plan, index){
		    				params.isArray = true;
		    				params.index = index;
		    				analize(coll, query, plan, params);
		    			});
		    			return;
		    		}
		    		if (plan.clause) {
		    			plan.clause.forEach(function(plan, index){
		    				params.isClause = true;
		    				params.index = index;
		    				analize(coll, query, plan, index);
		    			});
		    			return;
		    		}
		    		if (plan.millis != null && plan.millis >= setts_slowLimit) {
		    			add('slow', coll, query, plan, params);
		    			return;
		    		}
		    		if (plan.cursor == null) 
		    			return;
		    		
		    		if (plan.cursor.indexOf('BasicCursor') !== -1) {
		    			add('unindexed', coll, query, plan, params);
		    			return;
		    		}
		    		if (setts_detector && setts_detector(plan, coll, query)) {
		    			add('custom', coll, query, plan, params);
		    			return;
		    		}
		    	}
		    	function add(reason, coll, query, plan, params){
		    		params.reason = reason;
		    		
		    		var obj = {
		    			coll: coll,
		    			query: query,
		    			plan: plan,
		    			params: params
		    		};
		    		setts_onDetect && setts_onDetect(obj);
		    		box.slow.push(obj);
		    	}
		    }());
		    // end:source DriverProfiler.js
		    
		    db_profiler_getData = core_profiler_getData;
		    db_profiler_toggle = core_profiler_toggle;
		    
		    var db,
		        mongo;
		        
		    db_getCollection = function(name, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_getCollection, name, callback));
		        
		        var coll = db.collection(name);
		        if (coll == null) 
		            return callback('<mongo> Collection Not Found: ' + name);
		        
		        callback(null, coll);
		    };
		    
		    db_resolveCollection = function(name){
		        var dfr = new Class.Deferred();
		        db_getCollection(name, function(err, coll) {
		            if (err) 
		                return dfr.reject(err);
		            dfr.resolve(coll)
		        });
		        return dfr;  
		    };
		    
		    db_getDb = function(callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_getDb, callback));
		        callback(null, db);
		    };
		    
		    db_resolveDb = function(name){
		        var dfr = new Deferred();
		        db_getDb(function(error, db){
		            if (error) 
		                return dfr.reject(error);
		            dfr.resolve(db);
		        })
		        return dfr;
		    };
		    
		    db_findSingle = function(coll, query, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_findSingle, coll, query, callback));
		        core_findSingle(coll, queryToMongo(query), null, callback);
		    };
		    
		    db_findMany = function(coll, query, options, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_findMany, coll, query, options, callback));
		        if (options == null) 
		            options = {};
		        core_findMany(coll, queryToMongo(query), options, callback);
		    };
		    
		    db_count = function(coll, query, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_count, coll, query, callback));
		        core_count(coll, query, callback);
		    };
		    
		    db_insert = function(coll, data, callback){
		        if (db == null)
		            return connect(createDbDelegate(db_insert, coll, data, callback));
		        db
		            .collection(coll)
		            .insert(data, { safe: true }, callback);
		    };
		    
		    db_updateSingle = function(coll, data, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_updateSingle, coll, data, callback));
		        
		        if (data._id == null) 
		            return callback('<mongo:update> invalid ID');
		        
		        var query = {
		            _id: db_ensureObjectID(data._id)
		        };
		        core_updateSingle(coll, query, data, callback);
		    };
		    
		    db_updateMany = function(coll, array, callback){
		        var batch = array.map(function(x){
		            return [
		                {_id: db_ensureObjectID(x._id) },
		                x
		            ];
		        });
		        core_updateMany(coll, batch, callback);
		    };
		    
		    db_patchSingle = function(coll, id, patch, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_patchSingle, coll, id, patch, callback));
		        
		        var query = { _id: db_ensureObjectID(id) };
		        core_updateSingle(coll, query, patch, callback);
		    };
		    
		    db_remove = function(coll, query, isSingle, callback){
		        if (db == null) 
		            return connect(db_remove.bind(null, coll, query, callback));
		        
		        query = queryToMongo(query);
		        
		        var fn = isSingle
		            ? core_removeSingle
		            : core_removeMany
		            ;
		        fn(coll, query, callback);
		    };
		    
		    /**
		     * index:
		     *    - Object { foo: 1}
		     *    - Array<Object, Options> [{foo:1}, {unique: true }]
		     */
		    db_ensureIndex = function(collection, index, callback){
		        if (db == null) 
		            return connect(createDbDelegate(db_ensureIndex, collection, index, callback));
		        
		        var coll = db.collection(collection);
		        if (Array.isArray(index)) {
		            coll.ensureIndex(index[0], index[1], callback);
		            return;
		        }
		        coll.ensureIndex(index, callback);
		    };
		    
		    db_ensureObjectID = function(value){
		        if (is_String(value) && value.length === 24) 
		            return db_getMongo().ObjectID(value);
		        return value;
		    };
		    
		    db_getMongo = function(){
		        db_getMongo = function() { return mongo; };
		        return (mongo = require('mongodb'));
		    };
		    
		    var connect = (function(){
		        
		        var listeners = [],
		            connecting = false,
		            connection;
		        
		        return function(callback){
		            if (db) 
		                return callback();
		            
		            if (__db == null) 
		                return callback('Database is not set. Call Class.MongoStore.settings({db:"myDbName"})');
		            
		            listeners.push(callback);
		            if (connecting) 
		                return;
		            
		            db_getMongo();
		            
		            connecting = true;
		            connection = settings_getConnectionString();
		            
		            if (!connection) 
		                return callback('<mongo> Invalid connection string');
		            
		            mongo
		                .MongoClient
		                .connect(
		                    connection,
		                    __params,
		                    onConnected
		                );
		
		            function onConnected(err, database){
		                if (err == null) 
		                    db = database;
		                
		                var imax = listeners.length,
		                    i = -1;
		                
		                while( ++i < imax ) {
		                    listeners[i](err);
		                }
		                
		                listeners.length = 0;
		                connecting = false;
		            }
		        };
		    }());
		    
		    var queryToMongo = function(query){
		        if (query == null) 
		            return query;
		        
		        if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) 
		            return query;
		        
		        
		        if (query.hasOwnProperty('_id')) 
		            query._id = db_ensureObjectID(query._id);
		        
		        var comparer = {
		            62: {
		                // >
		                0: '$gt',
		                // >=
		                61: '$gte' 
		            },
		            60: {
		                // <
		                0: '$lt',
		                // <=
		                61: '$lte' 
		            }
		        };
		        
		        for (var key in query) {
		            var val = query[key],
		                c;
		                
		            if (typeof  val === 'string') {
		                c = val.charCodeAt(0);
		                switch(c){
		                    case 62:
		                    case 60:
		                        
		                        // >
		                        var compare = comparer[c]['0'];
		                        
		                        if (val.charCodeAt(1) === 61) {
		                            // =
		                            compare = comparer[c]['61'];
		                            val = val.substring(2);
		                        }else{
		                            val = val.substring(1);
		                        }
		                        query[key] = {};
		                        query[key][compare] = parseInt(val);
		                        
		                        continue;
		                };
		            }
		        }
		        
		        return query;
		    };
		    
		    var createDbDelegate = function(fn){
		        var args = _Array_slice.call(arguments, 1),
		            callback = args[args.length - 1]
		            ;
		        return function(error){
		            if (error) 
		                return callback(error);
		            
		            if (arguments.length > 0) 
		                args = args.concat(arguments);
		            
		            return fn_apply(fn, null, args);
		        };
		    };
		}());
		// end:source Driver.js
		// source IndexHandler.js
		var IndexHandler;
		(function(){
			IndexHandler = {
				add: function(coll, indexes){
					_container.push([coll, indexes]);
				},
				ensureAll: ensureAll,
				ensure: ensure
			};
			
			// == private
			var i_Coll = 0,
				i_Indexes = 1
				;
			
			var _container = [];
			
			function ensure(coll, indexes, callback){
				var i = -1,
					imax = indexes.length,
					listener = cb_createListener(imax, callback)
					;
				
				while(++i < imax){
					db_ensureIndex(coll, indexes[i], listener);
				}
			}
			
			function ensureAll(callback){
				var dfr = new Deferred,
					imax = _container.length,
					listener = cb_createListener(imax, callback),
					i = -1
					;
					
				while ( ++i < imax ){
					ensure(
						_container[i][i_Coll],
						_container[i][i_Indexes],
						listener
					);
				}
			}
			
		}());
		// end:source IndexHandler.js
		// source MongoStoreCtor.js
		function MongoStoreCtor(mix) {
			var primaryKey = '_id',
				indexes = null,
				coll
				;
			
			if (is_String(mix)) {
				coll = mix;
			}
			else if (is_Object(mix)) {
				coll = mix.collection;
				indexes = mix.indexes;
				
				if (mix.primaryKey != null) {
					primaryKey = mix.primaryKey;
					
					var index = {};
					index[primaryKey] = 1;
					
					if (indexes == null) 
						indexes = [];
					indexes.push([index, { unique: true }]);
				}
				
			}
			
			// if DEBUG
			!coll && console.error('<MongoStore> should define a collection name', mix);
			// endif
			
			this._coll = coll;
			this._indexes = indexes;
			this._primaryKey = primaryKey;
			
			if (indexes != null) 
				IndexHandler.add(coll, indexes);
		}
		// end:source MongoStoreCtor.js
		// source MongoSingle.js
		var MongoStoreSingle = (function() {
		
			function MongoStoreSingle(mix) {
				MongoStoreCtor.call(this, mix);
			}
			
			/**
			 * @TODO - replace ensureFree with a stack of calls
			 */
			obj_inherit(MongoStoreSingle, StoreProto, Serializable, Deferred, {
				
				fetch: function(data) {
					if (this._ensureFree() === false)
						return this;
					
					db_findSingle(this._coll, data, fn_proxy(this._fetched, this));
					return this;
				},
				save: function() {
					if (this._ensureFree() === false)
						return this;
					
					var json = this.serialize(),
						fn = json._id == null
							? db_insert
							: db_updateSingle
							;
					
					fn(this._coll, json, fn_proxy(this._inserted, this));
					return this;
				},
				del: function() {
					if (this._ensureFree() === false)
						return this;
					
					if (this._id) 
						db_remove(this._coll, {
							_id: this._id
						}, true, fn_proxy(this._completed, this));
					else
						this._completed('<class:patch> `_id` is not defined');
					
					return this;
				},
				
				patch: function(patch){
					if (this._ensureFree() === false) 
						return this;
					
					if (this._id == null)
						return this._completed('<class:patch> `_id` is not defined');
					
					var error = obj_patchValidate(patch);
					if (error != null) 
						return this._completed(error)
					
					obj_patch(this, patch);
					db_patchSingle(
						this._coll,
						this._id,
						patch,
						fn_proxy(this._completed, this)
					);
				
					return this;
				},
				
				Static: {
					fetch: function(data) {
						
						return new this().fetch(data);
					},
					
					resolveCollection: function(){
						
						return db_resolveCollection(new this()._coll);
					}
				},
			
				serialize: function(){
					return json_proto_toJSON.call(this);
				},
				
				deserialize: function(json){
					
					Serializable
						.deserialize(this, json);
					
					if (this._id)
						this._id = db_ensureObjectID(this._id);
				  
					return this;  
				},
				
				/* -- private -- */
		        _busy: false,
				
				_coll: null,
				_indexes: null,
				_primaryKey: null,
				
				_ensureFree: function(){
					if (this._busy) {
						console.warn('<mongo:single> transport requested, but is busy for the same instance.');
						return false;
					}
					
					this.defer();
					this._busy = true;
					
					return true;
				},
				_completed: function(error){
					this._busy = false;
					
					return error 
						? this.reject(error)
						: this.resolve(this)
						;
				},
				_fetched: function(error, json) {
					if (error == null) {
						if (json == null) {
							error = {
								message: 'Entry Not Found',
								code: 404
							};
						}
						else {
							this.deserialize(json);
						}
					}
					
					this._completed(error);
				},
				
				_inserted: function(error, array){
					
					if (array != null && this._id == null) {
						
						if (is_Array(array) && array.length === 1) 
							this._id = array[0]._id
						else 
							console.error('<mongo:insert-single> expected an array in callback');
					}
					
					this._completed(error);
				}
			});
			
			var Constructor = function(collection) {
			
				return new MongoStoreSingle(collection);
			};
			
			Constructor.prototype = MongoStoreSingle.prototype;
			
			
			return Constructor;
		
		}());
		// end:source MongoSingle.js
		// source MongoCollection.js
		var MongoStoreCollection = (function(){
		    
		    function MongoStoreCollection(mix){
		        MongoStoreCtor.call(this, mix);
		    }
		    
		    function collection_push(collection, json){
		        var Constructor = collection._ctor,
		            instance = new Constructor(json);
		            
		        if (instance._id == null && is_Function(instance.deserialize)) {
		            instance.deserialize(json);
		        }
		        
		        collection[collection.length++] = instance;
		    }
		    
		    obj_inherit(MongoStoreCollection, Deferred, {
		        
		        fetch: function(query, options){
		            if (this._ensureFree() === false)
		                return this;
		            
		            db_findMany(this._coll, query, options, fn_proxy(this._fetched, this));
		            return this;
		        },
		        save: function(){
		            if (this._ensureFree() === false)
		                return this;
		            
		            var insert = [],
						insertIndexes = [],
		                update = [],
		                coll = this._coll,
		                onComplete = fn_proxy(this._completed, this);
		            
		            for (var i = 0, x, imax = this.length; i < imax; i++){
		                x = this[i];
		                
		                if (x._id == null) {
		                    insert.push(x.serialize());
							insertIndexes.push(i);
		                    continue;
		                }
		                update.push(x.serialize());
		            }
		            
		            if (insert.length && update.length) {
		                var listener = cb_createListener(2, onComplete);
		                
		                db_insert(coll, insert, this._insertedDelegate(this, listener, insertIndexes));
		                db_updateMany(coll, update, listener);
		                return this;
		            }
		            
		            if (insert.length) {
		                db_insert(coll, insert, this._insertedDelegate(this, this._completed, insertIndexes));
		                return this;
		            }
		            
		            if (update.length) {
		                db_updateMany(coll, update, onComplete);
		                return this;
		            }
		            
		            return this;
		        },
		        del: function(data){
		            if (data == null && arguments.length !== 0) {
						console.error('<MongoStore:del> - selector is specified, but is undefined');
						return this;
					}
		            
		            if (this._ensureFree() === false)
		                return this;
		            
		            var array = data == null
		                ? this.toArray()
		                : this.remove(data)
		                ;
		                
		            if (array && array.length) {
		                var ids = [];
		                for (var i = 0, x, imax = array.length; i < imax; i++){
		                    x = array[i];
		                    if (x._id) {
		                        ids.push(x._id);
		                    }
		                }
		                
		                db_remove(this._coll, {
		                    _id: {
		                        $in: ids
		                    }
		                }, false, fn_proxy(this._completed, this));
		                
		            }else{
		                this._completed();   
		            }
		            
		            return this;
		        },
		        
		        
		        Static: {
		            fetch: function(query, options){
		                return new this().fetch(query, options);
		            },
					count: function(query){
						var dfr = new Deferred;
						db_count(this.prototype._coll, query, function(error, count){
							if (error != null) {
								dfr.reject(count);
								return;
							}
							dfr.resolve(count);
						});
						return dfr;
					}
		        },
		        
		        /* -- private -- */
		        _busy: false,
				
				_coll: null,
				_indexes: null,
				_primaryKey: null,
				
		        _ensureFree: function(){
		            if (this._busy) {
						console.warn('<mongo:collection> requested transport, but is busy by the same instance.');
		                return false;
		            }
		            
		            this._busy = true;
		            this._resolved = null;
		            this._rejected = null;
		            
		            return true;
		        },
		        _completed: function(error){
		            this._busy = false;
		            
		            if (error) 
		                this.reject(error);
		            else
		                this.resolve(this);
		        },
		        _fetched: function(error, json){
		            if (arr_isArray(json)) {
		                
		                for (var i = 0, x, imax = json.length; i < imax; i++){
		                    x = json[i];
		                    
		                    collection_push(this, x);
		                }
		                
		            } else if (json) {
		                collection_push(this, json);
		            }
		            
		            this._completed(error);
		        },
				
				_insertedDelegate: function(ctx, callback, indexes){
					
					/**
					 *	@TODO make sure if mongodb returns an array of inserted documents
					 *	in the same order as it was passed to insert method
					 */
					
					function call() {
						callback.call(ctx);
					}
					
					return function(error, coll){
						
						if (is_Array(coll) === false) {
							console.error('<mongo:bulk insert> array expected');
							
							return call();
						}
						
						if (coll.length !== indexes.length) {
							console.error('<mongo:bul insert> count missmatch', coll.length, indexes.length);
							
							return call();
						}
						
						for (var i = 0, index, imax = indexes.length; i < imax; i++){
							index = indexes[i];
							
							ctx[index]._id = coll[i]._id;
						}
						
						call();
					};
				}
		    });    
		    
		    
		    var Constructor = function(collection) {
		
		        return new MongoStoreCollection(collection);
		    };
		
		    Constructor.prototype = MongoStoreCollection.prototype;
		
		
		    return Constructor;
		
		}());
		// end:source MongoCollection.js
		
		
		return {
			Single: MongoStoreSingle,
			Collection: MongoStoreCollection,
			settings: Settings,
			
			resolveDb: db_resolveDb,
			resolveCollection: db_resolveCollection,
			
			createId: function(id){
				return db_ensureObjectID(id);
			},
			
			ensureIndexes: function(Ctor) {
				var proto = Ctor.prototype,
					indexes = proto._indexes,
					coll = proto._coll,
					dfr = new Deferred()
					;
					
				if (indexes == null) 
					return dfr.reject('<No indexes> ' + coll);
				
				IndexHandler.ensure(coll, indexes, cb_completeDelegate(dfr));
				return dfr;
			},
			
			ensureIndexesAll: function(){
				var dfr = new Deferred;
				IndexHandler.ensureAll(cb_completeDelegate(dfr));
				return dfr;
			},
			
			profiler: {
				/* ( state, { slowLimit, onDetect, detector } ) */
				toggle: db_profiler_toggle,
				getData: db_profiler_getData
			}
		};
	}());
	
	// end:source /src/store/mongo/MongoStore.js
	

	// source /src/Class.Static.js
	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
	 *
	 * @obsolete - use 'Self' property instead
	 */
	Class.bind = function(cntx) {
		var arr = arguments,
			i = 1,
			length = arguments.length,
			key;
	
		for (; i < length; i++) {
			key = arr[i];
			cntx[key] = cntx[key].bind(cntx);
		}
		return cntx;
	};
	
	Class.cfg = function(mix, value){
		
		if (is_String(mix)) {
			
			if (arguments.length === 1) 
				return _cfg[mix];
			
			_cfg[mix] = value;
			return;
		}
		
		if (is_Object(mix)) {
			
			for(var key in mix){
				
				Class.cfg(key, mix[key]);
			}
		}
	};
	
	
	
	Class.Model = {};
	Class.Serializable = Serializable;
	Class.Deferred = Deferred;
	Class.EventEmitter = EventEmitter;
	Class.Await = Await;
	Class.validate = obj_validate;
	
	Class.stringify = class_stringify;
	Class.parse = class_parse;
	Class.patch = class_patch;
	Class.properties = class_properties;
	// end:source /src/Class.Static.js
	
	// source /src/collection/Collection.js
	Class.Collection = (function(){
		
		// source ArrayProto.js
		
		var ArrayProto = (function(){
		
			function check(x, mix) {
				if (mix == null)
					return false;
				
				if (typeof mix === 'function') 
					return mix(x);
				
				if (typeof mix === 'object'){
					
					if (x.constructor === mix.constructor && x.constructor !== Object) {
						return x === mix;
					}
					
					var value, matcher;
					for (var key in mix) {
						
						value = x[key];
						matcher = mix[key];
						
						if (typeof matcher === 'string') {
							var c = matcher[0],
								index = 1;
							
							if ('<' === c || '>' === c){
								
								if ('=' === matcher[1]){
									c +='=';
									index++;
								}
								
								matcher = matcher.substring(index);
								
								switch (c) {
									case '<':
										if (value >= matcher)
											return false;
										continue;
									case '<=':
										if (value > matcher)
											return false;
										continue;
									case '>':
										if (value <= matcher)
											return false;
										continue;
									case '>=':
										if (value < matcher)
											return false;
										continue;
								}
							}
						}
						
						// eqeq to match by type diffs.
						if (value != matcher) 
							return false;
						
					}
					return true;
				}
				
				console.warn('No valid matcher', mix);
				return false;
			}
		
			var ArrayProto = {
				length: 0,
				push: function(/*mix*/) {
					var imax = arguments.length,
						i = -1;
					while ( ++i < imax ) {
						
						this[this.length++] = create(this._ctor, arguments[i]);
					}
					
					return this;
				},
				pop: function() {
					var instance = this[--this.length];
			
					this[this.length] = null;
					return instance;
				},
				shift: function(){
					if (this.length === 0) 
						return null;
					
					
					var first = this[0],
						imax = this.length - 1,
						i = 0;
					
					for (; i < imax; i++){
						this[i] = this[i + 1];
					}
					
					this[imax] = null;
					this.length--;
					
					return first;
				},
				unshift: function(mix){
					this.length++;
					
					var imax = this.length;
					
					while (--imax) {
						this[imax] = this[imax - 1];
					}
					
					this[0] = create(this._ctor, mix);
					return this;
				},
				
				splice: function(index, count /* args */){
					
					var length = this.length;
					var i, imax, y;
					
					// clear range after length until index
					if (index >= length) {
						count = 0;
						for (i = length, imax = index; i < imax; i++){
							this[i] = void 0;
						}
					}
					
					var	rm_count = count,
						rm_start = index,
						rm_end = index + rm_count,
						add_count = arguments.length - 2,
						
						new_length = length + add_count - rm_count;
					
					
					// move block
					
					var block_start = rm_end,
						block_end = length,
						block_shift = new_length - length;
					
					if (0 < block_shift) {
						// move forward
						
						i = block_end;
						while (--i >= block_start) {
							
							this[i + block_shift] = this[i];
							
						}
		
					}
					
					if (0 > block_shift) {
						// move backwards
						
						i = block_start;				
						while (i < block_end) {
							this[i + block_shift] = this[i];
							i++;
						}
					}
					
					// insert
					
					i = rm_start;
					y = 2;
					for (; y < arguments.length; y) {
						this[i++] = create(this._ctor, arguments[y++]);
					}
					
					
					this.length = new_length;
					return this;
				},
				
				slice: function(){
					return fn_apply(_Array_slice, this, arguments);
				},
				
				sort: function(fn){
					_Array_sort.call(this, fn);
					return this;
				},
				
				reverse: function(){
					var array = _Array_slice.call(this),
						imax = this.length,
						i = -1
						;
					while( ++i < imax) {
						this[i] = array[imax - i - 1];
					}
					return this;
				},
				
				toString: function(){
					return _Array_slice.call(this, 0).toString()
				},
				
				each: forEach,
				forEach: forEach,
				
				
				where: function(mix){
					
					var collection = new this.constructor();
					
					for (var i = 0, x, imax = this.length; i < imax; i++){
						x = this[i];
						
						if (check(x, mix)) {
							collection[collection.length++] = x;
						}
					}
					
					return collection;
				},
				remove: function(mix){
					var index = -1,
						array = [];
					for (var i = 0, imax = this.length; i < imax; i++){
						
						if (check(this[i], mix)) {
							array.push(this[i]);
							continue;
						}
						
						this[++index] = this[i];
					}
					for (i = ++index; i < imax; i++) {
						this[i] = null;
					}
					
					this.length = index;
					return array;
				},
				first: function(mix){
					if (mix == null)
						return this[0];
					
					var i = this.indexOf(mix);
					return i !== -1
						? this[i]
						: null;
						
				},
				last: function(mix){
					if (mix == null)
						return this[this.length - 1];
					
					var i = this.lastIndexOf(mix);
					return i !== -1
						? this[i]
						: null;
				},
				indexOf: function(mix, index){
					if (mix == null)
						return -1;
					
					if (index != null) {
						if (index < 0) 
							index = 0;
							
						if (index >= this.length) 
							return -1;
						
					}
					else{
						index = 0;
					}
					
					
					var imax = this.length;
					for(; index < imax; index++) {
						if (check(this[index], mix))
							return index;
					}
					return -1;
				},
				lastIndexOf: function(mix, index){
					if (mix == null)
						return -1;
					
					if (index != null) {
						if (index >= this.length) 
							index = this.length - 1;
						
						if (index < 0) 
							return -1;
					}
					else {
						index = this.length - 1;
					}
					
					
					for (; index > -1; index--) {
						if (check(this[index], mix))
							return index;
					}
					
					return -1;
				},
				
				map: function(fn){
					
					var arr = [],
						imax = this.length,
						i = -1;
					while( ++i < imax ){
						arr[i] = fn(this[i]);
					}
					return arr;
				},
				
				filter: function(fn, ctx){
					var coll = new this.constructor(),
						imax = this.length,
						i = -1;
					while ( ++i < imax ){
						if (fn.call(ctx || this, this[i])) {
							coll.push(this[i]);
						}
					}
					return coll;
				}
			};
			
			// ES6 iterator
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				ArrayProto[Symbol.iterator] = function(){
					var arr = this,
						i = -1;
					return {
						next: function(){
							return {
								value: arr[++i],
								done: i > arr.length - 1
							};
						},
						hasNext: function(){
							return i < arr.length;
						}
					}
				};
			}
			
			function forEach(fn, ctx){
				var imax = this.length,
					i = -1
					;
				while( ++i < imax ) {
					fn.call(ctx || this, this[i], i);
				}
				return this;
			}
			
			
			return ArrayProto;
		}());
		
		// end:source ArrayProto.js
		
		function create(Constructor, mix) {
			
			if (mix instanceof Constructor) 
				return mix;
			
			return new Constructor(mix);
		}
		
		var CollectionProto = {
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			},
			
			toJSON: json_proto_arrayToJSON
		};
		
		function Collection(/* (ClassName, Child, Proto) (Child, Proto) */) {
			var length = arguments.length,
				Proto = arguments[length - 1],
				Child = arguments[length - 2],
				
				className
				;
			
			if (length > 2) 
				className = arguments[0];
			
			
			Proto._ctor = Child;
			obj_inherit(Proto, CollectionProto, ArrayProto);
			
			return className == null
				? Class(Proto)
				: Class(className, Proto)
				;
		}
		
		
		return Collection;
	}());
	// end:source /src/collection/Collection.js
	
	// source /src/fn/fn.js
	(function(){
		
		// source memoize.js
		var fn_memoize,
			fn_memoizeAsync;
		
		(function(){
			fn_memoize = function(fn) {
				var _cache = {},
					_args = [];
				return function() {
					var id = fn_argsId(arguments, _args);
					
					return _cache[id] == null
						? (_cache[id] = fn_apply(fn, this, arguments))
						: _cache[id];
				};
			};
			
			fn_memoizeAsync = function(fn) {
				var _cache = {},
					_cacheCbs = {},
					_args = [];
					
				return function(){
					
					var args = _Array_slice.call(arguments),
						callback = args.pop();
					
					var id = fn_argsId(args, _args);
					
					if (_cache[id]){
						fn_apply(callback, this, _cache[id])
						return; 
					}
					
					if (_cacheCbs[id]) {
						_cacheCbs[id].push(callback);
						return;
					}
					
					_cacheCbs[id] = [callback];
					
					args = _Array_slice.call(args);
					args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
					
					fn_apply(fn, this, args);
				};
			};
			
			// === private
			function fn_resolveDelegate(cache, cbs, id) {
				return function(){
					cache[id] = arguments;
					
					for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
						x = cbs[id][i];
						fn_apply(x, this, arguments);
					}
					
					cbs[i] = null;
					cache = null;
					cbs = null;
				};
			}
		}());
		
		
		// end:source memoize.js
		
		Class.Fn = {
			memoize: fn_memoize,
			memoizeAsync: fn_memoizeAsync
		};
		
	}());
	// end:source /src/fn/fn.js
	
	exports.Class = Class;
	
}));