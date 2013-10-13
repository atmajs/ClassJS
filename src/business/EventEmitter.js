var EventEmitter = (function(){
 
	function Emitter() {
		this._listeners = {};
	}
 
	
    Emitter.prototype = {
        constructor: Emitter,
		
        on: function(event, callback) {
            if (callback != null){
				(this._listeners[event] || (this._listeners[event] = [])).push(callback);
			}
			
            return this;
        },
        once: function(event, callback){
			if (callback != null) {
				callback._once = true;
				(this._listeners[event] || (this._listeners[event] = [])).push(callback);
			}
			
            return this;
        },
		
		pipe: function(event){
			var that = this,
				slice = Array.prototype.slice, 
				args;
			return function(){
				args = slice.call(arguments);
				args.unshift(event);
				that.trigger.apply(that, args);
			};
		},
        
        trigger: function() {
            var args = Array.prototype.slice.call(arguments),
                event = args.shift(),
                fns = this._listeners[event],
                fn, imax, i = 0;
                
            if (fns == null)
				return this;
			
			for (imax = fns.length; i < imax; i++) {
				fn = fns[i];
				fn.apply(this, args);
				
				if (fn._once === true){
					fns.splice(i,1);
					i--;
					imax--;
				}
			}
		
            return this;
        },
        off: function(event, callback) {
			var listeners = this._listeners[event];
            if (listeners == null)
				return this;
			
			if (arguments.length === 1) {
				listeners.length = 0;
				return this;
			}
			
			var imax = listeners.length,
				i = 0;
				
			for (; i < imax; i++) {
				
				if (listeners[i] === callback) 
					listeners.splice(i, 1);
				
				i--;
				imax--;
			}
		
            return this;
		}
    };
    
    return Emitter;
    
}());
