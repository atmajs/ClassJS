Class.deco = {
    proto: function(proto){
        return function(Ctor){
            obj_extend(Ctor.prototype, proto);
        };
    },
    memoize: function(target, propertyKey, descriptor){
         if (descriptor == null) {
            descriptor = {
                configurable: true,
                value: target[propertyKey]
            };
        }
        descriptor.value = Class.Fn.memoize(descriptor.value);
        return descriptor;
    },
    self: function(target, propertyKey, descriptor) {
        var fn = descriptor == null ? target[propertyKey] : descriptor.value;
        return {
            configurable: true,
            get: function () {
                return this[propertyKey] = fn.bind(this);
            },
            set: function (value) {
                fn = value;
            }
        };
    },
    debounce: function(timeout) {
        return function(target, propertyKey, descriptor) {
            if (descriptor == null) {
                descriptor = {
                    configurable: true,
                    value: target[propertyKey]
                };
            }
            var fn = descriptor.value;
            if (timeout == null || timeout === 0) {
                var frame = 0;
                descriptor.value =  function () {
                    var args = _Array_slice.call(arguments);
                    var self = this;
                    if (frame !== 0) {
                        cancelAnimationFrame(frame);
                    }
                    frame = requestAnimationFrame(function() {
                        frame = 0;
                        fn.apply(self, args);
                    });
                };
            } else {
                var timer = 0;
                descriptor.value = function () {
                    var args = _Array_slice.call(arguments);
                    var self = this;
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        fn.apply(self, args);
                    }, timeout);
                };
            }            
            return descriptor;
        };
    },
    throttle: function (timeWindow, shouldCallLater) {
        return function(target, propertyKey, descriptor) {
            var fn = descriptor.value;
            var timer = 0;
            var latestArgs = null;
            var latestCall = 0;
		    descriptor.value = function () {
                var args = _Array_slice.call(arguments);
                var self = this;
                var now = Date.now();
                var diff = now - latestCall;
                if (diff >= timeWindow) {
                    latestCall = now;
                    if (shouldCallLater !== true) {
                        fn.apply(self, args);
                        return;
                    }                    
                }
                latestArgs = args;
                if (timer === 0) {
                    timer = setTimeout(function (){
                        latestCall = Date.now();
                        timer = 0;
                        fn.apply(self, latestArgs);
                    }, diff >= timeWindow ? timeWindow : timeWindow - diff);
                }
            };
            return descriptor;
        }
    }
};