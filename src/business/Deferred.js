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