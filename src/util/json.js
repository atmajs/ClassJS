var JSONHelper = (function() {
	
	var _date_toJSON = Date.prototype.toJSON;
	
	return {
		// Create from Complex Class Instance a lightweight json object 
		toJSON: function() {
			var obj = {},
				key, val;

			for (key in this) {

				// _ (private)
				if (key.charCodeAt(0) === 95)
					continue;

				if ('Static' === key || 'Validate' === key)
					continue;

				val = this[key];

				if (val == null)
					continue;

				switch (typeof val) {
					case 'function':
						continue;
					case 'object':
						var toJSON = val.toJSON;
						
						if (toJSON === _date_toJSON) {
							// do not serialize Date
							break;
						}
						
						if (is_Function(toJSON)) {
							obj[key] = val.toJSON();
							continue;
						}
				}

				obj[key] = val;
			}

			// make mongodb's _id property not private
			if (this._id != null)
				obj._id = this._id;

			return obj;
		},

		arrayToJSON: function() {
			var array = new Array(this.length),
				i = 0,
				imax = this.length,
				x;

			for (; i < imax; i++) {

				x = this[i];

				if (typeof x !== 'object') {
					array[i] = x;
					return;
				}

				array[i] = is_Function(x.toJSON) ? x.toJSON() : JSONHelper.toJSON.call(x);

			}

			return array;
		}
	};

}());