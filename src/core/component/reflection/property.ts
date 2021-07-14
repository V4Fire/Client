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
import type { PropertyInfo } from 'core/component/reflection/interface';

/**
 * Returns an information object of a component property by the specified path
 *
 * @param path
 * @param component - component instance
 *
 * @example
 * ```js
 * @component()
 * class bButton {
 *   @system()
 *   fooStore = {bla: 'bar'};
 *
 *   get foo() {
 *     return this.fooStore;
 *   }
 *
 *   created() {
 *     // {
 *     //   name: 'fooStore',
 *     //   path: 'fooStore.bar',
 *     //   fullPath: '$root.$refs.button.fooStore.bar',
 *     //   topPath: '$root.$refs.button.fooStore',
 *     //   originalPath: '$root.$refs.button.foo.bar',
 *     //   originalTopPath: '$root.$refs.button.foo',
 *     //   type: 'system',
 *     //   accessor: 'foo',
 *     //   accessorType: 'computed'
 *     // }
 *     console.log(getPropertyInfo('$root.$refs.button.foo.bar', this));
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
		topPath = path,
		originalTopPath = path;

	let
		chunks,
		rootI = 0;

	if (hasSeparator.test(path)) {
		chunks = path.split('.');

		let
			obj: Nullable<ComponentInterface> = component;

		for (let i = 0; i < chunks.length; i++) {
			if (obj == null) {
				break;
			}

			obj = obj[chunks[i]];

			if (obj?.instance instanceof ComponentInterface) {
				component = obj;
				rootI = i === chunks.length - 1 ? i : i + 1;
			}
		}

		path = chunks.slice(rootI).join('.');
		topPath = chunks.slice(0, rootI + 1).join('.');
		originalTopPath = topPath;
		name = chunks[rootI];
	}

	const
		{props, fields, systemFields, computedFields, accessors, params: {deprecatedProps}} = component.unsafe.meta;

	const
		alternative = deprecatedProps?.[name];

	if (alternative != null) {
		deprecate({type: 'property', name, renamedTo: alternative});
		name = alternative;

		if (chunks != null) {
			chunks[rootI] = name;
			path = chunks.slice(rootI).join('.');
			topPath = chunks.slice(0, rootI + 1).join('.');
			originalTopPath = topPath;
			fullPath = chunks.join('.');

		} else {
			path = name;
			fullPath = name;
			topPath = name;
			originalTopPath = name;
		}
	}

	const info: PropertyInfo = {
		name,
		type: 'field',
		ctx: resolveCtx(component),

		path,
		fullPath,
		originalPath,

		topPath,
		originalTopPath
	};

	if (RegExp.test(propRgxp, name)) {
		info.type = 'prop';
		return info;
	}

	if (RegExp.test(attrRgxp, name)) {
		info.type = 'attr';
		return info;
	}

	if (RegExp.test(storeRgxp, name)) {
		if (fields[name] != null) {
			return info;
		}

		info.type = 'system';
		return info;
	}

	if (fields[name] != null) {
		return info;
	}

	if (props[name] != null) {
		info.type = 'prop';
		return info;
	}

	if (systemFields[name] != null) {
		info.type = 'system';
		return info;
	}

	const
		storeName = `${name}Store`,
		hasStoreField = fields[storeName] != null || systemFields[storeName] != null,
		propName = hasStoreField ? null : `${name}Prop`;

	let
		accessorType,
		accessor;

	if (computedFields[name] != null) {
		accessorType = 'computed';
		accessor = name;

	} else if (accessors[name] != null) {
		accessorType = 'accessor';
		accessor = name;
	}

	if (hasStoreField || propName != null && props[propName]) {
		name = propName ?? storeName;

		if (chunks != null) {
			chunks[rootI] = name;
			path = chunks.slice(rootI).join('.');
			fullPath = chunks.join('.');
			topPath = chunks.slice(0, rootI + 1).join('.');

		} else {
			path = name;
			fullPath = name;
			topPath = name;
		}

		let
			type: PropertyInfo['type'] = 'field';

		if (propName != null) {
			type = 'prop';

		} else if (systemFields[storeName] != null) {
			type = 'system';
		}

		return {
			...info,

			name,
			type,

			path,
			fullPath,
			topPath,

			accessor,
			accessorType
		};
	}

	if (accessorType != null) {
		if ((computedFields[name] ?? accessors[name])!.watchable) {
			let
				ctxPath;

			if (chunks != null) {
				ctxPath = chunks.slice(0, rootI + 1);
				path = chunks.slice(rootI + 1).join('.');
				topPath = chunks.slice(0, rootI + 2).join('.');
				originalTopPath = topPath;

			} else {
				ctxPath = path;
				path = '';
				topPath = '';
				originalTopPath = '';
			}

			return {
				...info,

				type: 'mounted',
				ctx: resolveCtx(Object.get(component, ctxPath) ?? {}),

				path,
				originalPath,

				topPath,
				originalTopPath
			};
		}

		info.type = accessorType;
		return info;
	}

	info.type = 'system';
	return info;

	function resolveCtx(component: any): ComponentInterface {
		if (component?.$remoteParent != null) {
			return Object.getPrototypeOf(component);
		}

		return component;
	}
}
