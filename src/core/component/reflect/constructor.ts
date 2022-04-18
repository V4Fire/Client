/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentParams, components } from 'core/component/const';
import { isAbstractComponent, isSmartComponent } from 'core/component/reflect/types';

import type { ComponentOptions, ComponentMeta, ComponentConstructor } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect/interface';

/**
 * Returns a component name by the specified constructor.
 * The name is represented in a dash style.
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
	const
		nm = constructor.name;

	if (Object.isString(nm)) {
		return nm.dasherize();
	}

	return '';
}

/**
 * Returns an object with information from the specified component constructor
 *
 * @param constructor
 * @param [declParams] - component declaration parameters
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
 * getInfoFromConstructor(bButton);
 * ```
 */
export function getInfoFromConstructor(
	constructor: ComponentConstructor,
	declParams?: ComponentOptions
): ComponentConstructorInfo {
	const
		name = declParams?.name ?? getComponentName(constructor);

	const
		parent = Object.getPrototypeOf(constructor),
		parentParams = parent != null ? componentParams.get(parent) : undefined;

	// Create an object with parameters of a component
	const params = parentParams != null ?
		{
			root: parentParams.root,
			...declParams,
			name
		} :

		{
			root: false,
			tpl: true,
			inheritAttrs: true,
			functional: false,
			...declParams,
			name
		};

	// Mix the "functional" parameter from a parent @component declaration
	if (parentParams) {
		let
			functional;

		if (Object.isPlainObject(params.functional) && Object.isPlainObject(parentParams.functional)) {
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

	return {
		name,
		componentName: name.replace(isSmartComponent, ''),
		constructor,
		params,

		isAbstract: isAbstractComponent.test(name),
		isSmart: isSmartComponent.test(name),

		parent,
		parentParams,

		get parentMeta(): CanUndef<ComponentMeta> {
			return parent != null ? components.get(parent) : undefined;
		}
	};
}
