var fn_proxy,
	fn_apply,
	fn_createDelegate,
	fn_doNothing,
	fn_argsId
	;
	
(function(){

	fn_proxy = function(fn, ctx) {
		return function() {
			return fn_apply(fn, ctx, arguments);
		};
	};
	
	fn_apply = function(fn, ctx, _arguments){
		switch (_arguments.length) {
			case 0:
				return fn.call(ctx);
			case 1:
				return fn.call(ctx, _arguments[0]);
			case 2:
				return fn.call(ctx,
					_arguments[0],
					_arguments[1]);
			case 3:
				return fn.call(ctx,
					_arguments[0],
					_arguments[1],
					_arguments[2]);
			case 4:
				return fn.call(ctx,
					_arguments[0],
					_arguments[1],
					_arguments[2],
					_arguments[3]);
			case 5:
				return fn.call(ctx,
					_arguments[0],
					_arguments[1],
					_arguments[2],
					_arguments[3],
					_arguments[4]
					);
		};
		return fn.apply(ctx, _arguments);
	};
	
	fn_createDelegate = function(fn /* args */) {
		var args = _Array_slice.call(arguments, 1);
		return function(){
			if (arguments.length > 0) 
				args = args.concat(_Array_slice.call(arguments));
			
			return fn_apply(fn, null, args);
		};
	};
	
	fn_doNothing = function(){};
	
	fn_argsId = function(args, cache){
		if (args.length === 0)
			return 0;
		
		var imax = cache.length,
			i = -1;
		while( ++i < imax ){
			if (args_match(cache[i], args))
				return i + 1;
		}
		cache.push(args);
		return cache.length;
	};
	
	// === private
	
	function args_match(a, b){
		if (a.length !== b.length) 
			return false;
		
		var imax = a.length,
			i = 0;
		for (; i < imax; i++){
			if (a[i] !== b[i])
				return false;
		}
		return true;
	}
}());
