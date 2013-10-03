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