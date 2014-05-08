var core_findSingle,
	core_findMany,
	
	core_upsertSingle,
	core_upsertMany,
	
	core_updateSingle,
	core_updateMany,
	
	core_removeSingle,
	core_removeMany,
	
	core_count,
	
	core_profileIndexes_Enable,
	core_profileIndexes_GetData
	;
	
(function(){
	
	core_findSingle = function(coll, query, options, callback /*<error, item>*/){
		var c = db.collection(coll);
		if (options == null) 
			return c.findOne(query, callback);
		
		c.findOne(query, options, callback);
	};
	
	core_findMany = function(coll, query, options, callback /*<error, array>*/){
		var c = db.collection(coll);
		if (options == null) 
			return c.find(query, onQuery);
		
		c.find(query, options, onQuery);
			
		function onQuery(error, cursor){
			if (error) 
				return callback(error);
			
			cursor.toArray(callback);
		}
	};
	
	core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
		db
			.collection(coll)
			.update(query, data, opt_upsertSingle, callback);
	};
	core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
		modifyMany(core_upsertSingle, coll, array, callback);
	};
	
	core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
		db
			.collection(coll)
			.update(query, mod, callback);
	};
	core_updateMany = function(coll, array/*[[query, data]]*/, callback){
		modifyMany(core_updateSingle, coll, array, callback);
	};
	
	core_removeSingle = function(coll, query, callback /*<error, count>*/){
		db
            .collection(coll)
            .remove(query, { justOne: true }, callback);
	};
	core_removeMany = function(coll, query, callback /*<error, count>*/){
		db
			.collection(coll)
			.remove(query, { justOne: false }, callback);
	};
	
	core_count = function(coll, query, callback/*<error, count>*/){
		db
			.collection(coll)
			.count(query, callback);
	}
	
	// ==== private
	
	var opt_upsertSingle = {
		upsert: true,
		multi: false,
	};
	function modifyMany(modifier, coll, array /*[[query, data]]*/, callback) {
		var error,
			imax = array.length,
			count = imax;
			i = -1;
		if (imax === 0) 
			return callback();
		
		while ( ++i < imax ){
			modifier(coll, array[i][0], array[i][1], listener);
		}
		
		function listener(err){
			if (err) 
				error = err;
			
			if (--count === 0) 
				callback(error);
		}
	}
	
}());