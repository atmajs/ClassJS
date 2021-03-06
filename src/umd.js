(function(root, factory){
	"use strict";

	var _global = typeof window === 'undefined' || window.navigator == null
			? global
			: window
			,
		_exports
		;

	_exports = root || _global;
    
    function construct(){
        return factory(_global, _exports);
    }

    
    if (typeof define === 'function' && define.amd) {
        return define(construct);
    }
    
	// Browser OR Node
    construct();
	
	if (typeof module !== 'undefined' && module.exports != null) 
		module.exports = _exports.Class;
	
}(this, function(global, exports){
	"use strict";