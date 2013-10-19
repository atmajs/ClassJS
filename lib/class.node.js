// source ../src/umd.js
(function(root, factory){
	"use strict";

	var _isCommonJS = false,
		_global,
		_exports;
	
	if (typeof exports !== 'undefined' && (root == null || root === exports || root === global)){
		// raw nodejs module
        _global = global;
		_isCommonJS = true;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined'
			? global
			: window
			;
	}
	
	if (_exports == null) {
		_exports = root || _global;
	}
	
	
	factory(_global, _exports);
	
	if (_isCommonJS) {
		module.exports = _exports.Class;
	}
	
}(this, function(global, exports){
	"use strict";
// end:source ../src/umd.js
	
	// source ../src/vars.js
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	// end:source ../src/vars.js
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
	            this['super'] = __proxy;
	            
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
	
			if (_extends != null) {
				arr_each(_extends, function(x) {
					
					delete x.constructor;
					proto_extend(_class, x);
				});
			}
			
			proto_extend(_class, original); 
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
				
				if (typeof val === 'function') 
					continue;
				
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
	
	// end:source ../src/util/object.js
	// source ../src/util/function.js
	function fn_proxy(fn, ctx) {
	
		return function() {
			switch (arguments.length) {
				case 1:
					return fn.call(ctx, arguments[0]);
				case 2:
					return fn.call(ctx,
						arguments[0],
						arguments[1]);
				case 3:
					return fn.call(ctx,
						arguments[0],
						arguments[1],
						arguments[2]);
				case 4:
					return fn.call(ctx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3]);
				case 5:
					return fn.call(ctx,
						arguments[0],
						arguments[1],
						arguments[2],
						arguments[3],
						arguments[4]
						);
			};
			
			return fn.apply(ctx, arguments);
		}
	}
	
	function fn_isFunction(fn){
		return typeof fn === 'function';
	}
	
	function fn_createDelegate(fn /* args */) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function(){
			if (arguments.length > 0) 
				args = args.concat(arguments);
			
			return fn.apply(null, args);
		};
	}
	// end:source ../src/util/function.js
	
	
	// source ../src/xhr/XHR.js
	var XHR = {};
	
	arr_each(['get'], function(key){
		XHR[key] = function(path, sender){
			
			this
				.promise[key](path)
				.then(function(error, response){
					
					if (error) {
						sender.onError(error, response);
						return;
					}
					
					sender.onSuccess(response);
				});
			
		};
	});
	
	arr_each(['del', 'post', 'put'], function(key){
		XHR[key] = function(path, data, cb){
			this
				.promise[key](path, data)
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
			
			if (is_String(json)) {
				try {
					json = JSON.parse(json);
				}catch(error){
					console.error('<json:deserialize>', json);
					return this;
				}
			}
			
			if (is_Array(json) && is_Function(this.push)) {
				this.length = 0;
				for (var i = 0, imax = json.length; i < imax; i++){
					this.push(json[i]);
				}
				return;
			}
			
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
	// end:source ../src/business/Route.js
	// source ../src/business/Deferred.js
	function Deferred(){}
	
	Deferred.prototype = {
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
	
			var _done = this._done,
				_always = this._always,
				imax, i;
			
			this._done = null;
			this._always = null;
			
			if (_done != null) {
				imax = _done.length;
				i = 0;
				while (imax-- !== 0) {
					_done[i++].apply(this, arguments);
				}
				_done.length = 0;
			}
	
			if (_always != null) {
				imax = _always.length;
				i = 0;
			
				while (imax-- !== 0) {
					_always[i++].call(this, this);
				}
			}
	
			return this;
		},
		reject: function() {
			this._done = null;
			this._rejected = arguments;
			
			var _fail = this._fail,
				_always = this._always,
				imax, i;
			
			this._fail = null;
			this._always = null;
	
			if (_fail != null) {
				imax = _fail.length;
				i = 0;
				while (imax-- !== 0) {
					_fail[i++].apply(this, arguments);
				}
			}
	
			if (_always != null) {
				imax = _always.length;
				i = 0;
				while (imax-- !== 0) {
					_always[i++].call(this, this);
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
				callback.call(this, this);
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
				var listeners = this._listeners[event];
	            if (listeners == null)
					return this;
				
				if (arguments.length === 1) {
					listeners.length = 0;
					return this;
				}
				
				var imax = listeners.length,
					i = 0;
					
				for (; i < imax; i++) {
					
					if (listeners[i] === callback) 
						listeners.splice(i, 1);
					
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
		
		
		function val_check(instance, validation, props) {
			if (is_Function(validation)) 
				return validation.call(instance);
			
			var result,
				property;
			
			if (props) {
				for (var i = 0, imax = props.length; i < imax; i++){
					
					property = props[i];
					result = val_checkProperty(instance, property, validation[property]);
					
					if (result) 
						return result;
				}
				
				return;
			}
			
			for (property in validation) {
				
				result = val_checkProperty(instance, property, validation[property]);
				
				if (result)
					return result;
			}
		}
		
		
		function val_checkProperty(instance, property, checker) {
			
			if (is_Function(checker) === false) 
				return '<validation> Function expected for ' + property;
			
			
			var value = obj_getProperty(instance, property);
			
			return checker.call(instance, value);
		}
		
		
		function val_process(instance /* ... properties */) {
			var result,
				props;
			
			if (arguments.length > 1 && typeof arguments[1] === 'string') {
				props = _Array_slice.call(arguments, 1);
			}
			
			if (instance.Validate != null) {
				result  = val_check(instance, instance.Validate, props);
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
	
	
	Class.Serializable = Serializable;
	Class.Deferred = Deferred;
	Class.EventEmitter = EventEmitter;
	
	Class.validate = Validation.validate;
	// end:source ../src/Class.Static.js
	
	// source ../src/collection/Collection.js
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
					for (var i = 0, imax = arguments.length; i < imax; i++){
						
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
						this[i++] = create(this._ctor, arguments[y++]);
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
		            return this;
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
			toArray: function(){
				var array = new Array(this.length);
				for (var i = 0, imax = this.length; i < imax; i++){
					array[i] = this[i];
				}
				
				return array;
			},
			
			toJSON: JSONHelper.arrayToJSON
		};
		
		//////function overrideConstructor(baseConstructor, Child) {
		//////	
		//////	return function CollectionConstructor(){
		//////		this.length = 0;
		//////		this._constructor = Child;
		//////		
		//////		if (baseConstructor != null)
		//////			return baseConstructor.apply(this, arguments);
		//////		
		//////		return this;
		//////	};
		//////	
		//////}
		
		function Collection(Child, Proto) {
			
			//////Proto.Construct = overrideConstructor(Proto.Construct, Child);
			
			Proto._ctor = Child;
			
			
			obj_inherit(Proto, CollectionProto, ArrayProto);
			return Class(Proto);
		}
		
		
		return Collection;
	}());
	// end:source ../src/collection/Collection.js
	
	// source ../src/store/Store.js
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
	// end:source ../src/store/Store.js
	// source ../src/store/Remote.js
	/**
	 *	Alpha - Test - End
	 */
	
	Class.Remote = (function(){
		
		var XHRRemote = function(route){
			this._route = new Route(route);
		};
		
		obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
			
			serialize: function(){
				
				return is_Array(this)
					? JSONHelper.arrayToJSON.call(this)
					: JSONHelper.toJSON.call(this)
					;
			},
			
			fetch: function(data){
				XHR.get(this._route.create(data || this), this);
				return this;
			},
			
			save: function(callback){
				
				var self = this,
					json = this.serialize(),
					path = this._route.create(this),
					method = this._route.hasAliases(this)
						? 'put'
						: 'post'
					;
				
				this._resolved = null;
				this._rejected = null;
				
				XHR[method](path, json, function(error, response){
						
						// @obsolete -> use deferred
						if (callback) 
							callback(error, response);
						
						if (error) 
							return self.reject(error);
						
						self.resolve(response);
				});
				return this;
			},
			
			del: function(callback){
				var self = this,
					json = this.serialize(),
					path = this._route.create(this);
					
				this._resolved = null;
				this._rejected = null;
				
				XHR.del(path, json, function(error, response){
						
						// @obsolete -> use deferred
						if (callback) 
							callback(error, response);
						
						if (error) 
							return self.reject(error);
						
						self.resolve(response);
				});
				return this;
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
	// source ../src/store/mongo/MongoStore.js
	
	Class.MongoStore = (function(){
	    
	    // source Settings.js
	    
	    var __ip = '127.0.0.1',
	        __port = 27017,
	        __db;
	        
	    var Settings = function(setts){
	        if (setts.ip) 
	            __ip = setts.ip; 
	        
	        if (setts.port) 
	            __port = setts.port; 
	        
	        if (setts.db) 
	            __db = setts.db;
	    };
	    // end:source Settings.js
	    // source Driver.js
	    
	    var db_findSingle,
	        db_findMany,
	        db_insert,
	        db_updateSingle,
	        db_updateMany,
	        db_remove,
	        db_ensureObjectID
	        ;
	    
	    (function(){
	        
	        var db,
	            mongo;
	        
	        
	        db_findSingle = function(coll, query, callback){
	            
	            if (db == null) 
	                return connect(fn_createDelegate(db_findSingle, coll, query, callback));
	                
	            query = queryToMongo(query);
	            db
	                .collection(coll)
	                .findOne(query, function(error, item){
	                    
	                    callback(error, item);
	                });
	            
	        };
	        
	        db_findMany = function(coll, query, callback){
	            if (db == null) 
	                return connect(fn_createDelegate(db_findMany, coll, query, callback));
	            
	            query = queryToMongo(query);
	            db
	                .collection(coll)
	                .find(query, function(error, cursor){
	                    if (error) {
	                        callback(error);
	                        return;
	                    }
	                    
	                    cursor.toArray(function(error, items){
	                        callback(error, items);
	                    });
	                    
	                });
	        };
	        
	        db_insert = function(coll, data, callback){
	            if (db == null)
	                return connect(fn_createDelegate(db_insert, coll, data, callback));
	            
	            db
	                .collection(coll)
	                .insert(data, { safe: true }, callback);
	        }
	        
	        db_updateSingle = function(coll, data, callback){
	            if (db == null) 
	                return connect(fn_createDelegate(db_updateSingle, coll, data, callback));
	            
	            if (data._id == null) 
	                return callback('<mongo:update> invalid ID');
	            
	            db
	                .collection(coll)
	                .update({
	                    _id: db_ensureObjectID(data._id)
	                }, data, {
	                    upsert: true,
	                    multi: false,
	                }, function(error){
	                    
	                    callback(error);
	                });
	        };
	        
	        db_updateMany = function(coll, array, callback){
	            
	            db_updateSingle(coll, array.shift(), function(error){
	                if (error)
	                    return callback(error);
	                
	                if (array.length === 0) 
	                    return callback();
	                
	                db_updateMany(coll, array, callback); 
	            });
	        };
	        
	        db_remove = function(collection, query, isSingle, callback){
	            if (db == null) 
	                return connect(db_remove.bind(null, collection, query, callback));
	            
	            query = queryToMongo(query);
	            db
	                .collection(collection)
	                .remove(query, {
	                    justOne: isSingle
	                }, function(error, count){
	                    
	                    callback(error);
	                });
	        };
	        
	        db_ensureObjectID = function(value){
	            if (is_String(value) && value.length === 24) 
	                return getMongo().ObjectID(value);
	            
	            return value;
	        };
	        
	        
	        var connect = (function(){
	            
	            var listeners = [],
	                connecting = false;
	            
	            
	            return function(callback){
	                if (db) 
	                    return callback();
	                
	                if (__db == null) 
	                    return callback('Database is not set. Call Class.MongoStore.settings({db:"myDbName"})');
	                
	                
	                listeners.push(callback);
	                
	                if (connecting) 
	                    return;
	                
	                getMongo();
	                
	                connecting = true;
	                
	                var Client = mongo.MongoClient,
	                    Server = mongo.Server;
	    
	                new Client(new Server(__ip, __port, {
	                    auto_reconnect: true
	                })).open(function(err, client) {
	                    
	                    db = client.db(__db);
	                    
	                    
	                    for (var i = 0, x, imax = listeners.length; i < imax; i++){
	                        x = listeners[i];
	                        x();
	                    }
	                    
	                    listeners = null;
	                });
	        
	            };
	        }());
	        
	        var getMongo = function(){
	            getMongo = function() {
	                return mongo;
	            };
	            
	            mongo = require('mongodb');
	            
	            return getMongo();
	        };
	        
	        var queryToMongo = function(query){
	            if (query == null) {
	                if (arguments.length !== 0) 
	                    console.warn('<mongo> query should not be empty');
	                
	                return query;
	            }
	            
	            if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) {
	                return query;
	            }
	            
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
	    }());
	    // end:source Driver.js
	    // source MongoSingle.js
	    var MongoStoreSingle = (function() {
	    
	        function MongoStoreSingle(collection) {
	            if (!collection) {
	                console.error('<MongoStore> should define a collection name');
	            }
	            
	            this._collection = collection;
	        }
	    
	        /**
	         * @TODO - replace ensureFree with a stack of calls
	         */
	        obj_inherit(MongoStoreSingle, StoreProto, Serializable, Deferred, {
	            _busy: false,
	            
	            fetch: function(data) {
	                if (this._ensureFree() === false)
	                    return this;
	                
	                db_findSingle(this._collection, data, fn_proxy(this._fetched, this));
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
	                
	                fn(this._collection, json, fn_proxy(this._inserted, this));
	                return this;
	            },
	            del: function() {
	                if (this._ensureFree() === false)
	                    return this;
	                
	                if (this._id) 
	                    db_remove(this._collection, {
	                        _id: this._id
	                    }, true, fn_proxy(this._completed, this));
	                else
	                    this._completed();
	                
	                return this;
	            },
	            
	            Static: {
	                fetch: function(data) {
	                    return new this().fetch(data);
	                }
	            },
	    
	            serialize: JSONHelper.toJSON,
	            deserialize: function(json){
	                
	                Serializable
	                    .prototype
	                    .deserialize
	                    .call(this, json);
	                
	                if (this._id)
	                    this._id = db_ensureObjectID(this._id);
	              
	                return this;  
	            },
	            
	            _ensureFree: function(){
	                if (this._busy) {
	                    console.warn('<mongo:single> requested transport, but is busy by the same instance.');
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
	            _fetched: function(error, json) {
	                this.deserialize(json);
	                
	                this._completed(error);
	            },
	            
	            _inserted: function(error, array){
	                
	                if (array != null && this._id == null) {
	                    
	                    if (is_Array(array) && array.length === 1) 
	                        this._id = array[0]._id
	                    else 
	                        console.error('<mongo:insert-single> expection an array in callback');
	                    
	                    
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
	        
	        function MongoStoreCollection(collection){
	            if (!collection) {
	                console.error('<MongoStore> should define a collection name');
	            }
	            
	            this._collection = collection;
	        }
	        
	        function collection_push(collection, json){
	            var Constructor = collection._constructor,
	                instance = new Constructor(json);
	                
	            if (instance._id == null && fn_isFunction(instance.deserialize)) {
	                instance.deserialize(json);
	            }
	            
	            collection[collection.length++] = instance;
	        }
	        
	        function cb_createListener(count, cb){
	            var _error;
	            return function(error){
	                if (error)
	                    _error = error;
	                    
	                if (--count === 0)
	                    cb(_error);
	            }
	        }
	            
	            
	        obj_inherit(MongoStoreCollection, Deferred, {
	            
	            fetch: function(data){
	                if (this._ensureFree() === false)
	                    return this;
	                
	                db_findMany(this._collection, data, fn_proxy(this._fetched, this));
	                return this;
	            },
	            save: function(){
	                if (this._ensureFree() === false)
	                    return this;
	                
	                var insert = [],
	    				insertIndexes = [],
	                    update = [],
	                    coll = this._collection,
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
	                    
	                    db_remove(this._collection, {
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
	                fetch: function(data){
	                    return new this().fetch(data);
	                }
	            },
	            
	            /* -- private -- */
	            _busy: false,
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
	    };
	}());
	
	// end:source ../src/store/mongo/MongoStore.js
	
	
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