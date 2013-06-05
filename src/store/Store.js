var StoreProto = {
	
	// Serialization
	deserialize: function(json) {
		
		if (typeof json === 'string') 
			json = JSON.parse(json);
		
		
		for (var key in json) 
			this[key] = json[key];
		
		return this;
	},
	serialize: function() {
		return JSON.stringify(this);
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