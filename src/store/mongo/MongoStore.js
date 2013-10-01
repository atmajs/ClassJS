
var MongoStore = (function(){
    
    // import Settings.js
    // import Driver.js
    // import MongoSingle.js
    // import MongoCollection.js
    
    
    return {
        Single: MongoStoreSingle,
        Collection: MongoStoreCollection,
        settings: Settings,
    };
}());
