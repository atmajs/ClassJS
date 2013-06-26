
var ArrayProto = (function(){

	function check(x, mix) {
		if (mix == null)
			return false;
		
		if (typeof mix === 'function') 
			return mix(x);
		
		if (typeof mix === 'object'){
			
			if (x.constructor === mix.constructor && x.constructor !== Object) {
				return x === mix;
			}
			
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
		push: function(/*mix*/) {
			for (var i = 0, imax = arguments.length; i < imax; i++){
				
				this[this.length++] = create(this._constructor, arguments[i]);
			}
			
			return this;
		},
		pop: function() {
			var instance = this[--this.length];
	
			this[this.length] = null;
			return instance;
		},
		shift: function(){
			if (this.length === 0) 
				return null;
			
			
			var first = this[0],
				imax = this.length - 1,
				i = 0;
			
			for (; i < imax; i++){
				this[i] = this[i + 1];
			}
			
			this[imax] = null;
			this.length--;
			
			return first;
		},
		unshift: function(mix){
			this.length++;
			
			var imax = this.length;
			
			while (--imax) {
				this[imax] = this[imax - 1];
			}
			
			this[0] = create(this._constructor, mix);
			return this;
		},
		
		splice: function(index, count /* args */){
			var i, imax, length, y;
			
			
			// clear range after length until index
			if (index >= this.length) {
				count = 0;
				for (i = this.length, imax = index; i < imax; i++){
					this[i] = void 0;
				}
			}
			
			var	rm_count = count,
				rm_start = index,
				rm_end = index + rm_count,
				add_count = arguments.length - 2,
				
				new_length = this.length + add_count - rm_count;
			
			
			// move block
			
			var block_start = rm_end,
				block_end = this.length,
				block_shift = new_length - this.length;
			
			if (0 < block_shift) {
				// move forward
				
				i = block_end;
				while (--i >= block_start) {
					
					this[i + block_shift] = this[i];
					
				}

			}
			
			if (0 > block_shift) {
				// move backwards
				
				i = block_start;				
				while (i < block_end) {
					this[i + block_shift] = this[i];
					i++;
				}
			}
			
			// insert
			
			i = rm_start;
			y = 2;
			for (; y < arguments.length; y) {
				this[i++] = create(this._constructor, arguments[y++]);
			}
			
			
			this.length = new_length;
			return this;
		},
		
		slice: function(){
			return _Array_slice.apply(this, arguments);
		},
		
		sort: function(fn){
			_Array_sort.call(this, fn);
			return this;
		},
		
		reverse: function(){
			var array = _Array_slice.call(this, 0);
				
			for (var i = 0, imax = this.length; i < imax; i++){
				this[i] = array[imax - i - 1];
			}
			return this;
		},
		
		toString: function(){
			return _Array_slice.call(this, 0).toString()
		},
		
		each: function(fn, cntx){
			for (var i = 0, imax = this.length; i < imax; i++){
				
				fn.call(cntx || this, this[i], i);
				
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
