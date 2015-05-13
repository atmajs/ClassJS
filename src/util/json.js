// Create from Complex Class Instance a lightweight json object

var json_key_SER = '__$serialization',
	json_proto_toJSON,
	json_proto_arrayToJSON
	;
	
(function(){
	
	json_proto_toJSON = function(serialization){
		
		var object = this,
			json = {},
			
			key, val, s;
			
		if (serialization == null) 
			serialization = object[json_key_SER];
		
		
		var asKey;
		
		for(key in object){
			asKey = key;
			
			if (serialization != null && serialization.hasOwnProperty(key)) {
				s = serialization[key];
				if (s != null && typeof s === 'object') {
					
					if (s.key) 
						asKey = s.key;
						
					if (s.hasOwnProperty('serialize')) {
						if (s.serialize == null) 
							continue;
						
						json[asKey] = s.serialize(object[key]);
						continue;
					}
					
				}
			}
			
			// _ (private)
			if (key.charCodeAt(0) === 95)
				continue;

			if ('Static' === key || 'Validate' === key)
				continue;

			val = object[key];

			if (val == null)
				continue;
			
			if ('_id' === key) {
				json[asKey] = val;
				continue;
			}

			switch (typeof val) {
				case 'function':
					continue;
				case 'object':
					
					if (is_Date(val)) 
						break;
					
					var toJSON = val.toJSON;
					if (toJSON == null) 
						break;
					
					json[asKey] = val.toJSON();
					continue;
			}

			json[asKey] = val;
		}
		
		// make mongodb's _id property not private
		if (object._id != null)
			json._id = object._id;
		
		return json;	
	};
	
	json_proto_arrayToJSON =  function() {
		var array = this,
			imax = array.length,
			i = 0,
			output = new Array(imax),
			
			x;

		for (; i < imax; i++) {

			x = array[i];
			
			if (x != null && typeof x === 'object') {
				
				var toJSON = x.toJSON;
				if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
					
					output[i] = x.toJSON();
					continue;
				}
				
				if (toJSON == null) {
					
					output[i] = json_proto_toJSON.call(x);
					continue;
				}
			}
			
			output[i] = x;
		}

		return output;
	};
	
}());