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
	
	function Collection(/* (ClassName, Child, Proto) (Child, Proto) */) {
		var length = arguments.length,
			Proto = arguments[length - 1],
			Child = arguments[length - 2],
			
			className
			;
		
		if (length > 2) 
			className = arguments[0];
		
		
		Proto._ctor = Child;
		obj_inherit(Proto, CollectionProto, ArrayProto);
		
		return className == null
			? Class(Proto)
			: Class(className, Proto)
			;
	}
	
	
	return Collection;
}());