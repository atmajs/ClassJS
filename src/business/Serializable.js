function Serializable(data) {
	
	if (this === Class || this == null || this === global) {
		
		var Ctor = function(data){
			Serializable.call(this, data);
		};
		
		Ctor.prototype._props = data;
		
		obj_extend(Ctor.prototype, Serializable.prototype);
		
		return Ctor;
	}
	
	if (data != null)
		this.deserialize(data);
	
}

Serializable.prototype = {
	constructor: Serializable,
	
	serialize: function() {
		
		return JSON.stringify(this);
	},
	
	deserialize: function(json) {
		
		if (is_String(json)) {
			try {
				json = JSON.parse(json);
			}catch(error){
				console.error('<json:deserialize>', json);
				return this;
			}
		}
		
		if (is_Array(json) && is_Function(this.push)) {
			this.length = 0;
			for (var i = 0, imax = json.length; i < imax; i++){
				this.push(json[i]);
			}
			return;
		}
		
		var props = this._props,
			key,
			Mix;
		
		for (key in json) {
			
			if (props != null) {
				Mix = props[key];
				
				if (Mix != null) {
					
					if (is_Function(Mix)) {
						this[key] = new Mix(json[key]);
						continue;
					}
					
					var deserialize = Mix.deserialize;
					
					if (is_Function(deserialize)) {
						this[key] = deserialize(json[key]);
						continue;
					}
					
				}
			}
			
			this[key] = json[key];
		}
		
		return this;
	}
};

