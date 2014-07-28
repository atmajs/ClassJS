var Await;

(function(){
	
	Await = Class({
		Extends: Deferred.prototype,
	
		_wait: 0,
		_timeout: null,
		_result: null,
		_resolved: [],
		
		Construct: function(/* promises <optional> */){
			var imax = arguments.length,
				i = -1,
				dfr
				;
			while ( ++i < imax ){
				dfr = arguments[i];
				if (dfr != null && typeof dfr.done === 'function') 
					await_deferredDelegate(this, null, dfr);
			}
		},
		
		delegate: function(name, errorable) {
			return await_createDelegate(this, name, errorable);
		},
	
		deferred: function(name) {
			
			return await_deferredDelegate(
				this,
				name,
				new Deferred);
		},
	
		Static: {
	
			TIMEOUT: 2000
		}
	});

	function await_deferredDelegate(await, name, dfr){
		var delegate = await_createDelegate(await, name, true),
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
	}
	
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
		
		var delegate = fn_createDelegate(await_listener, await, name, errorable)
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
		
		var result = await._result;
		
		if (name) {
			var args = _Array_slice.call(arguments, 3);
			
			result[name] = {
				error: errorable ? args.shift() : null,
				arguments: args
			};
		} else if (errorable && arguments[3] != null) {
			
			if (result == null) 
				result = await._result = {};
			
			result.__error = arguments[3];
		}
		
		if (--await._wait === 0) {
			clearTimeout(await._timeout);
			
			var error = result && result.__error
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