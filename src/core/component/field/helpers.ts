/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { sortedFields } from 'core/component/field/const';

import type { ComponentField } from 'core/component/interface';
import type { SortedFields } from 'core/component/field/interface';

/**
 * Returns the weight of a specified field from a given scope.
 * This weight describes when a field should initialize relative to other fields within the same scope:
 *
 *   1. When initializing component fields, fields with a weight of zero are initialized first.
 *   2. After all zero-weight fields are initialized, fields with a minimum non-zero weight are initialized, and so on.
 *
 * @param field - the field to calculate the weight
 * @param scope - the scope where is stored the field, like `$fields` or `$systemFields`
 */
export function getFieldWeight(field: CanUndef<ComponentField>, scope: Dictionary<ComponentField>): number {
	if (field == null) {
		return 0;
	}

	const {after} = field;

	let weight = 0;

	if (after != null) {
		weight += after.size;

		after.forEach((name) => {
			const
				dep = scope[name];

			if (dep == null) {
				throw new ReferenceError(`The specified dependency ${dep} could not be found in the given scope`);
			}

			weight += getFieldWeight(dep, scope);
		});
	}

	if (!field.atom) {
		weight += 1e3;
	}

	return weight;
}

/**
 * Sorts the specified fields and returns an array that is ordered and ready for initialization
 * @param fields
 */
export function sortFields(fields: Dictionary<ComponentField>): SortedFields {
	let val = sortedFields.get(fields);

	if (val == null) {
		val = Object.entries(Object.cast<StrictDictionary<ComponentField>>(fields)).sort(([_1, a], [_2, b]) => {
			const
				aWeight = getFieldWeight(a, fields),
				bWeight = getFieldWeight(b, fields);

			return aWeight - bWeight;
		});

		sortedFields.set(fields, val);
	}

	return val;
}
