(function(root, factory){
	"use strict";

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	
	factory(_global, _exports);
	
}(this, function(global, exports){
	"use strict";
	
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	
	// source ../src/util/is.js
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
	// end:source ../src/util/is.js
	// source ../src/util/array.js
	function arr_each(array, callback) {
		
		if (arr_isArray(array)) {
			for (var i = 0, imax = array.length; i < imax; i++){
				callback(array[i], i);
			}
			return;
		}
		
		callback(array);
	}
	
	function arr_isArray(array) {
		return array != null
			&& typeof array === 'object'
			&& typeof array.length === 'number'
			&& typeof array.splice === 'function';
	}
	
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
	// end:source ../src/util/array.js
	// source ../src/util/proto.js
	
	
	var class_inherit = (function() {
		
		var PROTO = '__proto__';
		
		function proto_extend(proto, source) {
			if (source == null) {
				return;
			}
			if (typeof proto === 'function') {
				proto = proto.prototype;
			}
		
			if (typeof source === 'function') {
				source = source.prototype;
			}
			
			for (var key in source) {
				proto[key] = source[key];
			}
		}
		
		var _toString = Object.prototype.toString,
			_isArguments = function(args){
				return _toString.call(args) === '[object Arguments]';
			};
		
		
		function proto_override(proto, key, fn) {
	        var __super = proto[key],
				__proxy = __super == null
					? function() {}
					: function(args){
					
						if (_isArguments(args)) {
							return __super.apply(this, args);
						}
						
						return __super.apply(this, arguments);
					};
	        
	        return function(){
	            this.super = __proxy;
	            
	            return fn.apply(this, arguments);
	        };
	    }
	
		function inherit(_class, _base, _extends, original, _overrides) {
			
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
	
			if (_base != null) {
				proto[PROTO] = _base.prototype;
			}
	
			
			if (_overrides != null) {
				for (var key in _overrides) {
					prototype[key] = proto_override(prototype, key, _overrides[key]);
				}
			}
			
			_class.prototype = prototype;
		}
	
	
		// browser that doesnt support __proto__ 
		function inherit_protoLess(_class, _base, _extends, original) {
			if (_base != null) {
				var tmp = function() {};
	
				tmp.prototype = _base.prototype;
	
				_class.prototype = new tmp();
				_class.prototype.constructor = _class;
			}
	
			proto_extend(_class.prototype, original);
	
	
			if (_extends != null) {
				arr_each(_extends, function(x) {
					var a = {};
					proto_extend(a, x);
					
					delete a.constructor;
					for (var key in a) {
						_class.prototype[key] = a[key];
					}
				});
			}
		}
	
		return '__proto__' in Object.prototype === true ? inherit : inherit_protoLess;
	
	}());
	
	function proto_getProto(mix) {
		if (typeof mix === 'function') {
			return mix.prototype;
		}
		return mix;
	}
	
	var class_inheritStatics = function(_class, mix){
		if (mix == null) {
			return;
		}
		
		if (typeof mix === 'function') {
			for (var key in mix) {
				if (typeof mix[key] === 'function' && mix.hasOwnProperty(key) && _class[key] == null) {
					_class[key] = mix[key];
				}
			}
			return;
		}
		
		if (Array.isArray(mix)) {
			var imax = mix.length,
				i = 0;
			
			// backwards for proper inhertance flow
			while (imax-- !== 0) {
				class_inheritStatics(_class, mix[i++]);
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
	
	function class_extendProtoObjects(proto, _base, _extends){
		var key,
			protoValue;
			
		for (key in proto) {
			protoValue = proto[key];
			
			if (!obj_isRawObject(protoValue))
				continue;
			
			if (_base != null){
				if (obj_isRawObject(_base.prototype[key])) 
					obj_defaults(protoValue, _base.prototype[key]);
			}
			
			if (_extends != null) {
				arr_each(_extends, function(x){
					x = proto_getProto(x);
					
					if (obj_isRawObject(x[key])) 
						obj_defaults(protoValue, x[key]);
				});
			}
		}
	}
	// end:source ../src/util/proto.js
	// source ../src/util/object.js
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
				key, value;
			
			for (key in this) {
				
				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;
				
				if ('Static' === key || 'Validate' === key)
					continue;
				
				value = this[key];
				
				if (value == null)
					continue;
				
				if (typeof value === 'function')
					continue;
				
				
				obj[key] = value;
				
			}
			
			return obj;
		}
	};
	
	// end:source ../src/util/object.js
	// source ../src/util/function.js
	function fn_proxy(fn, cntx) {
	
		return function() {
			switch (arguments.length) {
				case 1:
					return fn.call(cntx, arguments[0]);
				case 2:
					return fn.call(cntx,
						arguments[0],
						arguments[1]);
				case 3:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2]);
				case 4:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3]);
				case 5:
					return fn.call(cntx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3],
						arguments[4]
						);
			};
			
			return fn.apply(cntx, arguments);
		}
	}
	// end:source ../src/util/function.js
	
	
	// source ../src/xhr/XHR.js
	var XHR = {};
	
	arr_each(['get', 'del'], function(key){
		XHR[key] = function(path, sender){
			
			this.promise[key](path).then(function(error, response){
				
				if (error) {
					sender.onError(error, response);
					return;
				}
				
				sender.onSuccess(response);
			});
			
		};
	});
	
	arr_each(['post', 'put'], function(key){
		XHR[key] = function(path, data, cb){
			this.promise[key](path, data)
			
			.then(function(error, response){
				cb(error, response);
			});
		};
	});
	
	
	// end:source ../src/xhr/XHR.js
	// source ../src/xhr/promise.js
	/*
	 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
	 *  Licensed under the New BSD License.
	 *  https://github.com/stackp/promisejs
	 */
	
	(function(exports) {
	
	    function bind(func, context) {
	        return function() {
	            return func.apply(context, arguments);
	        };
	    }
	
	    function Promise() {
	        this._callbacks = [];
	    }
	
	    Promise.prototype.then = function(func, context) {
	        var f = bind(func, context);
	        if (this._isdone) {
	            f(this.error, this.result);
	        } else {
	            this._callbacks.push(f);
	        }
	    };
	
	    Promise.prototype.done = function(error, result) {
	        this._isdone = true;
	        this.error = error;
	        this.result = result;
	        for (var i = 0; i < this._callbacks.length; i++) {
	            this._callbacks[i](error, result);
	        }
	        this._callbacks = [];
	    };
	
	    function join(funcs) {
	        var numfuncs = funcs.length;
	        var numdone = 0;
	        var p = new Promise();
	        var errors = [];
	        var results = [];
	
	        function notifier(i) {
	            return function(error, result) {
	                numdone += 1;
	                errors[i] = error;
	                results[i] = result;
	                if (numdone === numfuncs) {
	                    p.done(errors, results);
	                }
	            };
	        }
	
	        for (var i = 0; i < numfuncs; i++) {
	            funcs[i]()
	                .then(notifier(i));
	        }
	
	        return p;
	    }
	
	    function chain(funcs, error, result) {
	        var p = new Promise();
	        if (funcs.length === 0) {
	            p.done(error, result);
	        } else {
	            funcs[0](error, result)
	                .then(function(res, err) {
	                funcs.splice(0, 1);
	                chain(funcs, res, err)
	                    .then(function(r, e) {
	                    p.done(r, e);
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
	        var p = new Promise();
	        var xhr, payload;
	        data = data || {};
	        headers = headers || {};
	
	        try {
	            xhr = new_xhr();
	        } catch (e) {
	            p.done(-1, "");
	            return p;
	        }
	
	        payload = _encode(data);
	        if (method === 'GET' && payload) {
	            url += '?' + payload;
	            payload = null;
	        }
	
	        xhr.open(method, url);
	        xhr.setRequestHeader('Content-type',
	            'application/x-www-form-urlencoded');
	        for (var h in headers) {
	            if (headers.hasOwnProperty(h)) {
	                xhr.setRequestHeader(h, headers[h]);
	            }
	        }
	
	        function onTimeout() {
	            xhr.abort();
	            p.done(exports.promise.ETIMEOUT, "");
	        }
	
	        var timeout = exports.promise.ajaxTimeout;
	        if (timeout) {
	            var tid = setTimeout(onTimeout, timeout);
	        }
	
	        xhr.onreadystatechange = function() {
	            if (timeout) {
	                clearTimeout(tid);
	            }
	            if (xhr.readyState === 4) {
	                if (xhr.status === 200) {
	                    p.done(null, xhr.responseText);
	                } else {
	                    p.done(xhr.status, xhr.responseText);
	                }
	            }
	        };
	
	        xhr.send(payload);
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
	
	        /* Error codes */
	        ENOXHR: 1,
	        ETIMEOUT: 2,
	
	        /**
	         * Configuration parameter: time in milliseconds after which a
	         * pending AJAX request is considered unresponsive and is
	         * aborted. Useful to deal with bad connectivity (e.g. on a
	         * mobile network). A 0 value disables AJAX timeouts.
	         *
	         * Aborted requests resolve the promise with a ETIMEOUT error
	         * code.
	         */
	        ajaxTimeout: 0
	    };
	
	    if (typeof define === 'function' && define.amd) {
	        /* AMD support */
	        define(function() {
	            return promise;
	        });
	    } else {
	        exports.promise = promise;
	    }
	
	
	})(XHR);
	// end:source ../src/xhr/promise.js
	
	// source ../src/business/Serializable.js
	function Serializable(data) {
		
		if (this === Class || this == null || this === global) {
			
			var Ctor = function(data){
				Serializable.call(this, data);
			};
			
			Ctor.prototype._props = data;
			
			obj_extend(Ctor.prototype, Serializable.prototype);
			
			return Ctor;
		}
		
		if (data != null)
			this.deserialize(data);
		
	}
	
	Serializable.prototype = {
		constructor: Serializable,
		
		serialize: function() {
			return JSON.stringify(this);
		},
		
		deserialize: function(json) {
			
			if (is_String(json)) 
				json = JSON.parse(json);
			
			var props = this._props,
				key,
				Mix;
			
			for (key in json) {
				
				if (props != null) {
					Mix = props[key];
					
					if (Mix != null) {
						
						if (is_Function(Mix)) {
							this[key] = new Mix(json[key]);
							continue;
						}
						
						var deserialize = Mix.deserialize;
						
						if (is_Function(deserialize)) {
							this[key] = deserialize(json[key]);
							continue;
						}
						
					}
				}
				
				this[key] = json[key];
			}
			
			return this;
		}
	};
	
	
	// end:source ../src/business/Serializable.js
	// source ../src/business/Route.js
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
			
			console.error('Paths breadcrumbs should be match by regexps');
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
	// end:source ../src/business/Route.js
	// source ../src/business/Deferred.js
	var DeferredProto = {
		_isAsync: true,
			
		_done: null,
		_fail: null,
		_always: null,
		_resolved: null,
		_rejected: null,
		
		deferr: function(){
			this._rejected = null;
			this._resolved = null;
		},
		
		resolve: function() {
			this._fail = null;
			this._resolved = arguments;
	
			var cbs = this._done,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				this._done = null;
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				this._always = null;
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
			}
	
			return this;
		},
		reject: function() {
			this._done = null;
			this._rejected = arguments;
	
			var cbs = this._fail,
				imax = cbs && cbs.length,
				i = 0;
			if (cbs) {
				this._fail = null;
				while (imax-- !== 0) {
					cbs[i++].apply(this, arguments);
				}
			}
	
			cbs = this._always;
			imax = cbs && cbs.length,
			i = 0;
			if (cbs) {
				this._always = null;
				while (imax-- !== 0) {
					cbs[i++].apply(this, this);
				}
			}
	
			return this;
		},
	
		done: function(callback) {
			
			if (this._resolved != null)
				callback.apply(this, this._resolved);
			else
				(this._done || (this._done = [])).push(callback);
	
	
			return this;
		},
		fail: function(callback) {
			
			if (this._rejected != null)
				callback.apply(this, this._rejected);
			else
				(this._fail || (this._fail = [])).push(callback);
	
	
			return this;
		},
		always: function(callback) {
			if (this._rejected != null || this._resolved != null)
				callback.apply(this, this);
			else
				(this._always || (this._always = [])).push(callback);
	
			return this;
		},
	};
	// end:source ../src/business/Deferred.js
	// source ../src/business/EventEmitter.js
	var EventEmitter = (function(){
	 
		function Emitter() {
			this._listeners = {};
		}
	 
		
	    Emitter.prototype = {
	        constructor: Emitter,
			
	        on: function(event, callback) {
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
	        once: function(event, callback){
	            callback._once = true;
	            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
	            return this;
	        },
			
			pipe: function(event){
				var that = this,
					slice = Array.prototype.slice, 
					args;
				return function(){
					args = slice.call(arguments);
					args.unshift(event);
					that.trigger.apply(that, args);
				};
			},
	        
	        trigger: function() {
	            var args = Array.prototype.slice.call(arguments),
	                event = args.shift(),
	                fns = this._listeners[event],
	                fn, imax, i = 0;
	                
	            if (fns == null)
					return this;
				
				for (imax = fns.length; i < imax; i++) {
					fn = fns[i];
					fn.apply(this, args);
					
					if (fn._once === true){
						fns.splice(i,1);
						i--;
						imax--;
					}
				}
			
	            return this;
	        },
	        off: function(event, callback) {
	            if (this._listeners[event] == null)
					return this;
					
				var arr = this._listeners[event],
					imax = arr.length,
					i = 0;
					
				for (; i < imax; i++) {
					
					if (arr[i] === callback) 
						arr.splice(i, 1);
					
					i--;
					imax--;
				}
			
	            return this;
			}
	    };
	    
	    return Emitter;
	    
	}());
	
	// end:source ../src/business/EventEmitter.js
	// source ../src/business/Validation.js
	var Validation = (function(){
		
		
		function val_check(instance, validation) {
			if (typeof validation === 'function') 
				return validation.call(instance);
			
			var result;
			
			for (var property in validation) {
				
				result = val_checkProperty(instance, property, validation[property]);
				
				if (result)
					return result;
			}
		}
		
		
		function val_checkProperty(instance, property, checker) {
			var value = obj_getProperty(instance, property);
			
			return checker.call(instance, value);
		}
		
		
		function val_process(instance) {
			var result;
			
			
			if (instance.Validate != null) {
				result  = val_check(instance, instance.Validate);
				if (result)
					return result;
			}
			
			// @TODO Do nest recursion check ?
			//
			//for (var key in instance) {
			//	if (instance[key] == null || typeof instance !== 'object' ) 
			//		continue;
			//	
			//	result = val_process(instance, instance[key].Validate)
			//}
			
		}
		
		return {
			validate: val_process
		};
		
	}());
	// end:source ../src/business/Validation.js
	
	
	// source ../src/collection/Collection.js
	var Collection = (function(){
		
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
				push: function(/*mix*/) {
					for (var i = 0, imax = arguments.length; i < imax; i++){
						
						this[this.length++] = create(this._constructor, arguments[i]);
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
					
					this[0] = create(this._constructor, mix);
					return this;
				},
				
				splice: function(index, count /* args */){
					var i, imax, length, y;
					
					
					// clear range after length until index
					if (index >= this.length) {
						count = 0;
						for (i = this.length, imax = index; i < imax; i++){
							this[i] = void 0;
						}
					}
					
					var	rm_count = count,
						rm_start = index,
						rm_end = index + rm_count,
						add_count = arguments.length - 2,
						
						new_length = this.length + add_count - rm_count;
					
					
					// move block
					
					var block_start = rm_end,
						block_end = this.length,
						block_shift = new_length - this.length;
					
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
						this[i++] = create(this._constructor, arguments[y++]);
					}
					
					
					this.length = new_length;
					return this;
				},
				
				slice: function(){
					return _Array_slice.apply(this, arguments);
				},
				
				sort: function(fn){
					_Array_sort.call(this, fn);
					return this;
				},
				
				reverse: function(){
					var array = _Array_slice.call(this, 0);
						
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = array[imax - i - 1];
					}
					return this;
				},
				
				toString: function(){
					return _Array_slice.call(this, 0).toString()
				},
				
				each: function(fn, cntx){
					for (var i = 0, imax = this.length; i < imax; i++){
						
						fn.call(cntx || this, this[i], i);
						
					}
				},
				
				
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
					
					var imax = this.length,
						i = 0;
					while (--imax !== -1) {
						if (check(this[i++], mix))
							return this[i - 1];
					}
					return null;
				},
				last: function(mix){
					if (mix == null)
						return this[0];
					
					var imax = this.length;
					while (--imax !== -1) {
						if (check(this[imax], mix))
							return this[imax];
					}
					return null;
				}
			};
			
			
			return ArrayProto;
		}());
		
		// end:source ArrayProto.js
		
		function create(Constructor, mix) {
			
			if (mix instanceof Constructor) 
				return mix;
			
			return new Constructor(mix);
		}
		
		var CollectionProto = {
			serialize: function(){
				return JSON.stringify(this.toArray());
			},
			
			deserialize: function(mix){
				for (var i = 0, imax = mix.length; i < imax; i++){
					this[this.length++] = create(this._constructor, mix[i]);
				}
				
				return this;
			},
			
			del: function(mix){
				
				if (mix == null && arguments.length !== 0) {
					console.error('Collection.del - selector is specified, but is undefined');
					return this;
				}
				
				if (mix == null) {
					
					for (var i = 0, imax = this.length; i < imax; i++){
						this[i] = null;
					}
					this.length = 0;
					
					LocalStore.prototype.del.call(this);
					return this;
				}
				
				var array = this.remove(mix);
				if (array.length === 0) 
					return this;
				
				return this.save();
			},
			
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			}	
		};
		
		function overrideConstructor(baseConstructor, Child) {
			
			return function CollectionConstructor(){
				this.length = 0;
				this._constructor = Child;
				
				if (baseConstructor != null)
					return baseConstructor.apply(this, arguments);
				
				return this;
			};
			
		}
		
		function Collection(Child, Proto) {
			
			Proto.Construct = overrideConstructor(Proto.Construct, Child);
			
			
			obj_inherit(Proto, CollectionProto, ArrayProto);
			return Class(Proto);
		}
		
		
		return Collection;
	}());
	// end:source ../src/collection/Collection.js
	
	// source ../src/store/Store.js
	var StoreProto = {
		
		// Serialization
		deserialize: function(json) {
			
			if (typeof json === 'string') 
				json = JSON.parse(json);
			
			
			for (var key in json) 
				this[key] = json[key];
			
			return this;
		},
		serialize: function() {
			return JSON.stringify(this);
		},
		
		
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
	// end:source ../src/store/Store.js
	// source ../src/store/Remote.js
	/**
	 *	Alpha - Test - End
	 */
	
	var Remote = (function(){
		
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, DeferredProto, {
			
			fetch: function(data){
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				XHR.post(this._route.create(this), this.serialize(), callback);
			},
			
			del: function(callback){
				XHR.del(this._route.create(this), this.serialize(), callback);
			},
			
			onSuccess: function(response){
				var json;
				
				try {
					json = JSON.parse(response);	
				} catch(error) {
					this.onError(error);
					return;
				}
				
				
				this.deserialize(json);
				this.resolve(this);
			},
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		return function(route){
			
			return new XHRRemote(route);
			
		};
		
	}());
	// end:source ../src/store/Remote.js
	// source ../src/store/LocalStore.js
	var LocalStore = (function(){
		
		var LocalStore = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(LocalStore, StoreProto, DeferredProto, {
			
			fetch: function(data){
				
				var path = this._route.create(data || this),
					object = localStorage.getItem(path);
				
				if (object == null) {
					this.resolve(this);
					return this;
				}
				
				if (is_String(object)){
					try {
						object = JSON.parse(object);
					} catch(e) {
						this.onError(e);
					}
				}
				
				this.deserialize(object);
				
				return this.resolve(this);
			},
			
			save: function(callback){
				var path = this._route.create(this),
					store = this.serialize();
				
				localStorage.setItem(path, store);
				callback && callback();
				return this;
			},
			
			del: function(data){
				var path = this._route.create(data || this);
				
				localStorage.removeItem(path);
				return this;
			},
			
			onError: function(error){
				this.reject({
					error: error
				});
			}
			
			
		});
		
		
		
		var Constructor = function(route){
			
			return new LocalStore(route);
		};
		
		Constructor.prototype = LocalStore.prototype;
		
		
		return Constructor;
	
	}());
	// end:source ../src/store/LocalStore.js
	
	
	// source ../src/Class.js
	var Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			_store = data.Store,
			_self = data.Self,
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
		if (_self != null) {
			delete data.Self;
		}
		if (_construct != null) {
			delete data.Construct;
		}
		
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
		
		if (_overrides != null) {
			delete data.Override;
		}
		
		if (data.toJSON === void 0) {
			data.toJSON = JSONHelper.toJSON;
		}
	
	
		if (_base == null && _extends == null && _self == null) {
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
			
			if (_self != null) {
				for (var key in _self) {
					this[key] = fn_proxy(_self[key], this);
				}
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
	
		class_extendProtoObjects(data, _base, _extends);
		class_inherit(_class, _base, _extends, data, _overrides);
	
	
		data = null;
		_static = null;
	
		return _class;
	};
	// end:source ../src/Class.js
	// source ../src/Class.Static.js
	/**
	 * Can be used in Constructor for binding class's functions to class's context
	 * for using, for example, as callbacks
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
	
	Class.Remote = Remote;
	Class.LocalStore = LocalStore;
	Class.Collection = Collection;
	
	Class.Serializable = Serializable;
	Class.Deferred = DeferredProto;
	Class.EventEmitter = EventEmitter;
	
	Class.validate = Validation.validate;
	// end:source ../src/Class.Static.js
	
	
	// source ../src/fn/fn.js
	(function(){
		
		// source memoize.js
		
		
		function args_match(a, b) {
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
		
		function args_id(store, args) {
		
			if (args.length === 0)
				return 0;
		
			
			for (var i = 0, imax = store.length; i < imax; i++) {
				
				if (args_match(store[i], args))
					return i + 1;
			}
			
			store.push(args);
			return store.length;
		}
		
		
		function fn_memoize(fn) {
		
			var _cache = {},
				_args = [];
				
			return function() {
		
				var id = args_id(_args, arguments);
		
				
				return _cache[id] == null
					? (_cache[id] = fn.apply(this, arguments))
					: _cache[id];
			};
		}
		
		
		function fn_resolveDelegate(cache, cbs, id) {
			
			return function(){
				cache[id] = arguments;
				
				for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
					x = cbs[id][i];
					x.apply(this, arguments);
				}
				
				cbs[i] = null;
				cache = null;
				cbs = null;
			};
		}
		
		function fn_memoizeAsync(fn) {
			var _cache = {},
				_cacheCbs = {},
				_args = [];
				
			return function(){
				
				var args = Array.prototype.slice.call(arguments),
					callback = args.pop();
				
				var id = args_id(_args, args);
				
				if (_cache[id]){
					callback.apply(this, _cache[id])
					return; 
				}
				
				if (_cacheCbs[id]) {
					_cacheCbs[id].push(callback);
					return;
				}
				
				_cacheCbs[id] = [callback];
				
				args = Array.prototype.slice.call(args);
				args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
				
				fn.apply(this, args);
			};
		}
		
			
			
		
		// end:source memoize.js
		
		Class.Fn = {
			memoize: fn_memoize,
			memoizeAsync: fn_memoizeAsync
		};
		
	}());
	// end:source ../src/fn/fn.js
	
	exports.Class = Class;
	
}));