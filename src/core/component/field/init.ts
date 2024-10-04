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

	from.forEach(([name, init]) => {
		const sourceVal = store[name];

		if (init == null) {
			store[name] = sourceVal;
			return;
		}

		unsafe.$activeField = name;

		init(component, store);

		unsafe.$activeField = undefined;
	});

	return store;
}
