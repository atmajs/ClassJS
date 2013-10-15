var StoreProto = {
	
	// Serialization
	deserialize: function(json) {
		
		if (typeof json === 'string') {
			try {
				json = JSON.parse(json);
			}catch(error){
				console.error('<json:deserialize>', json);
				return this;
			}
		}
		
		if (is_Array(json) && is_Function(this.push)) {
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