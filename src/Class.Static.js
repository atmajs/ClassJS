/**
 * Can be used in Constructor for binding class's functions to class's context
 * for using, for example, as callbacks
 *
 * @obsolete - use 'Self' property instead
 */
Class.bind = function(cntx) {
	var arr = arguments,
		i = 1,
		length = arguments.length,
		key;

	for (; i < length; i++) {
		key = arr[i];
		cntx[key] = cntx[key].bind(cntx);
	}
	return cntx;
};


Class.Serializable = Serializable;
Class.Deferred = DeferredProto;
Class.EventEmitter = EventEmitter;

Class.validate = Validation.validate;