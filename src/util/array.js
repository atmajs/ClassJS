function arr_each(array, callback) {
	
	if (array instanceof Array) {
		for (var i = 0, imax = array.length; i < imax; i++){
			callback(array[i], i);
			
		}
		return;
	}
	
	callback(array);

}

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