/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/field/README.md]]
 * @packageDocumentation
 */

import { sortFields } from 'core/component/field/helpers';
import type { ComponentInterface, ComponentField } from 'core/component/interface';

export * from 'core/component/field/interface';

/**
 * Initializes the specified fields of a component instance.
 * The function returns a dictionary with the initialized fields.
 *
 * @param fields - fields scope to initialize
 * @param component - component instance
 * @param [store] - store for initialized fields
 */
export function initFields(
	fields: Dictionary<ComponentField>,
	component: ComponentInterface,
	store: Dictionary = {}
): Dictionary {
	const unsafe = Object.cast<Writable<ComponentInterface['unsafe']>>(
		component
	);

	const
		{params, instance} = unsafe.meta;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isFunctional = params.functional === true;

	for (let sortedFields = sortFields(fields), i = 0; i < sortedFields.length; i++) {
		const
			[key, field] = sortedFields[i];

		const
			sourceVal = store[key];

		const dontNeedInit =
			field == null ||
			sourceVal !== undefined ||

			// Don't initialize a property for the functional component unless explicitly required
			!ssrMode && isFunctional && field.functional === false ||

			field.init == null && field.default === undefined && instance[key] === undefined;

		if (field == null || dontNeedInit) {
			store[key] = sourceVal;
			continue;
		}

		unsafe.$activeField = key;

		let
			val;

		if (field.init != null) {
			val = field.init(component.unsafe, store);
		}

		if (val === undefined) {
			if (store[key] === undefined) {
				// We need to clone the default value from a constructor
				// to prevent linking to the same type component for a non-primitive value
				val = field.default !== undefined ? field.default : Object.fastClone(instance[key]);
				store[key] = val;
			}

		} else {
			store[key] = val;
		}

		unsafe.$activeField = undefined;
	}

	return store;
}
