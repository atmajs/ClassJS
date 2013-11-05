
var db_getCollection,
    db_findSingle,
    db_findMany,
    db_insert,
    db_updateSingle,
    db_updateMany,
    db_remove,
    db_ensureObjectID,
    db_patchSingle
    ;

(function(){
    
    var db,
        mongo;
        
    
    db_getCollection = function(name, callback){
        if (db == null) 
            return connect(fn_createDelegate(db_getCollection, name));
        
        var coll = db.collection(name);
        
        callback(coll);
    };
    
    
    db_findSingle = function(coll, query, callback){
        
        if (db == null) 
            return connect(fn_createDelegate(db_findSingle, coll, query, callback));
            
        query = queryToMongo(query);
        db
            .collection(coll)
            .findOne(query, function(error, item){
                
                callback(error, item);
            });
        
    };
    
    db_findMany = function(coll, query, callback){
        if (db == null) 
            return connect(fn_createDelegate(db_findMany, coll, query, callback));
        
        query = queryToMongo(query);
        db
            .collection(coll)
            .find(query, function(error, cursor){
                if (error) {
                    callback(error);
                    return;
                }
                
                cursor.toArray(function(error, items){
                    callback(error, items);
                });
                
            });
    };
    
    db_insert = function(coll, data, callback){
        if (db == null)
            return connect(fn_createDelegate(db_insert, coll, data, callback));
        
        db
            .collection(coll)
            .insert(data, { safe: true }, callback);
    }
    
    db_updateSingle = function(coll, data, callback){
        if (db == null) 
            return connect(fn_createDelegate(db_updateSingle, coll, data, callback));
        
        if (data._id == null) 
            return callback('<mongo:update> invalid ID');
        
        db
            .collection(coll)
            .update({
                _id: db_ensureObjectID(data._id)
            }, data, {
                upsert: true,
                multi: false,
            }, function(error){
                
                callback(error);
            });
    };
    
    db_updateMany = function(coll, array, callback){
        
        db_updateSingle(coll, array.shift(), function(error){
            if (error)
                return callback(error);
            
            if (array.length === 0) 
                return callback();
            
            db_updateMany(coll, array, callback); 
        });
    };
    
    db_patchSingle = function(coll, id, patch, callback){
        if (db == null) 
            return connect(fn_createDelegate(db_patchSingle, coll, id, patch, callback));
        
        db
            .collection(coll)
            .update({
                _id: db_ensureObjectID(id)
            }, patch, function(error){
                
                callback(error);
            })
    };
    
    
    
    db_remove = function(collection, query, isSingle, callback){
        if (db == null) 
            return connect(db_remove.bind(null, collection, query, callback));
        
        query = queryToMongo(query);
        db
            .collection(collection)
            .remove(query, {
                justOne: isSingle
            }, function(error, count){
                
                callback(error);
            });
    };
    
    db_ensureObjectID = function(value){
        if (is_String(value) && value.length === 24) 
            return getMongo().ObjectID(value);
        
        return value;
    };
    
    
    var connect = (function(){
        
        var listeners = [],
            connecting = false;
        
        
        return function(callback){
            if (db) 
                return callback();
            
            if (__db == null) 
                return callback('Database is not set. Call Class.MongoStore.settings({db:"myDbName"})');
            
            
            listeners.push(callback);
            
            if (connecting) 
                return;
            
            getMongo();
            
            connecting = true;
            
            var Client = mongo.MongoClient,
                Server = mongo.Server;

            new Client(new Server(__ip, __port, {
                auto_reconnect: true
            })).open(function(err, client) {
                
                db = client.db(__db);
                
                
                for (var i = 0, x, imax = listeners.length; i < imax; i++){
                    x = listeners[i];
                    x();
                }
                
                listeners = null;
            });
    
        };
    }());
    
    var getMongo = function(){
        getMongo = function() {
            return mongo;
        };
        
        mongo = require('mongodb');
        
        return getMongo();
    };
    
    var queryToMongo = function(query){
        if (query == null) {
            if (arguments.length !== 0) 
                console.warn('<mongo> query should not be empty');
            
            return query;
        }
        
        if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) {
            return query;
        }
        
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
}());