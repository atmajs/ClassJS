
var ArrayProto = (function(){

	function check(x, mix) {
		if (mix == null)
			return false;
		
		if (typeof mix === 'function') 
			return mix(x);
		
		if (typeof mix === 'object'){
			var value, matcher;
			for (var key in mix) {
				
				value = x[key];
				matcher = mix[key];
				
				if (typeof matcher === 'string') {
					var c = matcher[0],
						index = 1;
					
					if ('<' === c || '>' === c){
						
						if ('=' === matcher[1]){
							c +='=';
							index++;
						}
						
						matcher = matcher.substring(index);
						
						switch (c) {
							case '<':
								if (value >= matcher)
									return false;
								continue;
							case '<=':
								if (value > matcher)
									return false;
								continue;
							case '>':
								if (value <= matcher)
									return false;
								continue;
							case '>=':
								if (value < matcher)
									return false;
								continue;
						}
					}
				}
				
				// eqeq to match by type diffs.
				if (value != matcher) 
					return false;
				
			}
			return true;
		}
		
		console.warn('No valid matcher', mix);
		return false;
	}

	var ArrayProto = {
		push: function(mix) {
			this[this.length++] = create(this._constructor, mix);
			return this;
		},
		pop: function() {
			var instance = this[--this.length];
	
			this[this.length] = null;
			return instance;
		},
		
		each: function(fn, cntx){
			for (var i = 0, x, imax = array.length; i < imax; i++){
				x = array[i];
				
				fn.call(cntx || this, x, i);
			}
		},
		
		where: function(mix){
			
			var collection = new this.constructor();
			
			for (var i = 0, x, imax = this.length; i < imax; i++){
				x = this[i];
				
				if (check(x, mix)) {
					collection[collection.length++] = x;
				}
			}
			
			return collection;
		},
		remove: function(mix){
			var index = -1,
				array = [];
			for (var i = 0, imax = this.length; i < imax; i++){
				
				if (check(this[i], mix)) {
					array.push(this[i]);
					continue;
				}
				
				this[++index] = this[i];
			}
			for (i = ++index; i < imax; i++) {
				this[i] = null;
			}
			
			this.length = index;
			return array;
		},
		first: function(mix){
			if (mix == null)
				return this[0];
			
			var imax = this.length,
				i = 0;
			while (--imax !== -1) {
				if (check(this[i++], mix))
					return this[i - 1];
			}
			return null;
		},
		last: function(mix){
			if (mix == null)
				return this[0];
			
			var imax = this.length;
			while (--imax !== -1) {
				if (check(this[imax], mix))
					return this[imax];
			}
			return null;
		}
	};
	
	
	return ArrayProto;
}());
