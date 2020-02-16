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

import { NULL } from 'core/component/const';
import { ComponentInterface, ComponentField, ComponentSystemField } from 'core/component/interface';

const
	fieldQueue = new Set();

/**
 * Initializes the specified fields to a component context.
 * The method returns an object with initialized fields.
 *
 * @param fields - component fields or system fields
 * @param ctx - component context
 * @param [store] - storage object for initialized fields
 */
// tslint:disable-next-line:cyclomatic-complexity
export function initFields(
	fields: Dictionary<ComponentField>,
	ctx: ComponentInterface,
	store: Dictionary = {}
): Dictionary {
	const
		// @ts-ignore (access)
		{meta: {params, instance}} = ctx;

	const
		isFlyweight = ctx.$isFlyweight || params.functional === true;

	const
		skipped = {},
		atomList = <string[]>[],
		fieldList = <string[]>[];

	// Sorting atoms
	for (let keys = Object.keys(fields).sort(), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = <ComponentSystemField>fields[key];

		if (isFlyweight && el.functional === false) {
			skipped[key] = true;
			continue;
		}

		if (el.atom || !el.init && (el.default !== undefined || key in instance)) {
			let
				canInit = true;

			const
				{after} = el;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value;

					if (skipped[waitFieldKey]) {
						continue;
					}

					if (!(waitFieldKey in store) || store[waitFieldKey] === NULL) {
						atomList.push(key);
						canInit = false;
						break;
					}
				}
			}

			if (canInit) {
				if (store[key] === NULL) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;

				let
					val;

				if (el.init) {
					val = el.init(<any>ctx, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				ctx.$activeField = undefined;
			}

		} else {
			fieldList.push(key);
		}
	}

	while (atomList.length) {
		for (let i = 0; i < atomList.length; i++) {
			const
				key = atomList[i];

			if (!key) {
				continue;
			}

			const
				isNull = store[key] === NULL;

			if (key in store && !isNull) {
				continue;
			}

			const
				el = <Nullable<ComponentSystemField>>fields[key];

			if (!el) {
				continue;
			}

			const
				{after} = el;

			let
				canInit = true;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (skipped[waitFieldKey]) {
						continue;
					}

					if (!waitField) {
						throw new ReferenceError(`The field "${waitFieldKey}" is not defined`);
					}

					if (!waitField.atom) {
						throw new Error(`The atom field "${key}" can't wait the non atom field "${waitFieldKey}"`);
					}

					if (!(waitFieldKey in store) || store[waitFieldKey] === NULL) {
						fieldQueue.add(key);
						canInit = false;
						break;
					}
				}

				if (canInit) {
					atomList[i] = '';
				}
			}

			if (canInit) {
				if (isNull) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;
				fieldQueue.delete(key);

				let
					val;

				if (el.init) {
					val = el.init(<any>ctx, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				ctx.$activeField = undefined;
			}
		}

		if (!fieldQueue.size) {
			break;
		}
	}

	while (fieldList.length) {
		for (let i = 0; i < fieldList.length; i++) {
			const
				key = fieldList[i];

			if (!key) {
				continue;
			}

			const
				isNull = store[key] === NULL;

			if (key in store && !isNull) {
				continue;
			}

			const
				el = <Nullable<ComponentSystemField>>fields[key];

			if (!el) {
				continue;
			}

			const
				{after} = el;

			let
				canInit = true;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (skipped[waitFieldKey]) {
						continue;
					}

					if (!waitField) {
						throw new ReferenceError(`The field "${waitFieldKey}" is not defined`);
					}

					if (!(waitFieldKey in store) || store[waitFieldKey] === NULL) {
						fieldQueue.add(key);
						canInit = false;
						break;
					}
				}

				if (canInit) {
					fieldList[i] = '';
				}
			}

			if (canInit) {
				if (isNull) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;
				fieldQueue.delete(key);

				let
					val;

				if (el.init) {
					val = el.init(<any>ctx, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				ctx.$activeField = undefined;
			}
		}

		if (!fieldQueue.size) {
			break;
		}
	}

	return store;
}
