/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools/deprecation';
import { ComponentInterface } from 'core/component/interface';
import { propRgxp, attrRgxp, storeRgxp, hasSeparator } from 'core/component/reflection/const';
import { PropertyInfo } from 'core/component/reflection/interface';

/**
 * Returns an information object about the component property by the specified path
 *
 * @param path
 * @param component - component instance
 *
 * @example
 * ```js
 * @component()
 * class bButton {
 *   @system()
 *   fooStore = 'bla';
 *
 *   get foo() {
 *     return this.fooStore;
 *   }
 *
 *   created() {
 *     // {
 *     //   name: 'fooStore',
 *     //   path: 'fooStore',
 *     //   fullPath: '$root.$refs.button.fooStore',
 *     //   originalPath: '$root.$refs.button.foo',
 *     //   type: 'system',
 *     //   accessor: 'foo',
 *     //   accessorType: 'computed'
 *     // }
 *     console.log(getPropertyInfo('$root.$refs.button.foo', this));
 *   }
 * }
 * ```
 */
export function getPropertyInfo(path: string, component: ComponentInterface): PropertyInfo {
	const
		originalPath = path;

	let
		name = path,
		fullPath = path,
		chunks,
		rootI;

	if (hasSeparator.test(path)) {
		chunks = path.split('.');
		rootI = 0;

		let
			obj = component;

		for (let i = 0; i < chunks.length; i++) {
			if (!obj) {
				break;
			}

			obj = obj[chunks[i]];

			if (obj?.instance instanceof ComponentInterface) {
				component = obj;
				rootI = i === chunks.length - 1 ? i : i + 1;
			}
		}

		path = chunks.slice(rootI).join('.');
		name = chunks[rootI];
	}

	const
		{props, fields, systemFields, computedFields, accessors, params: {deprecatedProps}} = component.unsafe.meta;

	const
		alternative = deprecatedProps?.[name];

	if (alternative) {
		deprecate({type: 'property', name, renamedTo: alternative});
		name = alternative;

		if (chunks) {
			chunks[rootI] = name;
			path = chunks.slice(chunks).join('.');
			fullPath = chunks.join('.');

		} else {
			path = fullPath = name;
		}
	}

	if (propRgxp.test(name)) {
		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'prop'
		};
	}

	if (attrRgxp.test(name)) {
		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'attr'
		};
	}

	if (storeRgxp.test(name)) {
		if (fields[name]) {
			return {
				path,
				fullPath,
				originalPath,
				name,
				ctx: component,
				type: 'field'
			};
		}

		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'system'
		};
	}

	if (fields[name]) {
		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'field'
		};
	}

	if (props[name]) {
		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'prop'
		};
	}

	if (systemFields[name]) {
		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'system'
		};
	}

	const
		storeName = `${name}Store`,
		accessorType = computedFields[name] ? 'computed' : accessors[name] ? 'accessor' : undefined,
		accessor = accessorType && name;

	if (fields[storeName]) {
		name = storeName;

		if (chunks) {
			chunks[rootI] = storeName;
			path = chunks.slice(chunks).join('.');
			fullPath = chunks.join('.');

		} else {
			path = fullPath = storeName;
		}

		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			accessor,
			accessorType,
			type: 'field'
		};
	}

	if (systemFields[storeName]) {
		name = storeName;

		if (chunks) {
			chunks[rootI] = storeName;
			path = chunks.slice(chunks).join('.');
			fullPath = chunks.join('.');

		} else {
			path = fullPath = storeName;
		}

		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			accessor,
			accessorType,
			type: 'system'
		};
	}

	const
		propName = `${name}Prop`;

	if (props[propName]) {
		name = propName;

		if (chunks) {
			chunks[rootI] = propName;
			path = chunks.slice(chunks).join('.');
			fullPath = chunks.join('.');

		} else {
			path = fullPath = storeName;
		}

		return {
			path,
			fullPath,
			originalPath,
			name,
			ctx: component,
			type: 'prop',
			accessor,
			accessorType
		};
	}

	return {
		path,
		fullPath,
		originalPath,
		name,
		ctx: component,
		type: computedFields[name] ? 'computed' : accessors[name] ? 'accessor' : 'system'
	};
}
