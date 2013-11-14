

function args_match(a, b) {
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

function args_id(store, args) {

	if (args.length === 0)
		return 0;

	
	for (var i = 0, imax = store.length; i < imax; i++) {
		
		if (args_match(store[i], args))
			return i + 1;
	}
	
	store.push(args);
	return store.length;
}


function fn_memoize(fn) {

	var _cache = {},
		_args = [];
		
	return function() {

		var id = args_id(_args, arguments);

		
		return _cache[id] == null
			? (_cache[id] = fn_apply(fn, this, arguments))
			: _cache[id];
	};
}


function fn_resolveDelegate(cache, cbs, id) {
	
	return function(){
		cache[id] = arguments;
		
		for (var i = 0, x, imax = cbs[id].length; i < imax; i++){
			x = cbs[id][i];
			fn_apply(x, this, arguments);
		}
		
		cbs[i] = null;
		cache = null;
		cbs = null;
	};
}

function fn_memoizeAsync(fn) {
	var _cache = {},
		_cacheCbs = {},
		_args = [];
		
	return function(){
		
		var args = _Array_slice.call(arguments),
			callback = args.pop();
		
		var id = args_id(_args, args);
		
		if (_cache[id]){
			fn_apply(callback, this, _cache[id])
			return; 
		}
		
		if (_cacheCbs[id]) {
			_cacheCbs[id].push(callback);
			return;
		}
		
		_cacheCbs[id] = [callback];
		
		args = _Array_slice.call(args);
		args.push(fn_resolveDelegate(_cache, _cacheCbs, id));
		
		fn_apply(fn, this, args);
	};
}

	
	
