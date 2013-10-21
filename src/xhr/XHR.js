var XHR = {};

(function(){
	
	// import promise.js
	
}.call(XHR));

arr_each(['get'], function(key){
	XHR[key] = function(path, data, sender){
		
		this
			.promise[key](path)
			.then(function(errored, response, xhr){
				
				if (errored) {
					sender.onError(errored, response, xhr);
					return;
				}
				
				sender.onSuccess(response);
			});
		
	};
});

arr_each(['del', 'post', 'put'], function(key){
	XHR[key] = function(path, data, cb){
		this
			.promise[key](path, data)
			.then(function(error, response, xhr){
				cb(error, response, xhr);
			});
	};
});

