/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const supports = {
	regular: true,
	functional: !SSR
};

export const proxyGetters = Object.createDict({
	prop: (ctx) => ({
		key: '$props',

		get value(): typeof ctx.$props {
			return ctx.$props;
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
