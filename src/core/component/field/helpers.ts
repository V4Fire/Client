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
 * Returns a weight of the specified field relative to other fields in a scope.
 * The weight describes when a field should initialize relative to other fields.
 * At start are init all fields with a zero weight.
 * After will be init fields with the minimal non-zero weight, etc.
 *
 * @param field - field to calculate the weight
 * @param fields - field scope
 */
export function getFieldWeight(field: CanUndef<ComponentField>, fields: Dictionary<ComponentField>): number {
	if (field == null) {
		return 0;
	}

	const
		{after} = field;

	let
		weight = 0;

	if (after != null) {
		weight += after.size;

		for (let o = after.values(), el = o.next(); !el.done; el = o.next()) {
			const
				dep = fields[el.value];

			if (dep == null) {
				throw new ReferenceError(`The specified dependency "${dep}" is not found in a scope`);
			}

			weight += getFieldWeight(dep, fields);
		}
	}

	if (!field.atom) {
		weight += 1e3;
	}

	return weight;
}

/**
 * Sorts the specified fields and returns an array with ordering is ready to initialize
 * @param fields
 */
export function sortFields(fields: Dictionary<ComponentField>): SortedFields {
	let
		val = sortedFields.get(fields);

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
