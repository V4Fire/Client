/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';
import type { ComponentInterface } from 'core/component/interface';

/**
 * Initializes all fields of a given component instance.
 * This function returns a dictionary containing the names of the initialized fields as keys,
 * with their corresponding initialized values as values.
 *
 * @param from - the dictionary where is stored the passed component fields, like `$fields` or `$systemFields`
 * @param component - the component instance
 * @param [store] - the store for initialized fields
 */
export function initFields(
	from: ComponentMeta['fieldInitializers'],
	component: ComponentInterface,
	store: Dictionary = {}
): Dictionary {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	for (let i = 0; i < from.length; i++) {
		const [name, field] = from[i];

		const sourceVal = store[name];

		if (sourceVal !== undefined || field?.init == null) {
			store[name] = sourceVal;
			continue;
		}

		unsafe.$activeField = name;

		store[name] = field.init(unsafe, store);

		unsafe.$activeField = undefined;
	}

	return store;
}
