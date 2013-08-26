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