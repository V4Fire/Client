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

import { defProp } from 'core/const/props';
import { fieldQueue } from 'core/component/field/const';
import type { ComponentInterface, ComponentField } from 'core/component/interface';

export * from 'core/component/field/const';

/**
 * Initializes the specified fields to a component instance.
 * The function returns an object with initialized fields.
 *
 * This method has some "copy-paste" chunks, but it's done for better performance, because it's a very "hot" function.
 * Mind that the initialization of fields is a synchronous operation.
 *
 * @param fields - component fields or system fields
 * @param component - component instance
 * @param [store] - storage object for initialized fields
 */
// eslint-disable-next-line complexity
export function initFields(
	fields: Dictionary<ComponentField>,
	component: ComponentInterface,
	store: Dictionary = {}
): Dictionary {
	const {
		unsafe,
		unsafe: {meta: {componentName, params, instance}},
		isFlyweight
	} = component;

	const
		// True if a component is functional or a flyweight
		isNotRegular = params.functional === true || isFlyweight;

	const
		// Map of fields that we should skip, i.e., not to initialize.
		// For instance, some properties don't initialize if a component is a functional.
		canSkip = Object.createDict(),

		// List of atoms to initialize
		atomList = <Array<Nullable<string>>>[],

		// List of non-atoms to initialize
		nonAtomList = <Array<Nullable<string>>>[];

	const
		NULL = {};

	const defField = {
		...defProp,
		value: NULL
	};

	// At first, we should initialize all atoms, but some atoms wait for other atoms.
	// That's why we sort the source list of fields and organize a simple synchronous queue.
	// All atoms that waits for other atoms are added to `atomList`.
	// All non-atoms are added to `nonAtomList`.
	for (let keys = Object.keys(fields).sort(), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = fields[key];

		let
			sourceVal = store[key],
			isNull = false;

		if (isFlyweight) {
			if (
				el != null && (
					el.replace !== true && (Object.isTruly(el.unique) || el.src === componentName) ||
					el.replace === false
				)
			) {
				Object.defineProperty(store, key, defField);
				sourceVal = undefined;
				isNull = true;
			}
		}

		const dontNeedInit =
			el == null ||
			sourceVal !== undefined ||

			// Don't initialize a property for a functional component unless explicitly required
			isNotRegular && el.functional === false ||

			el.init == null && el.default === undefined && instance[key] === undefined;

		if (el == null || dontNeedInit) {
			canSkip[key] = true;
			store[key] = sourceVal;
			continue;
		}

		if (el.atom) {
			// If true, then the field doesn't have any dependencies and can be initialized right now
			let canInit = true;

			const
				{after} = el;

			if (after && after.size > 0) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitKey = val.value;

					if (canSkip[waitKey] === true) {
						continue;
					}

					// Check the dependency is not already initialized
					if (!(waitKey in store)) {
						atomList.push(key);
						canInit = false;
						break;
					}
				}
			}

			if (canInit) {
				if (isNull) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = key;

				let
					val;

				if (el.init != null) {
					val = el.init(unsafe, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						// We need to clone the default value from a constructor
						// to prevent linking to the same object for a non-primitive value
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = undefined;
			}

		} else {
			nonAtomList.push(key);
		}
	}

	// Initialize all atoms that have some dependencies
	while (atomList.length > 0) {
		for (let i = 0; i < atomList.length; i++) {
			const
				key = nonAtomList[i],
				el = key != null ? fields[key] : null;

			let
				isNull = false;

			if (el == null || key == null || key in store && !(isNull = store[key] === NULL)) {
				continue;
			}

			// If true, then the field doesn't have any dependencies and can be initialized right now
			let canInit = true;

			const
				{after} = el;

			if (after && after.size > 0) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitKey = val.value,
						waitFor = fields[waitKey];

					if (canSkip[waitKey] === true) {
						continue;
					}

					if (!waitFor) {
						throw new ReferenceError(`The field "${waitKey}" is not defined`);
					}

					if (!waitFor.atom) {
						throw new Error(`The atom field "${key}" can't wait the non atom field "${waitKey}"`);
					}

					if (!(waitKey in store)) {
						fieldQueue.add(key);
						canInit = false;
						break;
					}
				}

				if (canInit) {
					atomList[i] = null;
				}
			}

			if (canInit) {
				if (isNull) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = key;
				fieldQueue.delete(key);

				let
					val;

				if (el.init != null) {
					val = el.init(unsafe, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						// We need to clone the default value from a constructor
						// to prevent linking to the same object for a non-primitive value
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = undefined;
			}
		}

		// All atoms are initialized
		if (fieldQueue.size === 0) {
			break;
		}
	}

	// Initialize all non-atoms
	while (nonAtomList.length > 0) {
		for (let i = 0; i < nonAtomList.length; i++) {
			const
				key = nonAtomList[i],
				el = key != null ? fields[key] : null;

			let
				isNull = false;

			if (el == null || key == null || key in store && !(isNull = store[key] === NULL)) {
				continue;
			}

			// If true, then the field doesn't have any dependencies and can be initialized right now
			let canInit = true;

			const
				{after} = el;

			if (after && after.size > 0) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitKey = val.value,
						waitFor = fields[waitKey];

					if (canSkip[waitKey] === true) {
						continue;
					}

					if (!waitFor) {
						throw new ReferenceError(`The field "${waitKey}" is not defined`);
					}

					if (!(waitKey in store)) {
						fieldQueue.add(key);
						canInit = false;
						break;
					}
				}

				if (canInit) {
					nonAtomList[i] = null;
				}
			}

			if (canInit) {
				if (isNull) {
					store[key] = undefined;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = key;
				fieldQueue.delete(key);

				let
					val;

				if (el.init != null) {
					val = el.init(unsafe, store);
				}

				if (val === undefined) {
					if (store[key] === undefined) {
						// We need to clone the default value from a constructor
						// to prevent linking to the same object for a non-primitive value
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						store[key] = val;
					}

				} else {
					store[key] = val;
				}

				// @ts-ignore (access)
				unsafe['$activeField'] = undefined;
			}
		}

		// All fields are initialized
		if (fieldQueue.size === 0) {
			break;
		}
	}

	return store;
}
