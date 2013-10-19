var StoreProto = {
	
	
	// Abstract
	
	fetch: null,
	save: null,
	del: null,
	onSuccess: null,
	onError: null,
	
	Static: {
		fetch: function(data){
			return new this().fetch(data);
		}
	}
};