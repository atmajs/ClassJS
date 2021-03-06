var MongoStoreCollection = (function(){
    
    function MongoStoreCollection(mix){
        MongoStoreCtor.call(this, mix);
    }
    
    function collection_push(collection, json){
        var Constructor = collection._ctor,
            instance = new Constructor(json);
            
        if (instance._id == null && is_Function(instance.deserialize)) {
            instance.deserialize(json);
        }
        
        collection[collection.length++] = instance;
    }
    
    obj_inherit(MongoStoreCollection, Deferred, {
        
        fetch: function(query, options){
            if (this._ensureFree() === false)
                return this;
            
            db_findMany(this._coll, query, options, fn_proxy(this._fetched, this));
            return this;
        },
        save: function(){
            if (this._ensureFree() === false)
                return this;
            
            var insert = [],
				insertIndexes = [],
                update = [],
                coll = this._coll,
                onComplete = fn_proxy(this._completed, this);
            
            for (var i = 0, x, imax = this.length; i < imax; i++){
                x = this[i];
                
                if (x._id == null) {
                    insert.push(x.serialize());
					insertIndexes.push(i);
                    continue;
                }
                update.push(x.serialize());
            }
            
            if (insert.length && update.length) {
                var listener = cb_createListener(2, onComplete);
                
                db_insertMany(coll, insert, this._insertedDelegate(this, listener, insertIndexes));
                db_updateMany(coll, update, listener);
                return this;
            }
            
            if (insert.length) {
                db_insertMany(coll, insert, this._insertedDelegate(this, this._completed, insertIndexes));
                return this;
            }
            
            if (update.length) {
                db_updateMany(coll, update, onComplete);
                return this;
            }
            
            return this;
        },
        del: function(data){
            if (data == null && arguments.length !== 0) {
				console.error('<MongoStore:del> - selector is specified, but is undefined');
				return this;
			}
            
            if (this._ensureFree() === false)
                return this;
            
            var array = data == null
                ? this.toArray()
                : this.remove(data)
                ;
                
            if (array && array.length) {
                var ids = [];
                for (var i = 0, x, imax = array.length; i < imax; i++){
                    x = array[i];
                    if (x._id) {
                        ids.push(x._id);
                    }
                }
                
                db_remove(this._coll, {
                    _id: {
                        $in: ids
                    }
                }, false, fn_proxy(this._completed, this));
                
            }else{
                this._completed();   
            }
            
            return this;
        },
        
        
        Static: {
            fetch: function(query, options){
                return new this().fetch(query, options);
            },
			count: function(query){
				var dfr = new Deferred;
				db_count(this.prototype._coll, query, function(error, count){
					if (error != null) {
						dfr.reject(count);
						return;
					}
					dfr.resolve(count);
				});
				return dfr;
			}
        },
        
        /* -- private -- */
        _busy: false,
		
		_coll: null,
		_indexes: null,
		_primaryKey: null,
		
        _ensureFree: function(){
            if (this._busy) {
				console.warn('<mongo:collection> requested transport, but is busy by the same instance.');
                return false;
            }
            
            this._busy = true;
            this._resolved = null;
            this._rejected = null;
            
            return true;
        },
        _completed: function(error){
            this._busy = false;
            
            if (error) 
                this.reject(error);
            else
                this.resolve(this);
        },
        _fetched: function(error, json){
            if (arr_isArray(json)) {
                
                for (var i = 0, x, imax = json.length; i < imax; i++){
                    x = json[i];
                    
                    collection_push(this, x);
                }
                
            } else if (json) {
                collection_push(this, json);
            }
            
            this._completed(error);
        },
		
		_insertedDelegate: function(ctx, callback, indexes){			
			/**
			 *	@TODO make sure if mongodb returns an array of inserted documents
			 *	in the same order as it was passed to insert method
			 */			
			function call(error) {
				callback.call(ctx, error);
			}			
			return function(error, result){
				if (error == null) {
					var coll = result.ops;
					if (is_Array(coll) === false) {
						console.error('<mongo:bulk insert> array expected');					
						return call();
					}
					
					if (coll.length !== indexes.length) {
						console.error('<mongo:bul insert> count missmatch', coll.length, indexes.length);
						return call();
					}
					
					for (var i = 0, index, imax = indexes.length; i < imax; i++){
						index = indexes[i];
						
						ctx[index]._id = coll[i]._id;
					}
				}
				call(error);
			};
		}
    });    
    
    
    var Constructor = function(collection) {

        return new MongoStoreCollection(collection);
    };

    Constructor.prototype = MongoStoreCollection.prototype;


    return Constructor;

}());