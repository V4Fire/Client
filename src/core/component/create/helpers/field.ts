/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface, PropOptions, ComponentField, SystemField } from 'core/component/interface';
import { defaultWrapper, NULL } from 'core/component/create/helpers/const';

export interface FieldRealInfo {
	name: string;
	type: 'prop' | 'field' | 'system' | 'computed' | 'accessor';
}

const
	propRgxp = /Prop$/,
	storeRgxp = /Store$/;

/**
 * Returns an object with real component field info
 *
 * @param component
 * @param name
 */
export function getFieldRealInfo(component: ComponentInterface, name: string): FieldRealInfo {
	const
		// @ts-ignore (access)
		{props, fields, systemFields, computed, accessors} = component.meta;

	if (propRgxp.test(name)) {
		return {
			name,
			type: 'prop'
		};
	}

	if (storeRgxp.test(name)) {
		if (fields[name]) {
			return {
				name,
				type: 'field'
			};
		}

		return {
			name,
			type: 'system'
		};
	}

	if (fields[name]) {
		return {
			name,
			type: 'field'
		};
	}

	if (props[name]) {
		return {
			name,
			type: 'prop'
		};
	}

	if (systemFields[name]) {
		return {
			name,
			type: 'system'
		};
	}

	const
		storeName = `${name}Store`;

	if (fields[storeName]) {
		return {
			name: storeName,
			type: 'field'
		};
	}

	if (systemFields[storeName]) {
		return {
			name: storeName,
			type: 'system'
		};
	}

	const
		propName = `${name}Prop`;

	if (props[propName]) {
		return {
			name: propName,
			type: 'prop'
		};
	}

	return {
		name,
		type: computed[name] ? 'computed' : accessors[name] ? 'accessor' : 'system'
	};
}

/**
 * Initializes the specified fields to a data object and returns it
 * (very critical for loading time)
 *
 * @param fields
 * @param ctx - component context
 * @param instance - component class instance
 * @param [data] - data object
 */
// tslint:disable-next-line:cyclomatic-complexity
export function initDataObject(
	fields: Dictionary<ComponentField>,
	ctx: ComponentInterface,
	instance: Dictionary,
	data: Dictionary = {}
): Dictionary {
	const
		// @ts-ignore (access)
		isFlyweight = ctx.$isFlyweight || ctx.meta.params.functional === true;

	const
		queue = new Set(),
		skipped = {};

	const
		atomList = <string[]>[],
		fieldList = <string[]>[];

	// Sorting atoms
	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = <NonNullable<SystemField>>fields[key];

		if (isFlyweight && el.functional === false) {
			skipped[key] = true;
			continue;
		}

		if (el.atom || !el.init && (el.default !== undefined || key in instance)) {
			if (el.after.size) {
				atomList.push(key);

			} else {
				if (data[key] === NULL) {
					data[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;

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

		} else {
			fieldList.push(key);
		}
	}

	while (true) {
		for (let i = 0; i < atomList.length; i++) {
			const
				key = atomList[i];

			if (!key) {
				continue;
			}

			const
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
				canInit = true;

			if (el.after.size) {
				for (let o = el.after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (skipped[waitFieldKey]) {
						continue;
					}

					if (!waitField) {
						throw new ReferenceError(`Field "${waitFieldKey}" is not defined`);
					}

					if (!waitField.atom) {
						throw new Error(`Atom field "${key}" can't wait the non atom field "${waitFieldKey}"`);
					}

					if (!(waitFieldKey in data) || data[waitFieldKey] === NULL) {
						queue.add(key);
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
					data[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;
				queue.delete(key);

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

		if (!queue.size) {
			break;
		}
	}

	while (true) {
		for (let i = 0; i < fieldList.length; i++) {
			const
				key = fieldList[i];

			if (!key) {
				continue;
			}

			const
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
				canInit = true;

			if (el.after.size) {
				for (let o = el.after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (skipped[waitFieldKey]) {
						continue;
					}

					if (!waitField) {
						throw new ReferenceError(`Field "${waitFieldKey}" is not defined`);
					}

					if (!(waitFieldKey in data) || data[waitFieldKey] === NULL) {
						queue.add(key);
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
					data[key] = undefined;
				}

				// @ts-ignore (access)
				ctx.$activeField = key;
				queue.delete(key);

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

		if (!queue.size) {
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
	ctx: ComponentInterface,
	instance: Dictionary,
	data: Dictionary = {},
	forceInit?: boolean
): Dictionary {
	const
		// @ts-ignore (access)
		isFlyweight = ctx.$isFlyweight || ctx.meta.params.functional === true;

	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			// @ts-ignore (access)
			key = ctx.$activeField = keys[i],
			el = fields[key];

		if (!el || isFlyweight && el.functional === false) {
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
