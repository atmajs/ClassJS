ClassJS
-----
[![Build Status](https://travis-ci.org/atmajs/ClassJS.png?branch=master)](https://travis-ci.org/atmajs/ClassJS)


Perfomant and Powerful Class-Model Implementation for browsers or nodejs

[Documentation](http://atmajs.com/class)

###### Install

- Standalone: ``` $ npm install atma-class ```
- [AtmaPackage](https://github.com/atmajs/Atma.Libs): ``` $ npm install atma-libs ```

-----

- [Persistence](#store)
- [Collections](#collections)
- Embedded Classes
    - [Deferred](#deferred)
    - [EventEmitter](#eventemitter)

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
	Store: <| Class.Remote('/user/:id')
            | Class.LocalStore('user')
            | Class.Mongo.Single('users')
            | Class.Mongo.Collection('users') |>

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
	 },
     
     Validate: {
        user: function(val){
            if (val == null)
                return 'Username must be defined';
        }
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

Storage Interface is same for all types, so you can easily switch between localStorage, AJAX or MongoDB.

**Remote**
_async - extends Class.Deferred_

```javascript
var User = Class({
	Store: Class.Remote('/user/:id')
});

// resolve user (GET)
var user = User.fetch({id: 5});

user
    .done(onDone)
	.fail(onFail)
	.always(onComplete);

// update (PUT) or Save (POST) - (look for existance of id/_id properties);

user.name = 'X';
user
    .save()
	.done(onDone)
	.fail(onFail)
	.always(onComplete);

// Remove (DELETE)
user
    .del()
	.done(onDone)
	.fail(onFail)
	.always(onComplete)

// patch object (PATCH) - MongoDB update query syntax is used
user
	.patch({
		$inc: { 'visits': 1 },
		$set: { 'current.date' : new Date }
	})
	
```

More route samples can be found from tests [Route Tests](test/route.test)

**LocalStore**
_as localStorage is sync - class doesnt extend Class.Deferred_
```javascript
var Settings = Class({
	Store: Class.LocalStore('app/settings'),
	points: 5
});

var setts = new Settings;

// get
setts.fetch();

// save or update
setts.points = 10;
setts.save();

// remove
setts.del();

// patch
setts.patch({
	$inc: { points: 1 }
});
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
	.fetch({ username: 'bar' })
//  .fetch({ age: '>10' })
	.done(function(user){
		_user === user // -> true
	})
	.fail(function(error){
	
	})

// To perform more complex queries, use $query of MongoDB
User
	.fetch({
		$query:{
			name: 'Smith'
			age: {
				$gte: 40
			}
		},
		$orderby:{
			surname: -1
		}, 
		$maxScan: 1, 
	})
	.done(function(users){
		
	})
	;

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
	
_user
	.patch({
		$inc: { age: 1 }
	})
	;

// To run complex MongoDB queries:

// 1) Get MongoDB `db` object
Class
	.MongoStore
	.resolveDb()
	.done(function(db){
		// do smth with the database
	})
	.fail(onError);

// 2) Get MongoDB Collection object
User
	.resolveCollection()
	.done(function(collection){
		// do smth with the collection object
	})
	.fail(onError)
	;
```

All work with the database is encapsulated, so you do not need even to connect to the database,
just apply settings and with the first query the connection will be established.

Connection to a Replicaset:
```javascript
Class
	.MongoStore
	.settings({
		connection: 'mongodb://localhost:30000,localhost:30001,localhost:30002/myDatabase',
		
		// redefine options, defaults are:
		params: {
			auto_reconnect: true,
			native_parser: true,
			w: 1
		}
	})
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