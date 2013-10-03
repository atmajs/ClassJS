
var db_findSingle,
    db_findMany,
    db_insert,
    db_updateSingle,
    db_updateMany,
    db_remove;

(function(){
    
    var db,
        mongo;
    
    
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
            .insert(data, callback);
    }
    
    db_updateSingle = function(coll, data, callback){
        if (db == null) 
            return connect(fn_createDelegate(db_updateSingle, coll, data, callback));
        
        
        db
            .collection(coll)
            .update({
                _id: queryToMongo({_id: data._id})
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
    
    db_remove = function(collection, query, isSingle, callback){
        if (db == null) 
            return connect(db_remove.bind(null, collection, query, callback));
        
        query = queryToMongo(query);
        db
            .collection(collection)
            .remove(query, {
                justOne: isSingle
            }, function(error){
                
                callback(error);
            });
    }
    
    
    var connect = (function(){
        
        var listeners = [],
            connecting = false;
        
        
        return function(callback){
            if (db) {
                callback();
                return;
            }
            
            listeners.push(callback);
            
            if (connecting) 
                return;
            
            connecting = true;
            mongo = require('mongodb');
            
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
    
    var queryToMongo = function(query){
        if (query == null) {
            if (arguments.length !== 0) 
                console.warn('<mongo> query should not be empty');
            
            return query;
        }
        
        if (query.hasOwnProperty('$query') || query.hasOwnProperty('$limit')) {
            return query;
        }
        
        if (is_notEmptyString(query._id)) {
            query._id = mongo.ObjectID(query._id);
        }
        
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
    }
}());