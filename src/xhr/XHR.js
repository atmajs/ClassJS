var XHR = {};

arr_each(['get', 'del'], function(key){
	XHR[key] = function(path, sender){
		
		this.promise[key](path)
		.then(function(error, response){
			
			if (error) {
				sender.onError(error, response);
				return;
			}
			
			sender.onSuccess(response);
		});
		
	}
})

arr_each(['post', 'put'], function(key){
	XHR[key] = function(path, data, cb){
		this.promise[key](path, data)
		
		.then(function(error, response){
			cb(error, response);
		});
	};
});


//
//var User = Class({
//	Store: Remote('/user/:id'),
//	Defaults: {
//		name: 'None'
//	},
//	Validation: [Validation.notEmpty],
//	
//	greet: Class.Contract(Class.Validation.isValid, function(){
//		console.log('name', name);
//	})
//})
//
//
//var UserCollection = Class.Collection(User, {
//	Store: Remote('/users/?:country')
//});
//
//var UserCollection = Class.Collection(User, {
//	Store: Remote('/users/?country=?:country')
//});
//
//var user = User.fetch(123, function(){})
//	user.save();
//	user.delete();
//
//var users = UserCollection.fetch({ country: 'Germany' });
//
//	users.save();
//	users.delete({city: 'Lepzig'});
//
//
//
