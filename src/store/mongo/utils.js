function cb_createListener(count, cb){
	var _error;
	return function(error){
		if (error)
			_error = error;
			
		if (--count === 0)
			cb(_error);
	};
}


//
//function mongoSingle_serialize(){
//	
//	JSONHelper.skipToJSON(db_getMongo().ObjectID().toJSON);
//	
//	
//	mongoSingle_serialize =
//		MongoStoreSingle.prototype.toJSON =
//			JSONHelper.toJSON
//	;
//	
//	return mongoSingle_serialize.call(this);
//}