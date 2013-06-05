var XHR = {};

arr_each(['get', 'del'], function(key){
	XHR[key] = function(path, sender){
		
		this.promise[key](path).then(function(error, response){
			
			if (error) {
				sender.onError(error, response);
				return;
			}
			
			sender.onSuccess(response);
		});
		
	};
});

arr_each(['post', 'put'], function(key){
	XHR[key] = function(path, data, cb){
		this.promise[key](path, data)
		
		.then(function(error, response){
			cb(error, response);
		});
	};
});

