var cb_createListener,
	cb_completeDelegate
	;

(function(){

	cb_createListener = function(count, cb){
		var _error;
		return function(error){
			if (error)
				_error = error;
				
			if (--count === 0)
				cb(_error);
		};
	};
	
	cb_completeDelegate = function(dfr) {
		return function(error){
			if (error) 
				return dfr.reject(error);
			dfr.resolve();
		}
	};
	
}());
