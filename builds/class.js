(function(root, factory){
	"use strict";

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	
	factory(_global, _exports);
	
}(this, function(global, exports){
	"use strict";
	
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	
	// import ../src/util/is.js
	// import ../src/util/array.js
	// import ../src/util/proto.js
	// import ../src/util/object.js
	// import ../src/util/function.js
	
	
	// import ../src/xhr/XHR.js
	// import ../src/xhr/promise.js
	
	// import ../src/business/Serializable.js
	// import ../src/business/Route.js
	// import ../src/business/Deferred.js
	// import ../src/business/EventEmitter.js
	// import ../src/business/Validation.js
	
	
	// import ../src/collection/Collection.js
	
	// import ../src/store/Store.js
	// import ../src/store/Remote.js
	// import ../src/store/LocalStore.js
	
	
	// import ../src/Class.js
	// import ../src/Class.Static.js
	
	
	// import ../src/fn/fn.js
	
	exports.Class = Class;
	
}));