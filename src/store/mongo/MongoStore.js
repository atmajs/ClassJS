
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
                coll = proto._coll
                ;
            if (indexes == null) {
                // if DEBUG
                console.error('<class:mongodb> No indexes>', Ctor);
                // endif
                return;
            }
            
            var i = -1,
                imax = indexes.length,
                dfr = new Deferred(),
                listener = cb_createListener(imax - 1, complete)
                ;
            
            while(++i < imax){
                db_ensureIndex(coll, indexes[i], listener);
            }
            
            function complete(error){
                if (error) 
                    return dfr.reject(error);
                
                dfr.resolve();
            }
        }
    };
}());
