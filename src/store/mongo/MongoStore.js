
Class.MongoStore = (function(){
    
    // import Settings.js
    // import Driver.js
    // import MongoSingle.js
    // import MongoCollection.js
    
    
    return {
        Single: MongoStoreSingle,
        Collection: MongoStoreCollection,
        settings: Settings,
        
        resolveDb: function(){
            var dfr = new Class.Deferred();
            
            db_getDb(function(db){
                dfr.resolve(db);
            })
            
            return dfr;
        },
        
        createId: function(id){
            return db_ensureObjectID(id);
        }
    };
}());
