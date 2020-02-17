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

// Queue for fields to initialize
const fieldQueue = new Set();

/**
 * Initializes the specified fields to a component context.
 * The function returns an object with initialized fields.
 *
 * This method have some "copy-paste" chunks, but it's done for better performance, because it's very hot function.
 * Mind that the initialization of fields is a synchronous operation.
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
		// True if a component is functional or flyweight (composite)
		isFlyweight = ctx.$isFlyweight || params.functional === true;

	const
		// Map of fields that we should skip, i.e. not to initialize.
		// For instance, some properties isn't initialized if a component is functional.
		fieldsToSkip = Object.createDict(),

		// List of atomics to initialize
		atomList = <string[]>[],

		// List of non-atomics fields to initialize
		fieldList = <string[]>[];

	// At first we should initialize all atomic fields, but some atomics wait another atomics.
	// That's why we sort list of fields and organize simple synchronous queue.
	// All atomics that waits another atomics is added to atomList.
	// All non-atomics fields is added to fieldList.
	for (let keys = Object.keys(fields).sort(), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = <ComponentSystemField>fields[key];

		// Don't initialize a property for a functional component
		// unless explicitly required (functional == false)
		if (isFlyweight && el.functional === false) {
			fieldsToSkip[key] = true;
			continue;
		}

		// If a field is atomic, or if the field doesn't have an initializer:
		// if the field doesn't have the initializer it guarantee doesn't have any dependencies
		if (el.atom || !el.init && (el.default !== undefined || key in instance)) {
			// If true, then the field doesn't have any dependencies and can be initialized right now
			let canInit = true;

			// Set of dependencies to wait
			const {after} = el;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value;

					if (fieldsToSkip[waitFieldKey]) {
						continue;
					}

					// Check that the dependency is not already initialized.
					// NULL is a special value to prevent undefined behaviour
					// when a property already initialized with an undefined value.
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
						// We need to clone default value from a constructor
						// to prevent linking to the same object for a non-primitive value
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

	// Initialize all atomics that have some dependencies
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

			// If true, then all dependencies of the fields is already initialized an we can initialize this field
			let canInit = true;

			// Set of dependencies to wait
			const {after} = el;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (fieldsToSkip[waitFieldKey]) {
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

		// All atomics are initialized
		if (!fieldQueue.size) {
			break;
		}
	}

	// Initialize all non-atomics
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

			// If true, then all dependencies of the fields is already initialized an we can initialize this field
			let canInit = true;

			// Set of dependencies to wait
			const {after} = el;

			if (after && after.size) {
				for (let o = after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (fieldsToSkip[waitFieldKey]) {
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

		// All fields are initialized
		if (!fieldQueue.size) {
			break;
		}
	}

	return store;
}
