
Class.MongoStore = (function(){
	
	// import utils.js
	// import Settings.js
	// import Driver.js
	// import IndexHandler.js
	// import MongoStoreCtor.js
	// import MongoSingle.js
	// import MongoCollection.js
	
	
	return {
		Single: MongoStoreSingle,
		Collection: MongoStoreCollection,
		settings: Settings,
		
		resolveDb: db_resolveDb,
		resolveCollection: db_resolveCollection,
		
		createId: function(id){
			return db_ensureObjectID(id);
		},
		
		ensureIndexes: function(Ctor) {
			var proto = Ctor.prototype,
				indexes = proto._indexes,
				coll = proto._coll,
				dfr = new Deferred()
				;
				
			if (indexes == null) 
				return dfr.reject('<No indexes> ' + coll);
			
			IndexHandler.ensure(coll, indexes, cb_completeDelegate(dfr));
			return dfr;
		},
		
		ensureIndexesAll: function(){
			var dfr = new Deferred;
			IndexHandler.ensureAll(cb_completeDelegate(dfr));
			return dfr;
		},
		
		profiler: {
			/* ( state, { slowLimit, onDetect, detector } ) */
			toggle: db_profiler_toggle,
			getData: db_profiler_getData
		}
	};
}());
