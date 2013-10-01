function fn_proxy(fn, ctx) {

	return function() {
		switch (arguments.length) {
			case 1:
				return fn.call(ctx, arguments[0]);
			case 2:
				return fn.call(ctx,
					arguments[0],
					arguments[1]);
			case 3:
				return fn.call(ctx,
					arguments[0],
					arguments[1],
					arguments[2]);
			case 4:
				return fn.call(ctx,
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3]);
			case 5:
				return fn.call(ctx,
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3],
					arguments[4]
					);
		};
		
		return fn.apply(ctx, arguments);
	}
}

function fn_isFunction(fn){
	return typeof fn === 'function';
}

function fn_createDelegate(fn /* args */) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function(){
		if (arguments.length > 0) 
			args = args.concat(arguments);
		
		return fn.apply(null, args);
	};
}