/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';

export const supports = {
	functional: true,
	composite: true
};

export const minimalCtx = (() => {
	const
		obj = Vue.prototype,
		ctx = {};

	for (const key in obj) {
		if (key.length === 2) {
			ctx[key] = obj[key];
		}
	}

	return ctx;
})();

export const proxyGetters = Object.createDict({
	prop: (ctx) => ({
		key: '_props',

		get value(): typeof ctx._props {
			return ctx._props;
		},

		watch: (path, handler) => ctx.$vueWatch(path, (val, oldVal) => {
			if (val !== oldVal) {
				handler(val, oldVal);
			}
		})
	}),

	attr: (ctx) => ({
		key: '$attrs',

		get value(): typeof ctx.$attrs {
			return ctx.$attrs;
		},

		watch: (path, handler) => ctx.$vueWatch(path, (val, oldVal) => {
			if (val !== oldVal) {
				handler(val, oldVal);
			}
		})
	}),

	field: (ctx) => ({
		key: '$fields',
		get value(): typeof ctx.$fields {
			return ctx.$fields;
		}
	}),

	system: (ctx) => ({
		key: '$systemFields',
		get value(): typeof ctx.$systemFields {
			return ctx.$systemFields;
		}
	}),

	mounted: (ctx) => ({
		key: null,
		get value(): typeof ctx {
			return ctx;
		}
	})
});
