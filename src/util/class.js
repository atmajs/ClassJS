var class_register,
	class_get
	;

(function(){
	
	class_register = function(namespace, _class){
		
		var host = _cfg.ModelHost || Class.Model;
		
		obj_setProperty(host, namespace, _class);
	};
	
	class_get = function(namespace){
		
		var host = _cfg.ModelHost || Class.Model;
		
		obj_getProperty(host, namespace);
	};
})