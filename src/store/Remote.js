/**
 *	Alpha - Test - End
 */

Class.Remote = (function(){
	
	var XHRRemote = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(XHRRemote, StoreProto, Deferred, {
		
		serialize: function(){
			
			return is_Array(this)
				? JSONHelper.arrayToJSON.call(this)
				: JSONHelper.toJSON.call(this)
				;
		},
		
		fetch: function(data){
			XHR.get(this._route.create(data || this), this);
			return this;
		},
		
		save: function(callback){
			
			var self = this,
				json = this.serialize(),
				path = this._route.create(this),
				method = this._route.hasAliases(this)
					? 'put'
					: 'post'
				;
			
			this._resolved = null;
			this._rejected = null;
			
			XHR[method](path, json, function(error, response){
					
					// @obsolete -> use deferred
					if (callback) 
						callback(error, response);
					
					if (error) 
						return self.reject(error);
					
					self.resolve(response);
			});
			return this;
		},
		
		del: function(callback){
			var self = this,
				json = this.serialize(),
				path = this._route.create(this);
				
			this._resolved = null;
			this._rejected = null;
			
			XHR.del(path, json, function(error, response){
					
					// @obsolete -> use deferred
					if (callback) 
						callback(error, response);
					
					if (error) 
						return self.reject(error);
					
					self.resolve(response);
			});
			return this;
		},
		
		onSuccess: function(response){
			var json;
			
			try {
				json = JSON.parse(response);	
			} catch(error) {
				this.onError(error);
				return;
			}
			
			
			this.deserialize(json);
			this.resolve(this);
		},
		onError: function(error){
			this.reject({
				error: error
			});
		}
		
		
	});
	
	
	
	return function(route){
		
		return new XHRRemote(route);
		
	};
	
}());