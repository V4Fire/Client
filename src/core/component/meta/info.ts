/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentParams, components } from 'core/component/const';
import { isAbstractComponent, isSmartComponent } from 'core/component/meta/types';
import { ComponentParams } from 'core/component/interface';
import { ComponentInfo } from 'core/component/meta/interface';

/**
 * Returns a component name by the specified constructor
 * @param constr - component constructor
 */
export function getComponentName(constr: Function): string {
	return (constr.name || '').dasherize();
}

/**
 * Returns an object with information from the specified component constructor
 *
 * @param constr - component constructor
 * @param [declParams] - component declaration parameters
 */
export function getInfoFromConstructor(constr: Function, declParams?: ComponentParams): ComponentInfo {
	const
		name = declParams?.name || getComponentName(constr),
		parent = Object.getPrototypeOf(constr),
		parentParams = parent && componentParams.get(parent);

	const params = parentParams ? {root: parentParams.root, ...declParams, name} : {
		root: false,
		tpl: true,
		inheritAttrs: true,
		functional: false,
		...declParams,
		name
	};

	if (parentParams) {
		let
			functional;

		// tslint:disable-next-line:prefer-conditional-expression
		if (Object.isPlainObject(params.functional) && Object.isPlainObject(parentParams.functional)) {
			functional = {...parentParams.functional, ...params.functional};

		} else {
			functional = params.functional !== undefined ? params.functional : parentParams.functional || false;
		}

		params.functional = functional;
	}

	if (!componentParams.has(constr)) {
		componentParams.set(constr, params);
		componentParams.set(name, params);
	}

	return {
		name,
		componentName: name.replace(isSmartComponent, ''),
		isAbstract: isAbstractComponent.test(name),
		isSmart: isSmartComponent.test(name),
		params,
		parent,
		parentParams
	};
}
