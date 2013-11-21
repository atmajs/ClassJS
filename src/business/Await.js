var Await = (function(){
	
	return Class({
		Base: Deferred,
	
		_wait: 0,
		_timeout: null,
		_result: null,
	
		delegate: function(name, errorable) {
			return await_createDelegate(this, name, errorable);
		},
	
		deferred: function(name) {
			
			var dfr = new Deferred,
				delegate = await_createDelegate(this, name, true),
				
				args
				;
			
			return dfr
				.done(function(){
					args = _Array_slice.call(arguments);
					args.unshift(null);
					
					delegate.apply(null, args);
				})
				.fail(function(error){
					
					delegate(error);
				})
				;
		},
	
		Static: {
	
			TIMEOUT: 2000
		}
	});

	
	function await_createDelegate(await, name, errorable){
		if (errorable == null) 
			errorable = true;
		
		if (await._timeout)
			clearTimeout(await._timeout);

		await.defer();
		await._wait++;

		if (name){
			if (!await._result)
				await._result = {};
			
			if (name in await._result) 
				console.warn('<await>', name, 'already awaiting');
			
			await._result[name] = null;
		}
		
		var proxy = fn_proxy(await_listener, await),
			delegate = fn_createDelegate(await_listener, await, name, errorable)
			;

		await._timeout = setTimeout(delegate, Await.TIMEOUT);

		return delegate;
	}
	
	function await_listener(await, name, errorable /* .. args */ ) {
		
		if (arguments.length === 0) {
			// timeout
			await._wait = 0;
			await.reject('408: Timeout');
			return;
		}
		
		if (await._wait === 0) 
			return;
		
		if (name) {
			var result = _Array_slice.call(arguments, 3);
			
			await._result[name] = {
				error: errorable ? result.shift() : null,
				arguments: result
			};
		} else if (errorable && arguments[3] != null) {
			await._result.__error = arguments[3];
		}
		
		if (--await._wait === 0) {
			clearTimeout(await._timeout);
			
			var result = await._result,
				error = result && result.__error
				;
			var val,
				key;
			
			if (error == null) {
				for(key in result){
					
					val = result[key];
					error = val && val.error;
					
					if (error) 
						break;
				}
			}
			
			if (error) {
				await.reject(error, result);
				return;
			}
			
			await.resolve(result);
		}
	}

}());