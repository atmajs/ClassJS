function MongoStoreCtor(mix) {
	var primaryKey = '_id',
		indexes = null,
		coll
		;
	
	if (is_String(mix)) {
		coll = mix;
	}
	else if (is_Object(mix)) {
		coll = mix.collection;
		indexes = mix.indexes;
		
		if (mix.primaryKey != null) {
			primaryKey = mix.primaryKey;
			
			var index = {};
			index[primaryKey] = 1;
			
			if (indexes == null) 
				indexes = [];
			indexes.push([index, { unique: true }]);
		}
		
	}
	
	// if DEBUG
	!coll && console.error('<MongoStore> should define a collection name', mix);
	// endif
	
	this._coll = coll;
	this._indexes = indexes;
	this._primaryKey = primaryKey;
	
	if (indexes != null) 
		IndexHandler.add(coll, indexes);
}