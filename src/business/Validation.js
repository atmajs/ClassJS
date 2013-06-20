var Validation = (function(){
	
	
	function val_check(instance, validation) {
		if (typeof validation === 'function') 
			return validation.call(instance);
		
		var result;
		
		for (var property in validation) {
			
			result = val_checkProperty(instance, property, validation[property]);
			
			if (result)
				return result;
		}
	}
	
	
	function val_checkProperty(instance, property, checker) {
		var value = obj_getProperty(instance, property);
		
		return checker.call(instance, value);
	}
	
	
	function val_process(instance) {
		var result;
		
		
		if (instance.Validate != null) {
			result  = val_check(instance, instance.Validate);
			if (result)
				return result;
		}
		
		// @TODO Do nest recursion check ?
		//
		//for (var key in instance) {
		//	if (instance[key] == null || typeof instance !== 'object' ) 
		//		continue;
		//	
		//	result = val_process(instance, instance[key].Validate)
		//}
		
	}
	
	return {
		validate: val_process
	};
	
}());