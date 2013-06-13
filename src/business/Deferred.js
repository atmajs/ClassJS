var DeferredProto = {
	_isAsync: true,
		
	_done: null,
	_fail: null,
	_always: null,
	_resolved: false,
	_rejected: false,
	
	deferr: function(){
		this._rejected = false;
		this._resolved = false;
	},
	
	resolve: function() {
		this._fail = null;
		this._resolved = arguments;

		var cbs = this._done,
			imax = cbs && cbs.length,
			i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++].apply(this, arguments);
			}
			this._done = null;
		}

		cbs = this._always;
		imax = cbs && cbs.length,
		i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++].apply(this, this);
			}
			this._always = null;
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
			while (imax-- !== 0) {
				cbs[i++].apply(this, arguments);
			}
			this._fail = null;
		}

		cbs = this._always;
		imax = cbs && cbs.length,
		i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++].apply(this, this);
			}
			this._always = null;
		}

		return this;
	},

	done: function(callback) {
		
		if (this._resolved)
			callback.apply(this, this._resolved);
		else
			(this._done || (this._done = [])).push(callback);


		return this;
	},
	fail: function(callback) {
		
		if (this._rejected)
			callback.apply(this, this._rejected);
		else
			(this._fail || (this._fail = [])).push(callback);


		return this;
	},
	always: function(callback) {
		if (this._rejected || this._resolved)
			callback.apply(this, this);
		else
			(this._always || (this._always = [])).push(callback);

		return this;
	},
};