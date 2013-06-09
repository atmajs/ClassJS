var Collection = (function(){
	
	// import ArrayProto.js
	
	function create(Constructor, mix) {
		
		if (mix instanceof Constructor) 
			return mix;
		
		return new Constructor(mix);
	}
	
	var CollectionProto = {
		serialize: function(){
			return JSON.stringify(this.toArray());
		},
		
		deserialize: function(mix){
			for (var i = 0, imax = mix.length; i < imax; i++){
				this[this.length++] = create(this._constructor, mix[i]);
			}
			
			return this;
		},
		
		del: function(mix){
			
			if (mix == null) {
				
				for (var i = 0, imax = this.length; i < imax; i++){
					this[i] = null;
				}
				this.length = 0;
				
				LocalStore.prototype.del.call(this);
				return this;
			}
			
			var array = this.remove(mix);
			if (array.length === 0) 
				return this;
			
			return this.save();
		},
		
		toArray: function(){
			var array = new Array(this.length);
			for (var i = 0, imax = this.length; i < imax; i++){
				array[i] = this[i];
			}
			
			return array;
		}	
	};
	
	function overrideConstructor(baseConstructor, Child) {
		
		return function CollectionConstructor(){
			this.length = 0;
			this._constructor = Child;
			
			if (baseConstructor != null)
				return baseConstructor.apply(this, arguments);
			
			return this;
		};
		
	}
	
	function Collection(Child, Proto) {
		
		Proto.Construct = overrideConstructor(Proto.Construct, Child);
		
		
		obj_inherit(Proto, CollectionProto, ArrayProto);
		return Class(Proto);
	}
	
	
	return Collection;
}());