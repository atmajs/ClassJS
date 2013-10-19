Class.LocalStore = (function(){
	
	var LocalStore = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(LocalStore, StoreProto, Serializable, Deferred, {
		
		serialize: function(){
			
			var json = is_Array(this)
				? JSONHelper.arrayToJSON.call(this)
				: JSONHelper.toJSON.call(this)
				;
			
			return JSON.stringify(json);
		},
		
		fetch: function(data){
			
			var path = this._route.create(data || this),
				object = localStorage.getItem(path);
			
			if (object == null) {
				this.resolve(this);
				return this;
			}
			
			if (is_String(object)){
				try {
					object = JSON.parse(object);
				} catch(e) {
					this.onError(e);
				}
			}
			
			this.deserialize(object);
			
			return this.resolve(this);
		},
		
		save: function(callback){
			var path = this._route.create(this),
				store = this.serialize();
			
			localStorage.setItem(path, store);
			callback && callback();
			return this;
		},
		
		del: function(mix){
			
			if (mix == null && arguments.length !== 0) {
				console.error('<localStore:del> - selector is specified, but is undefined');
				return this;
			}
			
			// Single
			if (arr_isArray(this) === false) {
				store_del(this._route, mix || this);
				return this;
			}
			
			// Collection
			if (mix == null) {
				
				for (var i = 0, imax = this.length; i < imax; i++){
					this[i] = null;
				}
				this.length = 0;
				
				store_del(this._route, this);
				return this;
			}
			
			var array = this.remove(mix);
			if (array.length === 0) {
				// was nothing removed
				return this;
			}
			
			return this.save();
		},
		
		onError: function(error){
			this.reject({
				error: error
			});
		}
		
		
	});
	
	function store_del(route, data){
		var path = route.create(data);
		
		localStorage.removeItem(path);
	}
	
	var Constructor = function(route){
		
		return new LocalStore(route);
	};
	
	Constructor.prototype = LocalStore.prototype;
	
	
	return Constructor;

}());