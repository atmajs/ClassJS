Class.Collection = (function(){
	
	// import ArrayProto.js
	
	function create(Constructor, mix) {
		
		if (mix instanceof Constructor) 
			return mix;
		
		return new Constructor(mix);
	}
	
	var CollectionProto = {
		
		toArray: function(){
			var array = new Array(this.length);
			for (var i = 0, imax = this.length; i < imax; i++){
				array[i] = this[i];
			}
			
			return array;
		},
		
		toJSON: function(){
			var array = new Array(this.length);
			for (var i = 0, x, imax = this.length; i < imax; i++){
				x = this[i];
				
				if (x == null)
					// skip also index - will be undefined
					continue;
				
				array[i] = is_Function(this[i].toJSON)
					? this[i].toJSON()
					: JSONHelper.toJSON.call(this[i])
					;
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
		
		//var __proto = {
		//	Construct: overrideConstructor(Proto.Construct, Child)
		//};
		//delete Proto.Construct;
		Proto.Construct = overrideConstructor(Proto.Construct, Child);
		
		
		obj_inherit(Proto, CollectionProto, ArrayProto);
		return Class(Proto);
	}
	
	
	return Collection;
}());