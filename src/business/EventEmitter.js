var EventEmitter = (function(){
 
	function Emitter() {
		this._listeners = {};
	}
 
	
    Emitter.prototype = {
        constructor: Emitter,
		
        on: function(event, callback) {
            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
            return this;
        },
        once: function(event, callback){
            callback._once = true;
            (this._listeners[event] || (this._listeners[event] = [])).push(callback);
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
					length--;
				}
			}
		
            return this;
        },
        off: function(event, callback) {
            if (this._listeners[event] == null)
				return this;
				
			var arr = this._listeners[event],
				imax = arr.length,
				i = 0;
				
			for (; i < imax; i++) {
				
				if (arr[i] === callback) 
					arr.splice(i, 1);
				
				i--;
				length--;
			}
		
            return this;
		}
    };
    
    return Emitter;
    
}());
