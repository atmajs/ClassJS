var arr_each,
	arr_isArray,
	arr_remove
	;
	
(function(){

	arr_each = function(array, callback) {
		
		if (arr_isArray(array)) {
			for (var i = 0, imax = array.length; i < imax; i++){
				callback(array[i], i);
			}
			return;
		}
		
		callback(array);
	};
	
	arr_isArray = function(array) {
		return array != null
			&& typeof array === 'object'
			&& typeof array.length === 'number'
			&& typeof array.splice === 'function';
	};
	
	arr_remove = function(array, fn){
		var imax = array.length,
			i = -1;
		while ( ++i < imax){
			if (fn(array[i]) === true) {
				array.splice(i, 1);
				i--;
				imax--;
			}
		}
	};
	
	/* polyfill */
	if (typeof Array.isArray !== 'function') {
		Array.isArray = function(array){
			if (array instanceof Array){
				return true;
			}
			
			if (array == null || typeof array !== 'object') {
				return false;
			}
			
			
			return array.length !== void 0 && typeof array.slice === 'function';
		};
	}
	
}());
