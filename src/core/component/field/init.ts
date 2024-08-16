/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { sortFields } from 'core/component/field/helpers';
import type { ComponentInterface, ComponentField } from 'core/component/interface';

/**
 * Initializes all fields of a given component instance.
 * This function returns A dictionary containing the names of the initialized fields as keys,
 * with their corresponding initialized values as values.
 *
 * @param from - the dictionary where is stored the passed component fields, like `$fields` or `$systemFields`
 * @param component - the component instance
 * @param [store] - the store for initialized fields
 */
export function initFields(
	from: Dictionary<ComponentField>,
	component: ComponentInterface,
	store: Dictionary = {}
): Dictionary {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	const {
		params,
		instance
	} = unsafe.meta;

	const isFunctional = params.functional === true;

	sortFields(from).forEach(([name, field]) => {
		const sourceVal = store[name];

		const canSkip =
			field == null || sourceVal !== undefined ||
			!SSR && isFunctional && field.functional === false ||
			field.init == null && field.default === undefined && instance[name] === undefined;

		if (field == null || canSkip) {
			store[name] = sourceVal;
			return;
		}

		unsafe.$activeField = name;

		let
			val: unknown;

		if (field.init != null) {
			val = field.init(component.unsafe, store);
		}

		if (val === undefined) {
			if (store[name] === undefined) {
				// To prevent linking to the same type of component for non-primitive values,
				// it's important to clone the default value from the component constructor.
				val = field.default !== undefined ? field.default : Object.fastClone(instance[name]);
				store[name] = val;
			}

		} else {
			store[name] = val;
		}
	});

	return store;
}
