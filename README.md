ClassJS
-----

[![Build Status](https://travis-ci.org/atmajs/ClassJS.png?branch=master)](https://travis-ci.org/atmajs/ClassJS)


Perfomant and Powerful Class-Model Implementation for browsers or nodejs


[Documentation](http://atmajs.com/class)


```javascript
Class({
	/*
	 * instanceof also works on deep inheritances
	 */
	Base: < Function > BaseConstructor,

	/* 
	 * Same as base, but instanceof wont work, 
	 * as instanceof allows linear inheritance only
	 */
	Extends: < Function | Object | Array > Mixins

	/*
	 * constructor of a class - if has inheritance, 
	 * also all constructors will be called
	 */
	Construct: < Function > function(){}

	/*
	 * Static functions of a created Class
	 * User.key()
	 */
	Static: < Object > { key: function(){} }

	/*
	 * RESTfull/LocalStorage/MongoDB serialization/deserialization
	 */
	Store: < Class.Remote | Class.LocalStore >

    /*
	 * Override any Base or Extended Function
	 *
	 *  Using this object, there will be access to overriden function
     *  via this.super();
     */
	 Override: < Object > {
		some: function(){
			
			// default arguments
			this.super(arguments);
			
			// overriden arguments
			this.super(arg1, arg2);
		}
	 },
	 
	 Self: {
		/*
		 * Functions, that are always bound to the instance of the class
		 * e.g. setTimeout(this.foo, 1000);
		foo: function(){}
	 }

	/* 
	 * Other class functions / properties you need
	 * This Object is then transformed into prototype object of
	 * a class.
	 */

	// ..
});

```


Store
-----

**Remote**
_async - extends Class.Deferred_

```javascript
var User = Class({
	Store: Class.Remote('/user/:id')
});

// resolve user GET
var user = User.fetch({id: 5});

user.done(onDone).fail(onFail).always(onComplete);

// Update POST
user.name = 'X';
user.save().done(onDone).fail(onFail).always(onComplete);

// Remove DEL
user.del().done(onDone).fail(onFail).always(onComplete)

```

More route samples can be found from tests [Route Tests](test/route.test)

**LocalStore**
_same as remote, as localStorage is sync - class doesnt extend Class.Deferred_
```javascript
var Settings = Class({
	Store: Class.LocalStore('app/settings'),
	points: 5
});

var setts = new Settings;

// get
setts.fetch();

// save / update
setts.points = 10;
setts.save();

// remove
setts.del();
```

**MongoDB**

```javascript
// settings:
Class.MongoStore.settings({
	db: 'myDBName',
	ip: '127.0.0.1' // <- default
	port: 27017 // <- default
});
//

var User = Class({
	Store: Class.MongoStore.Single('users'),
	
	username: ''
});

var _user = User
	.fetch({username: 'bar'})
	.done(function(user){
		_user === user // -> true
	})
	.fail(function(error){
	
	})

_user.username = 'foo'
_user
	.save()
	.done(callback)
	.fail(callback)
	.always(callback)
	;

_user
	.del()
	.done(callback)
	.fail(callback)
	.always(callback);

```

Collections
----

Creates Array-alike Object with store/query features

```javascript

var Users = Class.Collection(User, {
	Store: Class.Remote('/api/users?location={?country}')
});

var list = Users.fetch({country: 'DE'});

list.done(function(obj){
	
	list === obj 

	list.length

	list[0]

	// user instance
	list.first({age: '>20', genre: 'm'}); 

    // collection instance
	list.where({age: '>20'});
	list.where(function(x){ return x.age > 20 });


	// mutator
	list.remove({age: '<5'});
	
	// storage
	list.save();


	// mutator + storage
	list.del({age: '<5'});
})

```

Deferred
------

```javascript
var X = Class({
	Extends: Class.Deferred
});

new X()

	.resolve ( arg )
	.reject  ( arg )

	.done   ( callback )
	.fail   ( callback )
	.always ( callback )
	;
	
```

EventEmitter
------

```javascript
var X = Class({
	Extends: Class.EventEmitter
});

new X()

	.trigger( ..args )
	.on(event, callback)
	
	// function is detached after one call
	.once(event, callback)
	
	.off(event, callback)
	
	// creates function that can be bound to other event emitter
	// and transmits the event with new eventName to current listeners
	.pipe(event);

// pipe sample:

x.on('x-event', function(arg) {console.log('x-event', arg, '!'); });
y.on('y-event', x.pipe('x-event'));
	
y.trigger('y-event', '1.2.3');
// logs > "x-event 1.2.3!"

```