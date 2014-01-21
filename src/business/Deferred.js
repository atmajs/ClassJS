function Deferred(){}

(function(){
	
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
		
		done: function(callback) {
			
			return dfr_bind(
				this,
				this._resolved,
				this._done || (this._done = []),
				callback
			);
		},
		
		fail: function(callback) {
			
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
	
}());