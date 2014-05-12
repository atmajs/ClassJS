
var db_getDb,
    db_getCollection,
    db_findSingle,
    db_findMany,
    db_count,
    db_insert,
    db_updateSingle,
    db_updateMany,
    db_remove,
    db_ensureObjectID,
    db_patchSingle,
    db_ensureIndex,
    
    db_getMongo,
    
    db_resolveCollection,
    db_resolveDb,
    
    db_profiler_toggle,
    db_profiler_getData
    ;

(function(){
    // import DriverCore.js
    // import DriverProfiler.js
    
    db_profiler_getData = core_profiler_getData;
    db_profiler_toggle = core_profiler_toggle;
    
    var db,
        mongo;
        
    db_getCollection = function(name, callback){
        if (db == null) 
            return connect(createDbDelegate(db_getCollection, name, callback));
        
        var coll = db.collection(name);
        if (coll == null) 
            return callback('<mongo> Collection Not Found: ' + name);
        
        callback(null, coll);
    };
    
    db_resolveCollection = function(name){
        var dfr = new Class.Deferred();
        db_getCollection(name, function(err, coll) {
            if (err) 
                return dfr.reject(err);
            dfr.resolve(coll)
        });
        return dfr;  
    };
    
    db_getDb = function(callback){
        if (db == null) 
            return connect(createDbDelegate(db_getDb, callback));
        callback(null, db);
    };
    
    db_resolveDb = function(name){
        var dfr = new Deferred();
        db_getDb(function(error, db){
            if (error) 
                return dfr.reject(error);
            dfr.resolve(db);
        })
        return dfr;
    };
    
    db_findSingle = function(coll, query, callback){
        if (db == null) 
            return connect(createDbDelegate(db_findSingle, coll, query, callback));
        core_findSingle(coll, queryToMongo(query), null, callback);
    };
    
    db_findMany = function(coll, query, options, callback){
        if (db == null) 
            return connect(createDbDelegate(db_findMany, coll, query, options, callback));
        if (options == null) 
            options = {};
        core_findMany(coll, queryToMongo(query), options, callback);
    };
    
    db_count = function(coll, query, callback){
        if (db == null) 
            return connect(createDbDelegate(db_count, coll, query, callback));
        core_count(coll, query, callback);
    };
    
    db_insert = function(coll, data, callback){
        if (db == null)
            return connect(createDbDelegate(db_insert, coll, data, callback));
        db
            .collection(coll)
            .insert(data, { safe: true }, callback);
    };
    
    db_updateSingle = function(coll, data, callback){
        if (db == null) 
            return connect(createDbDelegate(db_updateSingle, coll, data, callback));
        
        if (data._id == null) 
            return callback('<mongo:update> invalid ID');
        
        var query = {
            _id: db_ensureObjectID(data._id)
        };
        core_updateSingle(coll, query, data, callback);
    };
    
    db_updateMany = function(coll, array, callback){
        var batch = array.map(function(x){
            return [
                {_id: db_ensureObjectID(x._id) },
                x
            ];
        });
        core_updateMany(coll, batch, callback);
    };
    
    db_patchSingle = function(coll, id, patch, callback){
        if (db == null) 
            return connect(createDbDelegate(db_patchSingle, coll, id, patch, callback));
        
        var query = { _id: db_ensureObjectID(id) };
        core_updateSingle(coll, query, patch, callback);
    };
    
    db_remove = function(coll, query, isSingle, callback){
        if (db == null) 
            return connect(db_remove.bind(null, coll, query, callback));
        
        query = queryToMongo(query);
        
        var fn = isSingle
            ? core_removeSingle
            : core_removeMany
            ;
        fn(coll, query, callback);
    };
    
    db_ensureIndex = function(collection, index, callback){
        if (db == null) 
            return connect(createDbDelegate(db_ensureIndex, collection, index, callback));
        
        db
            .collection(collection)
            .ensureIndex(index, callback)
            ;
    };
    
    db_ensureObjectID = function(value){
        if (is_String(value) && value.length === 24) 
            return db_getMongo().ObjectID(value);
        return value;
    };
    
    db_getMongo = function(){
        db_getMongo = function() { return mongo; };
        return (mongo = require('mongodb'));
    };
    
    var connect = (function(){
        
        var listeners = [],
            connecting = false,
            connection;
        
        return function(callback){
            if (db) 
                return callback();
            
            if (__db == null) 
                return callback('Database is not set. Call Class.MongoStore.settings({db:"myDbName"})');
            
            listeners.push(callback);
            if (connecting) 
                return;
            
            db_getMongo();
            
            connecting = true;
            connection = settings_getConnectionString();
            
            if (!connection) 
                return callback('<mongo> Invalid connection string');
            
            mongo
                .MongoClient
                .connect(
                    connection,
                    __params,
                    onConnected
                );

            function onConnected(err, database){
                if (err == null) 
                    db = database;
                
                var imax = listeners.length,
                    i = -1;
                
                while( ++i < imax ) {
                    listeners[i](err);
                }
                
                listeners.length = 0;
                connecting = false;
            }
        };
    }());
    
    var queryToMongo = function(query){
        if (query == null) 
            return query;
        
        if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) 
            return query;
        
        
        if (query.hasOwnProperty('_id')) 
            query._id = db_ensureObjectID(query._id);
        
        var comparer = {
            62: {
                // >
                0: '$gt',
                // >=
                61: '$gte' 
            },
            60: {
                // <
                0: '$lt',
                // <=
                61: '$lte' 
            }
        };
        
        for (var key in query) {
            var val = query[key],
                c;
                
            if (typeof  val === 'string') {
                c = val.charCodeAt(0);
                switch(c){
                    case 62:
                    case 60:
                        
                        // >
                        var compare = comparer[c]['0'];
                        
                        if (val.charCodeAt(1) === 61) {
                            // =
                            compare = comparer[c]['61'];
                            val = val.substring(2);
                        }else{
                            val = val.substring(1);
                        }
                        query[key] = {};
                        query[key][compare] = parseInt(val);
                        
                        continue;
                };
            }
        }
        
        return query;
    };
    
    var createDbDelegate = function(fn){
        var args = _Array_slice.call(arguments, 1),
            callback = args[args.length - 1]
            ;
        return function(error){
            if (error) 
                return callback(error);
            
            if (arguments.length > 0) 
                args = args.concat(arguments);
            
            return fn_apply(fn, null, args);
        };
    };
}());