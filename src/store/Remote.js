/**
 *	Alpha - Test - End
 */

Class.Remote = (function(){
	
	var XHRRemote = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
		
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
			
			XHR[method](path, json, resolveDelegate(this, callback));
			return this;
		},
		
		del: function(callback){
			var self = this,
				json = this.serialize(),
				path = this._route.create(this);
				
			this._resolved = null;
			this._rejected = null;
			
			XHR.del(path, json, resolveDelegate(this, callback));
			return this;
		},
		
		onSuccess: function(response){
			parseFetched(this, response);
		},
		onError: function(errored, response, xhr){
			reject(this, response, xhr);
		}
		
		
	});
	
	function parseFetched(self, response){
		var json;
			
		try {
			json = JSON.parse(response);	
		} catch(error) {
			
			reject(self, error);
			return;
		}
		
		
		self.deserialize(json);
		self.resolve(self);
	}
	
	function reject(self, response, xhr){
		self.reject(response);
	}
	
	function resolveDelegate(self, callback){
		
		return function(error, response, xhr){
					
				// @obsolete -> use deferred
				if (callback) 
					callback(error, response);
				
				if (error) 
					return reject(self, response, xhr);
				
				self.resolve(response);
		};
	}
	
	return function(route){
		
		return new XHRRemote(route);
		
	};
	
}());