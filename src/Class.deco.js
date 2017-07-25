Class.deco = {
    proto: function(proto){
        return function(Ctor){
            obj_extend(Ctor.prototype, proto);
        }
    },
    memoize: function(target, propertyKey, descriptor){
        descriptor.value = Class.Fn.memoize(descriptor.value);
        return descriptor;
    }
};