function Serializable(data) {
	
	if (this === Class || this == null || this === global) {
		
		var Ctor = function(data){
			Serializable.call(this, data);
		};
		
		Ctor.prototype.__props = data;
		
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
	
	
	return json_proto_toJSON.call(instance, instance.__props);
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
	
	var props = instance.__props,
		asKeys, asKey,
		key,
		val,
		Mix;
	
	
	if (props != null) {
		var pname = '__desAsKeys';
		
		asKeys = props[pname];
		if (asKeys == null) {
			asKeys = props[pname] = {};
			for (key in props) {
				if (key !== '__desAsKeys' && props[key].hasOwnProperty('key') === true) 
					asKeys[props[key].key] = key;
			}
		}
	}
	
	for (key in json) {
		
		val = json[key];
		asKey = key;
		
		if (props != null) {
			Mix = props.hasOwnProperty(key) 
				? props[key]
				: null
				;
			if (asKeys[key]) {
				asKey = asKeys[key];
			}
				
			if (Mix != null) {
				
				if (is_Function(Mix)) {
					instance[asKey] = val instanceof Mix
						? val
						: new Mix(val)
						;
					continue;
				}
				
				var Deserialize = Mix.deserialize;
				if (is_Function(Deserialize)) {
					instance[asKey] = new Deserialize(val);
					continue;
				}
				
			}
		}
		
		instance[asKey] = val;
	}
	
	return instance;
}


