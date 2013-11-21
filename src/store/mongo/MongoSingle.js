var MongoStoreSingle = (function() {

    function MongoStoreSingle(mix) {
        var coll, indexes;
        
        if (is_String(mix)) {
            coll = mix;
        }
        else if (is_Object(mix)) {
            coll = mix.collection;
            indexes = mix.indexes;
        }
        
        // if DEBUG
        !coll && console.error('<MongoStore> should define a collection name');
        // endif
        
        this._coll = coll;
        this._indexes = indexes;
    }

    /**
     * @TODO - replace ensureFree with a stack of calls
     */
    obj_inherit(MongoStoreSingle, StoreProto, Serializable, Deferred, {
        _busy: false,
        
        fetch: function(data) {
            if (this._ensureFree() === false)
                return this;
            
            db_findSingle(this._coll, data, fn_proxy(this._fetched, this));
            return this;
        },
        save: function() {
            if (this._ensureFree() === false)
                return this;
            
            var json = this.serialize(),
                fn = json._id == null
                    ? db_insert
                    : db_updateSingle
                    ;
            
            fn(this._coll, json, fn_proxy(this._inserted, this));
            return this;
        },
        del: function() {
            if (this._ensureFree() === false)
                return this;
            
            if (this._id) 
                db_remove(this._coll, {
                    _id: this._id
                }, true, fn_proxy(this._completed, this));
            else
                this._completed();
            
            return this;
        },
        
        patch: function(patch){
            if (this._ensureFree() === false) 
                return this;
            
            if (this._id) {
                db_patchSingle(
                    this._coll,
                    this._id, patch,
                    fn_proxy(this._completed, this)
                );
            }
            else {
                this._completed();
            }
            
            return this;
        },
        
        Static: {
            fetch: function(data) {
                return new this().fetch(data);
            },
            
            resolveCollection: function(){
                var dfr = new Class.Deferred();
                
                db_getCollection(new this()._coll, function(err, coll) {
                    if (err) 
                        return dfr.reject(err);
                    
                    dfr.resolve(coll)
                });
                
                return dfr;
            }
        },

        serialize: function(){
            return mongoSingle_serialize.call(this);
        },
        
        deserialize: function(json){
            
            Serializable
                .deserialize(this, json);
            
            if (this._id)
                this._id = db_ensureObjectID(this._id);
          
            return this;  
        },
        
        _ensureFree: function(){
            if (this._busy) {
                console.warn('<mongo:single> requested transport, but is busy by the same instance.');
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
        _fetched: function(error, json) {
            this.deserialize(json);
            
            this._completed(error);
        },
        
        _inserted: function(error, array){
            
            if (array != null && this._id == null) {
                
                if (is_Array(array) && array.length === 1) 
                    this._id = array[0]._id
                else 
                    console.error('<mongo:insert-single> expection an array in callback');
                
                
            }
            
            this._completed(error);
        }
    });

    var Constructor = function(collection) {

        return new MongoStoreSingle(collection);
    };

    Constructor.prototype = MongoStoreSingle.prototype;


    return Constructor;

}());