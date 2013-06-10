function Serializable(data) {
	
	if (data == null || typeof data !== 'object')
		return;
	
	for (var key in data) {
		if (data[key] == null)
			continue;
		
		this[key] = data[key];
	}
	
}

Serializable.prototype = {
	constructor: Serializable,
	
	serialize: function() {
		return JSON.stringify(this);
	},
	
	deserialize: function(json) {
		
		if (typeof json === 'string') 
			json = JSON.parse(json);
		
		
		for (var key in json) 
			this[key] = json[key];
		
		return this;
	}
};

