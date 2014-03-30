/**
 *	AtmJSBuilder:
 *
 *	``` $ npm install -g atma
 *	``` $ atma ```
 **/


module.exports = {
	'add-handlers': {
		action: 'custom',
		script: 'tools/license-handler.js'
	},
	'import': {
		files: 'builds/**',
		output: 'lib/'
	},
	'jshint': {
		files: ['lib/class.js'],
		jshint: JSHint()
	},
	'uglify': {
		files: 'lib/class.js'
	},

	'watch': {
		files: 'src/**',
		actions: [ 'import' ]
	},
	
	'defaults': [
		'add-handlers',
		'import',
		'jshint',
		'uglify'
	]
};




function JSHint() {

	return {
		options: {
			curly: false,
			eqeqeq: true,
			forin: false,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
			expr: true,
			regexp: true,
			undef: true,
			unused: true,
			strict: true,
			trailing: false,

			boss: true,
			eqnull: true,
			es5: true,
			lastsemic: true,
			browser: true,
			node: true,
			onevar: false,
			evil: true,
			sub: true,
			smarttabs: true
		},
		globals: {
			define: true,
			require: true,
			ActiveXObject: true
		}
	};
}
