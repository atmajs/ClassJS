var MongoStoreSingle = (function() {

    function MongoStoreSingle(collection) {
        if (!collection) {
            console.error('<MongoStore> should define a collection name');
        }
        
        this._collection = collection;
    }

    /**
     * @TODO - replace ensureFree with a stack of calls
     */
    obj_inherit(MongoStoreSingle, StoreProto, DeferredProto, {
        _busy: false,
        
        fetch: function(data) {
            if (this._ensureFree() === false)
                return this;
            
            db_findSingle(this._collection, data, fn_proxy(this._fetched, this));
            return this;
        },
        save: function() {
            if (this._ensureFree() === false)
                return this;
            
            var json = this.serialize(),
                fn = json._id != null
                    ? db_insert
                    : db_updateSingle
                    ;
            
            fn(this._collection, json, fn_proxy(this._completed, this));
            return this;
        },
        del: function() {
            if (this._ensureFree() === false)
                return this;
            
            if (this._id) 
                db_remove(this._collection, {
                    _id: this._id
                }, true, fn_proxy(this._completed, this));
            else
                this._completed();
            
            return this;
        },
        
        Static: {
            fetch: function(data) {
                return new this().fetch(data);
            }
        },

        serialize: function(){
            var obj = {},
                key, val;
            
            for (key in this) {
                
                // _ (private)
                if (key.charCodeAt(0) === 95 && key !== '_id')
                    continue;
                
                if ('Static' === key || 'Validate' === key)
                    continue;
                
                val = this[key];
                
                if (val == null) 
                    continue;
                
                if (typeof val === 'function') 
                    continue;
                
                obj[key] = val;
            }
            return obj;
        },
        
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
        _fetched: function(error, json) {
            this.deserialize(json);
            
            this._completed(error);
        }
    });

    var Constructor = function(collection) {

        return new MongoStoreSingle(collection);
    };

    Constructor.prototype = MongoStoreSingle.prototype;


    return Constructor;

}());