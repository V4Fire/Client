/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';
import { PropertyInfo } from 'core/component/reflection/interface';

export const
	bindingRgxp = /(?:Prop|Store)$/,
	propRgxp = /Prop$|^\$props/,
	storeRgxp = /Store$|^\$attrs/,
	hasSeparator = /\./;

/**
 * Returns an information object about the component property by the specified path
 *
 * @param path
 * @param ctx - component context
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
 *     //   type: 'system',
 *     //   accessor: 'foo',
 *     //   accessorType: 'computed'
 *     // }
 *     console.log(getPropertyInfo('$root.$refs.button.foo', this));
 *   }
 * }
 * ```
 */
export function getPropertyInfo(path: string, ctx: ComponentInterface): PropertyInfo {
	let
		name = path,
		fullPath = path,
		chunks,
		rootI;

	if (hasSeparator.test(path)) {
		chunks = path.split('.');
		rootI = 0;

		let
			obj = ctx;

		for (let i = 0; i < chunks.length; i++) {
			if (!obj) {
				break;
			}

			obj = obj[chunks[i]];

			if (obj && obj.instance instanceof ComponentInterface) {
				ctx = obj;
				rootI = i === chunks.length - 1 ? i : i + 1;
			}
		}

		path = chunks.slice(rootI).join('.');
		name = chunks[rootI];
	}

	const
		// @ts-ignore (access)
		{props, fields, systemFields, computedFields, accessors} = ctx.meta;

	if (propRgxp.test(name)) {
		return {
			path,
			fullPath,
			name,
			ctx,
			type: 'prop'
		};
	}

	if (storeRgxp.test(name)) {
		if (fields[name]) {
			return {
				path,
				fullPath,
				name,
				ctx,
				type: 'field'
			};
		}

		return {
			path,
			fullPath,
			name,
			ctx,
			type: 'system'
		};
	}

	if (fields[name]) {
		return {
			path,
			fullPath,
			name,
			ctx,
			type: 'field'
		};
	}

	if (props[name]) {
		return {
			path,
			fullPath,
			name,
			ctx,
			type: 'prop'
		};
	}

	if (systemFields[name]) {
		return {
			path,
			fullPath,
			name,
			ctx,
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
			name,
			ctx,
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
			name,
			ctx,
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
			name: propName,
			ctx,
			type: 'prop',
			accessor,
			accessorType
		};
	}

	return {
		path,
		fullPath,
		name,
		ctx,
		type: computedFields[name] ? 'computed' : accessors[name] ? 'accessor' : 'system'
	};
}
