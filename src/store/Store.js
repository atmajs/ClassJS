var StoreProto = {
	
	// Serialization
	deserialize: function(json) {
		
		if (typeof json === 'string') 
			json = JSON.parse(json);
		
		if (arr_isArray(json) && typeof fn_isFunction(this.push)) {
			for (var i = 0, imax = json.length; i < imax; i++){
				this.push(json[i]);
			}
			return this;
		}
		
		for (var key in json) 
			this[key] = json[key];
		
		return this;
	},
	serialize: function() {
		var json = this;
		if (fn_isFunction(json.toArray)) {
			json = json.toArray()
		}
		
		return JSON.stringify(json);
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