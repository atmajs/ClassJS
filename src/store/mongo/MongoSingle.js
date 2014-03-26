var MongoStoreSingle = (function() {

    function MongoStoreSingle(mix) {
        var primaryKey = '_id',
            indexes = [],
            coll
            ;
        
        if (is_String(mix)) {
            coll = mix;
        }
        else if (is_Object(mix)) {
            coll = mix.collection;
            indexes = mix.indexes || indexes;
            primaryKey = mix.primaryKey || primaryKey;
            
            var index = {};
            index[primaryKey] = 1;
            
            indexes.push([index, { unique: true }]);
        }
        
        // if DEBUG
        !coll && console.error('<MongoStore> should define a collection name');
        // endif
        
        this._coll = coll;
        this._indexes = indexes;
        this._primaryKey = primaryKey;
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
                this._completed('<class:patch> `_id` is not defined');
            
            return this;
        },
        
        patch: function(patch){
            if (this._ensureFree() === false) 
                return this;
            
            if (this._id == null)
                return this._completed('<class:patch> `_id` is not defined');
            
            obj_patch(this, patch);
            db_patchSingle(
                this._coll,
                this._id,
                patch,
                fn_proxy(this._completed, this)
            );
        
            return this;
        },
        
        Static: {
            fetch: function(data) {
                
                return new this().fetch(data);
            },
            
            resolveCollection: function(){
                
                return db_resolveCollection(new this()._coll);
            }
        },

        serialize: function(){
            return json_proto_toJSON.call(this);
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
                console.warn('<mongo:single> transport requested, but is busy for the same instance.');
                return false;
            }
            
            this.defer();
            this._busy = true;
            
            return true;
        },
        _completed: function(error){
            this._busy = false;
            
            return error 
                ? this.reject(error)
                : this.resolve(this)
                ;
        },
        _fetched: function(error, json) {
            if (error == null) {
                if (json == null) {
                    error = {
                        message: 'Not Found',
                        code: 404
                    };
                }
                else {
                    this.deserialize(json);
                }
            }
            
            this._completed(error);
        },
        
        _inserted: function(error, array){
            
            if (array != null && this._id == null) {
                
                if (is_Array(array) && array.length === 1) 
                    this._id = array[0]._id
                else 
                    console.error('<mongo:insert-single> expected an array in callback');
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