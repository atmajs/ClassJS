
Class.MongoStore = (function(){
    
    // import utils.js
    // import Settings.js
    // import Driver.js
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
            
            var i = -1,
                imax = indexes.length,
                listener = cb_createListener(imax, complete)
                ;
            
            while(++i < imax){
                db_ensureIndex(coll, indexes[i], listener);
            }
            
            function complete(error){
                if (error) 
                    return dfr.reject(error);
                
                dfr.resolve();
            }
            
            return dfr;
        }
    };
}());
