var storageEvents_onBefore,
	storageEvents_onAfter,
	storageEvents_remove,
	storageEvents_overridenDefer
	;
	
(function(){
	
	
	var event_START = 'start',
		event_SUCCESS = 'fulfilled',
		event_FAIL = 'rejected';
	
	var events_ = new EventEmitter,
		hasBeforeListeners_,
		hasAfterListeners_
		;
	
	storageEvents_onBefore = function(callback){
		events_.on(event_START, callback);
		hasBeforeListeners_ = true;
	};
	
	storageEvents_onAfter = function(onSuccess, onFailure){
		events_
			.on(event_SUCCESS, onSuccess)
			.on(event_FAIL, onFailure)
			;
		hasAfterListeners_ = true;
	};
	
	storageEvents_remove = function(callback){
		events_
			.off(event_SUCCESS, callback)
			.off(event_FAIL, callback)
			.off(event_START, callback)
			;
	};
	
	storageEvents_overridenDefer = function(type){
		Deferred.prototype.defer.call(this);
		
		if (hasBeforeListeners_) 
			emit([event_START, this, type]);
		
		if (hasAfterListeners_) 
			this.always(listenerDelegate(this, type));
		
		return this;
	};
	
	// PRIVATE
	
	function listenerDelegate(sender, type) {
		return function(){
			var isSuccess = sender._rejected === void 0,
				arguments_ = isSuccess 
					? sender._resolved
					: sender._rejected
					,
				event = isSuccess
					? event_SUCCESS
					: event_FAIL
				;
			
			emit([event, sender, type].concat(arguments_));
		};
	}
	
	
	function emit(arguments_/* [ event, sender, .. ]*/){
		events_.trigger.apply(events_, arguments_);
	}
	
	
}());