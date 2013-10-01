var MongoStoreCollection = (function(){
    
    function MongoStoreCollection(collection){
        if (!collection) {
            console.error('<MongoStore> should define a collection name');
        }
        
        this._collection = collection;
    }
    
    function collection_push(collection, json){
        var Constructor = collection._constructor,
            instance = new Constructor(json);
            
        if (instance._id == null && fn_isFunction(instance.deserialize)) {
            instance.deserialize(json);
        }
        
        collection[collection.length++] = instance;
    }
    
    function cb_createListener(count, cb){
        var _error;
        return function(error){
            if (error)
                _error = error;
                
            if (--count === 0)
                cb(_error);
        }
    }
        
        
    obj_inherit(MongoStoreCollection, DeferredProto, {
        
        fetch: function(data){
            if (this._ensureFree() === false)
                return this;
            
            db_findMany(this._collection, data, fn_proxy(this._fetched, this));
            return this;
        },
        save: function(){
            if (this._ensureFree() === false)
                return this;
            
            var insert = [],
                update = [],
                coll = this._collection,
                onComplete = fn_proxy(this._completed, this);
            
            for (var i = 0, x, imax = this.length; i < imax; i++){
                x = this[i];
                
                if (x._id == null) {
                    insert.push(x.serialize());
                    continue;
                }
                update.push(x.serialize());
            }
            
            if (insert.length && update.length) {
                var listener = cb_createListener(2, onComplete);
                
                db_insert(coll, insert, listener);
                db_updateMany(coll, update, listener);
                return this;
            }
            
            if (insert.length) {
                db_insert(coll, insert, onComplete);
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
                
                db_remove(this._collection, {
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
            fetch: function(data){
                return new this().fetch(data);
            }
        },
        
        /* -- private -- */
        _busy: false,
        _ensureFree: function(){
            if (this._busy) 
                return false;
            
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
        }
    });    
    
    
    var Constructor = function(collection) {

        return new MongoStoreCollection(collection);
    };

    Constructor.prototype = MongoStoreCollection.prototype;


    return Constructor;

}());