/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import type { UnsafeComponentInterface, ProxyGetters } from 'core/component/interface';

export const supports = {
	regular: true,
	functional: true,
	composite: true,

	ssr: false,
	boundCreateElement: true
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

type VueProxyGetters = ProxyGetters<UnsafeComponentInterface & {
	$vueWatch: Function;
	_props: Dictionary;
}>;

export const proxyGetters = Object.createDict<VueProxyGetters>({
	prop: (ctx) => ({
		key: '_props',

		get value(): Dictionary {
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
