var EventEmitter;
(function(){
 
	EventEmitter = function() {
		this._listeners = {};
	};
    EventEmitter.prototype = {
        constructor: EventEmitter,
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
				args;
			return function(){
				args = _Array_slice.call(arguments);
				args.unshift(event);
				
				fn_apply(that.trigger, that, args);
			};
		},
        
		emit: event_trigger,
        trigger: event_trigger,
		
        off: function(event, callback) {
			var listeners = this._listeners[event];
            if (listeners == null)
				return this;
			
			if (arguments.length === 1) {
				listeners.length = 0;
				return this;
			}
			
			var imax = listeners.length,
				i = -1;
			while (++i < imax) {
				
				if (listeners[i] === callback) {
					listeners.splice(i, 1);
					i--;
					imax--;
				}
				
			}
            return this;
		}
    };
    
	function event_trigger() {
		var args = _Array_slice.call(arguments),
			event = args.shift(),
			fns = this._listeners[event],
			fn, imax, i = 0;
			
		if (fns == null)
			return this;
		
		for (imax = fns.length; i < imax; i++) {
			fn = fns[i];
			fn_apply(fn, this, args);
			
			if (fn._once === true){
				fns.splice(i, 1);
				i--;
				imax--;
			}
		}
	
		return this;
	}
}());
