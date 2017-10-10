Class.deco = {
    proto: function(proto){
        return function(Ctor){
            obj_extend(Ctor.prototype, proto);
        };
    },
    memoize: function(target, propertyKey, descriptor){
        var viaProperty = descriptor == null;
        var fn = Class.Fn.memoize(viaProperty ? target[propertyKey] : descriptor.value);
        if (viaProperty) {
            target[propertyKey] = fn;
            return;
        }
        descriptor.value = fn;
        return descriptor;
    },
    self: function(target, propertyKey, descriptor) {
        var viaProperty = descriptor == null;
        var fn = viaProperty ? target[propertyKey] : descriptor.value;
        var result = {
            configurable: true,
            get: function () {
                var result = {
                    writable: true,
                    configurable: true,
                    value: fn.bind(this)
                };
                Object.defineProperty(this, propertyKey, result);
                return result.value;
            },
            set: function (value) {
                fn = value;
            }
        };
        if (viaProperty) {
            Object.defineProperty(target, propertyKey, result);
            return;
        }
        return result;            
    },
    debounce: function(timeout) {
        return function(target, propertyKey, descriptor) {
            var viaProperty = descriptor == null;
            if (viaProperty) {
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
            if (viaProperty) {
                target[propertyKey] = descriptor.value;
                return;
            }
            return descriptor;
        };
    },
    throttle: function (timeWindow, shouldCallLater) {
        return function(target, propertyKey, descriptor) {
            var viaProperty = descriptor == null;
            var fn = viaProperty ? target[propertyKey] : descriptor.value;
            var timer = 0;
            var latestArgs = null;
            var latestCall = 0;
		    var resultFn = function () {
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
            if (viaProperty) {
                target[propertyKey] = resultFn;
                return;
            }
            descriptor.value = resultFn;
            return descriptor;
        }
    }
};