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
				? json_proto_arrayToJSON.call(this)
				: json_proto_toJSON.call(this)
				;
		},
		
		deserialize: function(json){
			return Serializable.deserialize(this, json);
		},
		
		fetch: function(data){
			XHR.get(this._route.create(data || this), this);
			return this;
		},
		
		save: function(callback){
			
			var self = this,
				json = self.serialize(),
				path = self._route.create(self),
				method = self._route.hasAliases(self)
					? 'put'
					: 'post'
				;
			
			self.defer();
			XHR[method](path, json, resolveDelegate(self, callback, 'save'));
			return self;
		},
		
		patch: function(json){
			obj_patch(this, json);
			
			this.defer();
			
			XHR.patch(
				this._route.create(this),
				json,
				resolveDelegate(this)
			);
			return this;
		},
		
		del: function(callback){
			var self = this,
				json = self.serialize(),
				path = self._route.create(self)
				;
				
			self.defer();
			XHR.del(path, json, resolveDelegate(self, callback));
			return self;
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
				
				var header = xhr.getResponseHeader(str_CONTENT_TYPE),
					isJSON = header != null &&  header.indexOf(str_JSON) !== -1
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
					
					return self.resolve(self);
				}
				
				self.resolve(response);
		};
	}
	
	return function(route){
		
		return new XHRRemote(route);
		
	};
	
}());