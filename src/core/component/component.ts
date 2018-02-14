/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { PropOptions, ComponentOptions } from 'vue';
import { ComponentMeta } from 'core/component';

export interface ComponentConstructor<T = any> {
	new(): T;
}

export function getComponent(constructor: ComponentConstructor, meta: ComponentMeta): ComponentOptions<Vue> {
	const
		instance = new constructor(),
		p = meta.params;

	const
		{props, methods} = getBaseComponent(constructor, meta);

	return <any>{
		...p.mixins,

		props,
		methods,
		computed: meta.computed,
		provide: p.provide,
		inject: p.inject,

		data(): Dictionary {
			const
				data = {},
				fields = meta.fields,
				keys = Object.keys(fields);

			for (let i = 0; i < keys.length; i++) {
				const
					key = this._activeField = keys[i],
					el = fields[key];

				let val;
				if (el.init) {
					val = el.init(this, instance);
				}

				data[key] = val === undefined ? el.default : val;
			}

			return data;
		},

		beforeCreate(): void {
			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				Object.defineProperty(this, keys[i], {
					get: el.get,
					set: el.set
				});
			}
		},

		created(): void {
		}
	};
}

/**
 * Returns a base component object from the specified constructor
 *
 * @param constructor
 * @param meta
 */
function getBaseComponent(constructor: ComponentConstructor, meta: ComponentMeta): {
	props: PropOptions;
	methods: Dictionary<Function>;
} {
	const
		instance = new constructor(),
		props = {},
		methods = {};

	for (let o = meta.props, keys = Object.keys(meta.props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		props[key] = {
			type: el.type,
			required: el.required,
			validator: el.validator,
			default: instance[key]
		};
	}

	for (let o = meta.methods, keys = Object.keys(meta.methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			method = o[key];

		methods[key] = method.fn;
	}

	return {props, methods};
}
