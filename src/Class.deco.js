Class.deco = {
    proto: function(proto){
        return function(Ctor){
            obj_extend(Ctor.prototype, proto);
        }
    },
    memoize: function(target, propertyKey, descriptor){
        descriptor.value = Class.Fn.memoize(descriptor.value);
        return descriptor;
    },
    self: function(target, propertyKey, descriptor) {        
        var fn = descriptor.value        
        return {
            configurable: true,
            get: function () {
                return this[propertyKey] = fn.bind(this);
            },
            set: function (value) {
                fn = value;
            }
        };
    }
};