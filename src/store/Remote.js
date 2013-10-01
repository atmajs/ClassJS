/**
 *	Alpha - Test - End
 */

var Remote = (function(){
	
	var XHRRemote = function(route){
		this._route = new Route(route);
	};
	
	obj_inherit(XHRRemote, StoreProto, DeferredProto, {
		
		fetch: function(data){
			XHR.get(this._route.create(data || this), this);
			return this;
		},
		
		save: function(callback){
			XHR.post(this._route.create(this), this.serialize(), callback);
			return this;
		},
		
		del: function(callback){
			XHR.del(this._route.create(this), this.serialize(), callback);
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