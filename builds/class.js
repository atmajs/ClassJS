(function(root, factory){
	
	if (root == null) {
		root = typeof window !== 'undefined' && typeof document !== 'undefined' ? window : global;
	}
	
	
	// if (typeof module !== 'undefined') {
	// 	module.exports = factory(root);
	// 	return;
	// }
	
	root.Class = factory(root);
	
}(this, function(global){
	"use strict";
	
	var _Array_slice = Array.prototype.slice,
		_Array_sort = Array.prototype.sort;
	
	// import ../src/util/array.js
	// import ../src/util/proto.js
	// import ../src/util/object.js
	
	// import ../src/xhr/XHR.js
	// import ../src/xhr/promise.js
	
	// import ../src/business/Serializable.js
	// import ../src/business/Route.js
	// import ../src/business/Deferred.js
	// import ../src/business/EventEmitter.js
	
	
	// import ../src/collection/Collection.js
	
	// import ../src/store/Store.js
	// import ../src/store/Remote.js
	// import ../src/store/LocalStore.js
	
	// import ../src/Class.js
	// import ../src/Class.Static.js
	
	
	
	
	return Class;
	
}));