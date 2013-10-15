var Validation = (function(){
	
	
	function val_check(instance, validation, props) {
		if (is_Function(validation)) 
			return validation.call(instance);
		
		var result,
			property;
		
		if (props) {
			for (var i = 0, imax = props.length; i < imax; i++){
				
				property = props[i];
				result = val_checkProperty(instance, property, validation[property]);
				
				if (result) 
					return result;
			}
			
			return;
		}
		
		for (property in validation) {
			
			result = val_checkProperty(instance, property, validation[property]);
			
			if (result)
				return result;
		}
	}
	
	
	function val_checkProperty(instance, property, checker) {
		
		if (is_Function(checker) === false) 
			return '<validation> Function expected for ' + property;
		
		
		var value = obj_getProperty(instance, property);
		
		return checker.call(instance, value);
	}
	
	
	function val_process(instance /* ... properties */) {
		var result,
			props;
		
		if (arguments.length > 1 && typeof arguments[1] === 'string') {
			props = _Array_slice.call(arguments, 1);
		}
		
		if (instance.Validate != null) {
			result  = val_check(instance, instance.Validate, props);
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