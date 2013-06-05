ClassJS
-----

<img src='https://secure.travis-ci.org/tenbits/ClassJS.png'/>


Perfomant and Powerful Class - Model Implementation for browsers or nodejs


[http://libjs.it/#class](Documentation)


```javascript
Class({
	/*
	 * instanceof also works on deep inheritances
	 */
	Base: { Function } BaseConstructor,

	/* 
	 * Same as base, but instanceof wont work, 
	 * as instanceof allows linear inheritance only
	 */
	Extends: { Function | Object | Array } Mixins

	/*
	 * constructor of a class - if has inheritance, 
	 * also all constructors will be called
	 */
	Construct: { Function } function(){}

	/*
	 *Static functions of a created Class
	 */
	Static: { Object } 

	/*
	 * RESTFull / LocalStorage serialization / deserialization
	 */
	Store: { Remote | LocalStore }


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

*Remote*

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

*LocalStore*
_same as remote, as localStorage is remote class doesnt extend Class.Deferred_
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


Collections
----

Creates Array-alike Object with store/query features

```javascript

var Users = Class.Collection(User, {
	Store: Remote('/api/users?location={country}')
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


	// mutator + storage
	list.del({age: '<5'});
})

```