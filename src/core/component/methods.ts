/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentMeta } from 'core/component';

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
export default function addMethodsToMeta<T>(constructor: Function, meta: ComponentMeta): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		if ('value' in desc) {
			// tslint:disable-next-line
			meta.methods[key] = Object.assign(meta.methods[key] || {}, {
				fn: desc.value
			});

		} else {
			const
				o = meta[key in meta.accessors ? 'accessors' : 'computed'],
				old = o[key],
				set = desc.set || old && old.set;

			if (set) {
				meta.methods[`${key}Setter`] = {fn: set};
			}

			Object.assign(meta[key in meta.accessors ? 'accessors' : 'computed'], {
				[key]: {
					get: desc.get || old && old.get,
					set
				}
			});
		}
	}
}
