function test(Class){
	var Prev = null,
		letters = [
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't'
		];
	
	// create
	var models = letters.map(function(letter){
		var proto = {
			Base: Prev
		};
		proto[letter] = letter;
		
		return Prev = Class(proto);
	});
	
	// initialize
	var instances = models.map(function(Ctor){
		return new Ctor;
	});
	
	// accessors
	instances.forEach(function(x, index){
		var txt = '', arr = letters.slice(0, index + 1);
		arr.forEach(function(letter) {
			txt += x[letter];
		});
		if (txt !== arr.join('')) 
			console.error('Invalid instances: ' + txt + ' at' + index);
	});
}