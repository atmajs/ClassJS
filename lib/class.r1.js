;
(function(w) {

	var helper = {
		createClass: function(obj, args) {
			return new(Function.prototype.bind.apply(obj, args));
		},		
		extendPrototype: function(_class, data) {
			if (typeof data !== 'object') return;

			this.extendPrototype = data.__proto__ == null? this.protoLess : this.proto;
			this.extendPrototype(_class, data);
		},
		proto: function(_class, data) {
			var prototype = data,
				proto = data;
			if (data.extends != null) {
				if (typeof data.extends === 'function') {
					prototype.__proto__ = data.extends.prototype;
				} else {
					for (var i = 0; i < data.extends.length; i++) {
						proto = (proto.__proto__ = data.extends[i].prototype);
					}
				}
			}
			_class.prototype = prototype;
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, data) {
			if (this.inherit == null) {
				this.inherit = function(target, source) {
					var tmp = new Function,
						ownproto = target.prototype;
					tmp.prototype = source.prototype;
					target.prototype = new tmp();
					target.constructor = source;
					for (var key in ownproto) {
						target.prototype[key] = ownproto[key];
					}
				}
			}
			_class.prototype = data;
			if (data.extends) {
				if (typeof data.extends === 'function') this.inherit(_class, data.extends);
				else{
					console.error('Only one inheritance is allowed');					
					var pr = _class;
					for (var i = 0; i < data.extends.length; i++) {
						this.inherit(pr, data.extends[i]);
						pr = pr.prototype;
					}
				}
			}
		},
		doNothing: function() {}
	}

	w.Class = function(data) {


		if (data.extends == null) {
			var _class;
			if (data.construct == null) {
				_class = function() {}
			} else {
				_class = data.construct;
				delete data.construct;
			}
			if (typeof data.static === 'object') {
				for (var key in data.static) _class[key] = data.static[key];
				delete data.static;
			}

			_class.prototype = data;
			return _class;

		}
		var _class = function() {
			var construct = this.construct,
				base = data.extends;
			if (base) {
				if (typeof base == 'function') {
					this.construct = base.prototype.construct;
					base.apply(this, arguments);
				} else {
					for (var i = 0; i < base.length; i++) {
						this.construct = base[i].prototype.construct;
						base[i].apply(this, arguments);
					}
				}
			}

			if (construct) {
				var r = construct.apply(this, arguments);
				if (r != null) return r;
			}
			return this;
		}
		if (typeof data.static === 'object') {
			for (var key in data.static) _class[key] = data.static[key];
			/** Chrome: delete property from object, !before setting it to prototype (-200ms on 10000 iterations) */
			delete data.static;
		}
		helper.extendPrototype(_class, data);

		return _class;
	}



})(window);
//
