// Create from Complex Class Instance a lightweight json object

var json_proto_toJSON,
	json_proto_arrayToJSON
	;
	
(function(){
	
	json_proto_toJSON = function(){
		
		var object = this,
			json = {},
			
			key, val;
		
		for (key in object){
			// _ (private)
			if (key.charCodeAt(0) === 95)
				continue;

			if ('Static' === key || 'Validate' === key)
				continue;

			val = object[key];

			if (val == null)
				continue;

			switch (typeof val) {
				case 'function':
					continue;
				case 'object':
					
					var toJSON = val.toJSON;
					if (toJSON == null) 
						break;
					
					if (toJSON === json_proto_toJSON || toJSON === json_proto_arrayToJSON) {
						json[key] = val.toJSON();
						continue;
					}
					
					break;
			}

			json[key] = val;
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