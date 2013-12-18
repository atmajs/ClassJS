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
		
		toJSON: json_proto_arrayToJSON
	};
	
	function Collection(Child, Proto) {
		
		
		Proto._ctor = Child;
		
		
		obj_inherit(Proto, CollectionProto, ArrayProto);
		return Class(Proto);
	}
	
	
	return Collection;
}());