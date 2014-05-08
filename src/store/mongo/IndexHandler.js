var IndexHandler;
(function(){
	IndexHandler = {
		add: function(coll, indexes){
			_container.push([coll, indexes]);
		},
		ensureAll: ensureAll,
		ensure: ensure
	};
	
	// == private
	var i_Coll = 0,
		i_Indexes = 1
		;
	
	var _container = [];
	
	function ensure(coll, indexes, callback){
		var i = -1,
			imax = indexes.length,
			listener = cb_createListener(imax, callback)
			;
		
		while(++i < imax){
			db_ensureIndex(coll, indexes[i], listener);
		}
	}
	
	function ensureAll(callback){
		var dfr = new Deferred,
			imax = _container.length,
			listener = cb_createListener(imax, callback),
			i = -1
			;
			
		while ( ++i < imax ){
			ensure(
				_container[i][i_Coll],
				_container[i][i_Indexes],
				listener
			);
		}
	}
	
}());