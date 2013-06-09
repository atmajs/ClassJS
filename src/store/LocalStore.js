var LocalStore = (function(){
	
	var LocalStore = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(LocalStore, StoreProto, DeferredProto, {
		
		fetch: function(data){
			
			var path = this._route.create(data || this),
				object = localStorage.getItem(path);
			
			if (object == null) {
				this.resolve(this);
				return this;
			}
			
			if (typeof object === 'string'){
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
		
		del: function(data){
			var path = this._route.create(data || this);
			
			localStorage.removeItem(path);
			return this;
		},
		
		onError: function(error){
			this.reject({
				error: error
			});
		}
		
		
	});
	
	
	
	var Constructor = function(route){
		
		return new LocalStore(route);
		
	};
	
	Constructor.prototype = LocalStore.prototype;
	
	
	return Constructor;

}());