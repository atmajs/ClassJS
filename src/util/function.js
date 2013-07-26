function fn_proxy(fn, cntx) {

	return function() {
		switch (arguments.length) {
			case 1:
				return fn.call(cntx, arguments[0]);
			case 2:
				return fn.call(cntx,
					arguments[0],
					arguments[1]);
			case 3:
				return fn.call(cntx,
					arguments[0],
					arguments[1],
					arguments[2]);
			case 4:
				return fn.call(cntx,
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3]);
			case 5:
				return fn.call(cntx,
					arguments[0],
					arguments[1],
					arguments[2],
					arguments[3],
					arguments[4]
					);
		};
		
		return fn.apply(cntx, arguments);
	};
}