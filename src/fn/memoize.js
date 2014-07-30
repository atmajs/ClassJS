var fn_memoize,
	fn_memoizeAsync;

(function(){
	fn_memoize = function(fn) {
		var _cache = {},
			_args = [];
		return function() {
			var id = fn_argsId(arguments, _args);
			
			return _cache[id] == null
				? (_cache[id] = fn_apply(fn, this, arguments))
				: _cache[id];
		};
	};
	
	fn_memoizeAsync = function(fn) {
		var _cache = {},
			_cacheCbs = {},
			_args = [];
			
		return function(){
			
			var args = _Array_slice.call(arguments),
				callback = args.pop();
			
			var id = fn_argsId(args, _args);
			
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
	};
	
	// === private
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
}());

