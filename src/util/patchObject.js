var obj_patch,
	obj_patchValidate;

(function(){
	
	obj_patch = function(obj, patch){
		
		for(var key in patch){
			
			var patcher = patches[key];
			
			if (patcher) 
				patcher[fn_WALKER](obj, patch[key], patcher[fn_MODIFIER]);
			else
				console.error('Unknown or not implemented patcher', key);
			
		}
		return obj;
	};
	
	obj_patchValidate = function(patch){
		if (patch == null) 
			return 'Undefined';
		
		var has = false;
		for(var key in patch){
			has = true;
			
			if (patches[key] == null) 
				return 'Unsupported patcher: ' + key;
		}
		if (has === false) 
			return 'No data';
		
		return null;
	}
	
	// === private
	
	function walk_mutator(obj, data, fn) {
		for (var key in data) 
			fn(obj_getProperty(obj, key), data[key], key);
		
	}
	
	function walk_modifier(obj, data, fn){
		for(var key in data)
			obj_setProperty(
				obj,
				key,
				fn(obj_getProperty(obj, key), data[key], key)
			);
	}
	
	function fn_IoC(){
		var fns = arguments;
		return function(val, mix, prop){
			for (var i = 0, fn, imax = fns.length; i < imax; i++){
				fn = fns[i];
				if (fn(val, mix, prop) === false) 
					return;
			}
		}
	}
	
	function arr_checkArray(val, mix, prop) {
		if (arr_isArray(val) === false) {
			// if DEBUG
			console.warn('<patch> property is not an array', prop);
			// endif
			return false;
		}
	}
	
	function arr_push(val, mix, prop){
		if (mix.hasOwnProperty('$each')) {
			for (var i = 0, imax = mix.$each.length; i < imax; i++){
				val.push(mix.$each[i]);
			}
			return;
		}
		val.push(mix);
	}
	
	function arr_pop(val, mix, prop){
		 val[mix > 0 ? 'pop' : 'shift']();
	}
	function arr_pull(val, mix, prop) {
		arr_remove(val, function(item){
			return query_match(item, mix);
		});
	}
	
	function val_inc(val, mix, key){
		return val + mix;
	}
	function val_set(val, mix, key){
		return mix;
	}
	function val_unset(){
		return void 0;
	}
	
	function val_bit(val, mix){
		if (mix.or) 
			return val | mix.or;
		
		if (mix.and) 
			return val & mix.and;
		
		return val;
	}
	
	var query_match;
	(function(){
		/** @TODO improve object matcher */
		query_match = function(obj, mix){
			for (var key in mix) {
				if (obj[key] !== mix[key]) 
					return false;
			}
			return true;
		};
	}());
	
	
	var fn_WALKER = 0,
		fn_MODIFIER = 1
		;
		
	var patches = {
		'$push': [walk_mutator, fn_IoC(arr_checkArray, arr_push)],
		'$pop':  [walk_mutator, fn_IoC(arr_checkArray, arr_pop)],
		'$pull': [walk_mutator, fn_IoC(arr_checkArray, arr_pull)],
		
		'$inc':   [walk_modifier, val_inc],
		'$set':   [walk_modifier, val_set],
		'$unset': [walk_modifier, val_unset],
		'$bit':   [walk_modifier, val_unset],
	};
	
	
	
}());