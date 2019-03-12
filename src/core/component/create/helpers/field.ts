/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PropOptions } from 'core/component/engines';
import { ComponentField, SystemField } from 'core/component/interface';
import { defaultWrapper, NULL } from 'core/component/create/helpers/const';

/**
 * Initializes the specified fields to a data object and returns it
 *
 * @param fields
 * @param ctx - component context
 * @param instance - component class instance
 * @param [data] - data object
 */
export function initDataObject(
	fields: Dictionary<ComponentField>,
	ctx: Dictionary,
	instance: Dictionary,
	data: Dictionary = {}
): Dictionary {
	const
		queue = new Set(),
		atomQueue = new Set();

	const
		fieldList = <string[]>[];

	// Sorting atoms
	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = <NonNullable<SystemField>>fields[key];

		if (el.atom || !el.init && (el.default !== undefined || key in instance)) {
			fieldList.unshift(key);

		} else {
			fieldList.push(key);
		}
	}

	while (true) {
		for (let i = 0; i < fieldList.length; i++) {
			const
				key = fieldList[i],
				isNull = data[key] === NULL;

			if (key in data && !isNull) {
				continue;
			}

			const
				el = <NonNullable<SystemField>>fields[key];

			if (!el) {
				continue;
			}

			let
				canInit = el.atom || atomQueue.size === 0;

			if (el.after.size) {
				for (let o = el.after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (!waitField) {
						throw new ReferenceError(`Field "${waitFieldKey}" is not defined`);
					}

					if (el.atom && !waitField.atom) {
						throw new Error(`Atom field "${key}" can't wait the non atom field "${waitFieldKey}"`);
					}

					if (!(waitFieldKey in data) || data[waitFieldKey] === NULL) {
						queue.add(key);

						if (el.atom) {
							atomQueue.add(key);
						}

						canInit = false;
						break;
					}
				}
			}

			if (canInit) {
				if (isNull) {
					data[key] = undefined;
				}

				ctx.$activeField = key;
				queue.delete(key);
				atomQueue.delete(key);

				let
					val;

				if (el.init) {
					val = el.init(<any>ctx, data);
				}

				if (val === undefined) {
					if (data[key] === undefined) {
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						data[key] = val;
					}

				} else {
					data[key] = val;
				}
			}
		}

		if (!atomQueue.size && !queue.size) {
			break;
		}
	}

	return data;
}

/**
 * Initializes props to the specified data object and returns it
 *
 * @param fields
 * @param ctx - component context
 * @param instance - component class instance
 * @param [data] - data object
 * @param [forceInit] - if true, then prop values will be force initialize
 */
export function initPropsObject(
	fields: Dictionary<PropOptions>,
	ctx: Dictionary,
	instance: Dictionary,
	data: Dictionary = {},
	forceInit?: boolean
): Dictionary {
	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = ctx.$activeField = keys[i],
			el = fields[key];

		if (!el) {
			continue;
		}

		let
			val = ctx[key];

		if (val === undefined) {
			val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
		}

		if (Object.isFunction(val)) {
			if (forceInit || !val[defaultWrapper]) {
				data[key] = el.type === Function ? val.bind(ctx) : val.call(ctx);
			}

		} else if (forceInit) {
			data[key] = val;
		}
	}

	return data;
}
