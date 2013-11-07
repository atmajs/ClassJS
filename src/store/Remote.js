/**
 *	Alpha - Test - End
 */

Class.Remote = (function(){

	var str_CONTENT_TYPE = 'content-type',
		str_JSON = 'json'
		;
		
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
			
			this.defer();
			XHR[method](path, json, resolveDelegate(this, callback, 'save'));
			return this;
		},
		
		patch: function(patch){
			obj_patch(patch);
			
			this.defer();
			XHR.patch(path, json, resolveDelegate(this, callback));
			return this;
		},
		
		del: function(callback){
			var self = this,
				json = this.serialize(),
				path = this._route.create(this);
				
			this.defer();
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
	
	function resolveDelegate(self, callback, action){
		
		return function(error, response, xhr){
				
				var isJSON = xhr
					.getResponseHeader(str_CONTENT_TYPE)
					.indexOf(str_JSON) !== -1
					;
					
				if (isJSON) {
					try {
						response = JSON.parse(response);
					} catch(error){
						console.error('<XHR> invalid json response', response);
						
						return reject(self, response, xhr);
					}
				}
				
				// @obsolete -> use deferred
				if (callback) 
					callback(error, response);
				
				if (error) 
					return reject(self, response, xhr);
				
				if ('save' === action) {
					self.deserialize(response);
					
					return self.resolve(self)
				}
				
				self.resolve(response);
		};
	}
	
	return function(route){
		
		return new XHRRemote(route);
		
	};
	
}());