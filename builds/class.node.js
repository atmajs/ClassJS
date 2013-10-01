(function(root, factory){
	"use strict";

	var _isCommonJS = false,
		_global,
		_exports;
	
	if (typeof exports !== 'undefined' && (root == null || root === exports || root === global)){
		// raw nodejs module
        _global = global;
		_isCommonJS = true;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined'
			? global
			: window
			;
	}
	
	if (_exports == null) {
		_exports = root || _global;
	}
	
	
	factory(_global, _exports);
	
	if (_isCommonJS) {
		module.exports = _exports.Class;
	}
	
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
	// import ../src/store/mongo/MongoStore.js
	
	
	
	// import ../src/Class.js
	// import ../src/Class.Static.js
	
	Class.MongoStore = MongoStore;
	
	// import ../src/fn/fn.js
	
	exports.Class = Class;
	
}));