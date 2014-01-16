(function(root, factory){
	"use strict";

	var _global = typeof window === 'undefined' || window.navigator == null
			? global
			: window
			,
		_isCommonJS = false,
		_exports
		;

    
	if (typeof exports !== 'undefined' && (root == null || root === exports || root === _global)){
		// raw commonjs module
		_isCommonJS = true;
        root = exports;
    }
	
    _exports = root || _global;
    

    function construct(){

        return factory(_global, _exports);
    };

    
    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    construct();
	
	if (_isCommonJS) 
		module.exports = _exports.Class;
	
	
}(this, function(global, exports){
	"use strict";