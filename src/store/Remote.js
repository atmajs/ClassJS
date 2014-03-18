Class.Remote = (function(){

	var str_CONTENT_TYPE = 'content-type',
		str_JSON = 'json'
		;
		
	var XHRRemote = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(XHRRemote, StoreProto, Serializable, Deferred, {
		
		defer: storageEvents_overridenDefer,
		
		serialize: function(){
			
			return is_Array(this)
				? json_proto_arrayToJSON.call(this)
				: json_proto_toJSON.call(this)
				;
		},
		
		deserialize: function(json){
			return Serializable.deserialize(this, json);
		},
		
		fetch: function(data){
			this.defer('fetch');
			
			XHR.get(this._route.create(data || this), this);
			return this;
		},
		
		save: function(callback){
			this.defer('save');
			
			var json = this.serialize(),
				path = this._route.create(this),
				method = this._route.hasAliases(this)
					? 'put'
					: 'post'
				;
			
			XHR[method](path, json, resolveDelegate(this, callback, 'save'));
			return this;
		},
		
		patch: function(json){
			this.defer('patch');
			
			obj_patch(this, json);
			
			XHR.patch(
				this._route.create(this),
				json,
				resolveDelegate(this)
			);
			return this;
		},
		
		del: function(callback){
			this.defer('del');
			
			var json = this.serialize(),
				path = this._route.create(this)
				;
			
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
		var obj;
		if (typeof response === 'string' && is_JsonResponse(xhr)) {
			try {
				obj = JSON.parse(response);
			} catch (error) {
				obj = error;
			}
		}
		
		self.reject(obj || response);
	}
	
	function is_JsonResponse(xhr){
		var header = xhr.getResponseHeader(str_CONTENT_TYPE);
		
		return header != null
			&&  header.toLowerCase().indexOf(str_JSON) !== -1;
	}
	
	function resolveDelegate(self, callback, action){
		
		return function(error, response, xhr){
				
				if (is_JsonResponse(xhr)) {
					try {
						response = JSON.parse(response);
					} catch(error){
						console.error('<XHR> invalid json response', response);
						
						return reject(self, error, xhr);
					}
				}
				
				// @obsolete -> use deferred
				if (callback) 
					callback(error, response);
				
				if (error) 
					return reject(self, response, xhr);
				
				if ('save' === action && is_Object(response)) {
					
					if (is_Array(self)) {
						
						var imax = self.length,
							jmax = response.length,
							i = -1
							;
						
						while ( ++i < imax && i < jmax){
							
							Serializable.deserialize(self[i], response[i]);
						}
						
					} else {
						self.deserialize(response);
					}
					
					return self.resolve(self);
				}
				
				self.resolve(response);
		};
	}
	
	function Remote(route){
		
		return new XHRRemote(route);
	};
	
	Remote.onBefore = storageEvents_onBefore;
	Remote.onAfter = storageEvents_onAfter;
	
	arr_each(['get', 'post', 'put', 'delete'], function(method){
		
		Remote[method] = function(url, obj){
			
			var json = obj;
			if (obj.serialize != null) 
				json = obj.serialize();
			
			if (json == null && obj.toJSON) 
				json = obj.toJSON();
			
			var dfr = new Deferred();
			XHR[method](url, json, resolveDelegate(dfr));
			
			return dfr;
		};
	});
	
	return Remote;
}());