/**
 *	var route = new Route('/user/:id');
 *
 *	route.create({id:5}) // -> '/user/5'
 */
var Route = (function(){
	
	
	function Route(route){
		this.route = route_parse(route);
	};
	
	Route.prototype = {
		constructor: Route,
		create: function(object){
			var path, query;
			
			path = route_interpolate(this.route.path, object, '/');
			if (path == null) {
				return null;
			}
			
			if (this.route.query) {
				query = route_interpolate(this.route.query, object, '&');
				if (query == null) {
					return null;
				}
			}
			
			return path + (query ? '?' + query : '');
		}
	};
	
	var regexp_pathByColon = /^([^:\?]*)(\??):(\??)([\w]+)$/,
		regexp_pathByBraces = /^([^\{\?]*)(\{(\??)([\w]+)\})?([^\s]*)?$/;
	
	function parse_single(string) {
		var match = regexp_pathByColon.exec(string),
			optional,
			parts;
		
		if (match) {
			return {
				optional: (match[2] || match[3]) === '?',
				parts: [match[1], match[4]]
			};
		}
		
		match = regexp_pathByBraces.exec(string);
		
		if (match) {
			return {
				optional: match[3] === '?',
				parts: [match[1], match[4], match[5]]
			};
		}
		
		console.error('Paths breadcrumbs should be match by regexps');
		return { parts: [string] };
	}
	
	function parse_path(path, delimiter) {
		var parts = path.split(delimiter),
			key, value;
		
		for (var i = 0, imax = parts.length; i < imax; i++){
			parts[i] = parse_single(parts[i]);
		}
		
		return parts;
	}
	
	function route_parse(route) {
		var question = /[^\:\{]\?[^:]/.exec(route),
			query = null;
		
		if (question){
			question = question.index + 1;
			query = route.substring(question + 1);
			route = route.substring(0, question);
		}
		
		
		return {
			path: parse_path(route, '/'),
			query: query == null ? null : parse_path(query, '&')
		};
	}
	
	/** - route - [] */
	function route_interpolate(breadcrumbs, object, delimiter) {
		var route = [],
			value,
			key,
			parts;
		
		
		for (var i = 0, imax = breadcrumbs.length; i < imax; i++){
			x = breadcrumbs[i];
			parts = x.parts.slice(0);
			
			if (parts[1] == null) {
				// is not an interpolated breadcrumb
				route.push(parts[0]);
				continue;
			}
			
			key = parts[1];
			parts[1] = object[key];
			
			if (parts[1] == null){
			
				if (!x.optional) {
					console.error('Object has no value, for not optional part - ', key);
					return null;
				}
				
				continue;
			}
			
			route.push(parts.join(''));
		}
		
		return route.join(delimiter);
	}
	
	
	return Route;
}());