function Serializable(data) {
	
	if (this === Class || this == null || this === global) {
		
		var Ctor = function(data){
			Serializable.call(this, data);
		};
		
		Ctor.prototype._props = data;
		
		//- 
		//obj_extend(Ctor.prototype, Serializable.prototype);
		
		return Ctor;
	}
	
	if (data != null) {
		
		if (this.deserialize) 
			this.deserialize(data);
		else
			Serializable.deserialize(this, data);
		
	}
	
}

Serializable.serialize = function(instance) {
		
	if (is_Function(instance.toJSON)) 
		return instance.toJSON();
	
	
	return JSONHelper.toJSON.call(instance);
};

Serializable.deserialize = function(instance, json) {
		
	if (is_String(json)) {
		try {
			json = JSON.parse(json);
		}catch(error){
			console.error('<json:deserialize>', json);
			return instance;
		}
	}
	
	if (is_Array(json) && is_Function(instance.push)) {
		instance.length = 0;
		for (var i = 0, imax = json.length; i < imax; i++){
			instance.push(json[i]);
		}
		return instance;
	}
	
	var props = instance._props,
		key,
		val,
		Mix;
	
	for (key in json) {
		
		val = json[key];
		
		if (props != null) {
			Mix = props[key];
			
			if (Mix != null) {
				
				if (is_Function(Mix)) {
					instance[key] = val instanceof Mix
						? val
						: new Mix(val)
						;
					continue;
				}
				
				var deserialize = Mix.deserialize;
				
				if (is_Function(deserialize)) {
					instance[key] = deserialize(val);
					continue;
				}
				
			}
		}
		
		instance[key] = val;
	}
	
	return instance;
}


