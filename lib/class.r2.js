;
(function(w) {

	var helper = {
		isArray: function(arr) {
			return arr != null && arr.splice != null;
		},
		each: function(arr, fn) {
			if (this.isArray(arr)) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) return;
			switch (typeof x) {
			case 'function':
				prototype = x.prototype;
				break;
			case 'object':
				prototype = x;
				break;
			default:
				return;
			}
			for (var key in prototype) {
				proto[key] = prototype[key];
			}
		},

		extendClass: function(_class, data) {
			if (typeof data !== 'object') return;

			this.extendPrototype = data.__proto__ == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, data);
		},
		proto: function(_class, data) {
			var prototype = data,
				proto = data;
			if (data.extends != null) {
				proto.__proto__ = {};
				helper.each(data.extends, function(x) {
					helper.extendProto(proto.__proto__, x);
				});
				proto = proto.__proto__;
			}
			if (data.base != null) {
				proto.__proto__ = data.base.prototype;
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

			if (data.base != null) {
				var proto = {};
				var tmp = new Function;
				tmp.prototype = data.base.prototype;
				_class.prototype = new tmp();
				_class.constructor = source;
			}
			
			if (data.extends != null) {				
				helper.each(data.extends, function(x){
					helper.extendProto(_class.prototype, x);
				});				
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
			for (var key in data.static) _class[key] = data.static[key]; /** Chrome: delete property from object, !before setting it to prototype (-200ms on 10000 iterations) */
			delete data.static;
		}
		helper.extendClass(_class, data);

		return _class;
	}



})(window);
//