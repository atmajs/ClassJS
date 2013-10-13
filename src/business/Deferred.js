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
