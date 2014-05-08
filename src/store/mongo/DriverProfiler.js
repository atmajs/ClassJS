var core_profiler_toggle,
	core_profiler_getData
	;

(function(){
	var state = false,
	
		// settins
		setts_slowLimit = 50,
		setts_onDetect = null,
		setts_detector = null,
		
		box = {
			count: 0,
			slow: [],
			errors: []
		},
		
		_core_findSingle = core_findSingle,
		_core_findMany = core_findMany,
		_core_upsertSingle = core_upsertSingle,
		_core_upsertMany = core_upsertMany,
		_core_updateSingle = core_updateSingle,
		_core_updateMany = core_updateMany,
		_core_removeSingle = core_removeSingle,
		_core_removeMany = core_removeMany,
		_core_count = core_count
		;
	
	core_profiler_getData = function(){
		return box;
	};
	
	core_profiler_toggle =  function(enable, settings){
		if (settings) {
			setts_slowLimit = settings.slow || setts_slowLimit;
			setts_onDetect = settings.onDetect || setts_onDetect;
			setts_detector = settings.detector || setts_detector;
		}
		
		if (state === enable) 
			return;
		if (enable == null) 
			enable = !!state;
		
		state = enable;
		if (state === false) {
			core_findSingle = _core_findSingle;
			core_findMany = _core_findMany;
			core_upsertSingle = _core_upsertSingle;
			core_upsertMany = _core_upsertMany;
			core_updateSingle = _core_updateSingle;
			core_updateMany = _core_updateMany;
			core_removeSingle = _core_removeSingle;
			core_removeMany = _core_removeMany;
			core_count = _core_count;
			return;
		}
		
		core_findSingle = function(coll, query, options, callback /*<error, item>*/){
			_core_findSingle.apply(null, arguments);
			_core_findSingle(
				coll
				, wrapQuery(query)
				, options
				, analizator(coll, query));
		};
		core_findMany = function(coll, query, options, callback /*<error, array>*/){
			_core_findMany.apply(null, arguments);
			_core_findMany(
				coll
				, wrapQuery(query)
				, options
				, analizator(coll, query));
		};
		core_upsertSingle = function(coll, query, data, callback/*<error, stats>*/){
			_core_upsertSingle.apply(null, arguments);
			_core_upsertSingle(
				coll
				, wrapQuery(query)
				, data
				, analizator(coll, query));
		};
		core_upsertMany = function(coll, array /*[[query, data]]*/, callback){
			_core_upsertMany.apply(null, arguments);
			_core_upsertMany(
				coll
				, wrapMany(array)
				, analizator(coll, array));
		};
		core_updateSingle = function(coll, query, mod, callback /*<error, stats>*/){
			_core_updateSingle.apply(null, arguments);
			_core_updateSingle(
				coll
				, wrapQuery(query)
				, mod
				, analizator(coll, query));
		};
		core_updateMany = function(coll, array/*[[query, data]]*/, callback){
			_core_updateMany.apply(null, arguments);
			_core_updateMany(
				coll
				, wrapMany(array)
				, analizator(coll, array));
		};
		core_removeSingle = function(coll, query, callback /*<error, count>*/){
			_core_removeSingle.apply(null, arguments);
			_core_removeSingle(
				coll
				, wrapQuery(query)
				, analizator(coll, query));
		};
		core_removeMany = function(coll, query, callback /*<error, count>*/){
			_core_removeMany.apply(null, arguments);
			_core_removeMany(
				coll
				, wrapQuery(query)
				, analizator(coll, query));
		};
		core_count = function(coll, query, callback/*<error, count>*/){
			_core_count.apply(null, arguments);
			_core_count(
				coll
				, wrapQuery(query)
				, analizator(coll, query));
		};
	}
	
	function wrapQuery(query){
		if (query == null) 
			return { $query: {}, $explain: true };
		
		if (query.$query) {
			query.$explain = true;
			return query;
		}
		return {
			$query: query,
			$explain: true
		};
	}
	function wrapMany(array){
		return array.forEach(function(x){
			return [ wrapQuery(x[0]), x[1]];
		});
	}
	function analizator(coll, query) {
		return function(error, plan){
			box.count++;
			if (error) {
				box.errors.push(error);
				return;
			}
			analize(coll, query, plan);
		}
	}
	function analize(coll, query, plan, params){
		params = params || {};
		if (plan == null || typeof plan === 'number') 
			return;
		if (Array.isArray(plan)) {
			plan.forEach(function(plan, index){
				params.isArray = true;
				params.index = index;
				analize(coll, query, plan, params);
			});
			return;
		}
		if (plan.clause) {
			plan.clause.forEach(function(plan, index){
				params.isClause = true;
				params.index = index;
				analize(coll, query, plan, index);
			});
			return;
		}
		if (plan.millis != null && plan.millis >= setts_slowLimit) {
			add('slow', coll, query, plan, params);
			return;
		}
		if (plan.cursor == null) 
			return;
		
		if (plan.cursor.indexOf('BasicCursor') !== -1) {
			add('unindexed', coll, query, plan, params);
			return;
		}
		if (setts_detector && setts_detector(plan, coll, query)) {
			add('custom', coll, query, plan, params);
			return;
		}
	}
	function add(reason, coll, query, plan, params){
		params.reason = reason;
		
		var obj = {
			coll: coll,
			query: query,
			plan: plan,
			params: params
		};
		setts_onDetect && setts_onDetect(obj);
		box.slow.push(obj);
	}
}());