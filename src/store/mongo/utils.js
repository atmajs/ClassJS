function cb_createListener(count, cb){
	var _error;
	return function(error){
		if (error)
			_error = error;
			
		if (--count === 0)
			cb(_error);
	};
}