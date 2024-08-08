/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { components, componentParams, partialInfo } from 'core/component/const';
import { isAbstractComponent, isSmartComponent } from 'core/component/reflect/validators';

import type { ComponentOptions, ComponentMeta, ComponentConstructor } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect/interface';

/**
 * Returns a component's name based on the given constructor.
 * The name is returned in dash-separated format.
 *
 * @param constructor
 *
 * @example
 * ```js
 * class bButton {
 *
 * }
 *
 * getComponentName(bButton) // 'b-button'
 * ```
 */
export function getComponentName(constructor: Function): string {
	const nm = constructor.name;

	if (Object.isString(nm)) {
		return nm.dasherize();
	}

	return '';
}

/**
 * Returns an object containing information derived from the specified component constructor
 *
 * @param constructor
 * @param [declParams] - the component declaration parameters
 *
 * @example
 * ```js
 * @component({functional: true})
 * class bButton extends iBlock {
 *
 * }
 *
 * // {
 * //   name: 'b-button',
 * //   componentName: 'b-button',
 * //   parent: iBlock,
 * //   ...
 * // }
 * console.log(getInfoFromConstructor(bButton));
 * ```
 */
export function getInfoFromConstructor(
	constructor: ComponentConstructor,
	declParams?: ComponentOptions
): ComponentConstructorInfo {
	const partial = declParams?.partial?.dasherize();

	if (partial != null) {
		let info = partialInfo.get(partial);

		if (info == null) {
			const {parent, parentParams} = getParent();

			info = {
				name: partial,
				componentName: partial,

				constructor,
				params: {...declParams, partial},

				isAbstract: true,
				isSmart: false,

				parent,
				parentParams,

				get parentMeta() {
					return components.get(parent) ?? null;
				}
			};

			partialInfo.set(partial, info);
		}

		componentParams.set(constructor, info.params);
		return info;
	}

	const
		name = declParams?.name ?? getComponentName(constructor),
		layer = declParams?.layer;

	let {parent, parentParams} = getParent();

	if (parentParams?.partial != null) {
		({parent, parentParams} = partialInfo.get(parentParams.partial)!);
	}

	// Create an object with the component parameters
	const params = parentParams != null ?
		{
			root: parentParams.root,
			...declParams,

			name,
			partial: undefined
		} :

		{
			tpl: true,
			root: false,

			inheritAttrs: true,
			functional: false,
			...declParams,

			name,
			partial: undefined
		};

	if (SSR) {
		params.functional = false;
	}

	// Mix the "functional" parameter from the parent @component declaration
	if (parentParams) {
		let functional: typeof params.functional;

		if (Object.isDictionary(params.functional) && Object.isDictionary(parentParams.functional)) {
			functional = {...parentParams.functional, ...params.functional};

		} else {
			functional = params.functional !== undefined ? params.functional : parentParams.functional ?? false;
		}

		params.functional = functional;
	}

	// Register component parameters in the special storage
	if (!componentParams.has(constructor)) {
		componentParams.set(constructor, params);
		componentParams.set(name, params);
	}

	const isSmart = name.endsWith('-functional');

	return {
		name,
		layer,

		componentName: isSmart ? isSmartComponent.replace(name) : name,
		constructor,
		params,

		isAbstract: isAbstractComponent.test(name),
		isSmart,

		parent,
		parentParams,

		get parentMeta(): CanNull<ComponentMeta> {
			return components.get(parent) ?? null;
		}
	};

	function getParent() {
		const
			parent = Object.getPrototypeOf(constructor),
			parentParams = componentParams.get(parent) ?? null;

		return {parent, parentParams};
	}
}
