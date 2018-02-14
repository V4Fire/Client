/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { ComponentOptions } from 'vue';
import { ComponentMeta } from 'core/component';

export interface ComponentConstructor<T = any> {
	new(): T;
}

export function getComponent(constructor: ComponentConstructor, meta: ComponentMeta): ComponentOptions<Vue> {
	const
		{component, instance} = getBaseComponent(constructor, meta),
		p = meta.params;

	return <any>{
		...p.mixins,
		...component,

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

				// tslint:disable-next-line
				if (val === undefined) {
					data[key] = el.default !== undefined ? el.default : Object.fastClone(instance[key]);

				} else {
					data[key] = val;
				}
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
function getBaseComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): {component: ComponentMeta['component']; instance: Dictionary} {
	const
		{component} = meta,
		instance = new constructor();

	for (let o = meta.props, keys = Object.keys(meta.props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		component.props[key] = {
			type: el.type,
			required: el.required,
			validator: el.validator,
			default: el.default !== undefined ? el.default : Object.fastClone(instance[key])
		};
	}

	return {component, instance};
}
