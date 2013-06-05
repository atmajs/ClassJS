var DeferredProto = {
	_isAsync: true,
		
	_done: null,
	_fail: null,
	_always: null,
	_isResolved: false,
	_isRejected: false,
	
	deferr: function(){
		this._isRejected = false;
		this._isResolved = false;
	},
	
	resolve: function() {
		this._fail = null;
		this._isResolved = true;

		var cbs = this._done,
			imax = cbs && cbs.length,
			i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++](this);
			}
			this._done = null;
		}

		cbs = this._always;
		imax = cbs && cbs.length,
		i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++](this);
			}
			this._always = null;
		}

		return this;
	},
	reject: function() {
		this._done = null;
		this._isRejected = true;

		var cbs = this._fail,
			imax = cbs && cbs.length,
			i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++](this);
			}
			this._fail = null;
		}

		cbs = this._always;
		imax = cbs && cbs.length,
		i = 0;
		if (cbs) {
			while (imax-- !== 0) {
				cbs[i++](this);
			}
			this._always = null;
		}

		return this;
	},

	done: function(callback) {
		
		if (this._isResolved)
			callback(this);
		else
			(this._done || (this._done = []))
				.push(callback);


		return this;
	},
	fail: function(callback) {
		
		if (this._isRejected)
			callback(this);
		else
			(this._fail || (this._fail = []))
				.push(callback);


		return this;
	},
	always: function(callback) {
		if (this._isRejected || this._isResolved)
			callback(this);
		else
			(this._always || (this._always = []))
				.push(callback);

		return this;
	},
};