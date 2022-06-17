/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isComponent, componentInitializers, componentParams, components } from 'core/component/const';

import type { ComponentMeta } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect';

/**
 * Registers parent components for the given one.
 * This function is needed because we have lazy component registration: when we see the "foo" component for
 * the first time in a template, we need to check the registration of all its parent components.
 * The function returns false if all parent components are already registered.
 *
 * @param component - the component information object
 */
export function registerParentComponents(component: ComponentConstructorInfo): boolean {
	const
		{name} = component;

	let
		parentName = component.parentParams?.name,
		parentComponent = component.parent;

	if (!Object.isTruly(parentName) || !componentInitializers[<string>parentName]) {
		return false;
	}

	while (parentName === name) {
		parentComponent = Object.getPrototypeOf(parentComponent);

		if (parentComponent) {
			const p = componentParams.get(parentComponent);
			parentName = p?.name;
		}
	}

	if (Object.isTruly(parentName)) {
		parentName = <string>parentName;

		const
			regParentComponent = componentInitializers[parentName];

		if (regParentComponent != null) {
			for (let i = 0; i < regParentComponent.length; i++) {
				regParentComponent[i]();
			}

			delete componentInitializers[parentName];
			return true;
		}
	}

	return false;
}

/**
 * Register a component by the specified name.
 * This function is needed because we have lazy component registration.
 * Keep in mind that you must call `registerParentComponents` before calling this function.
 * The function returns a meta object of the created component, or undefined if the component isn't found.
 * If the component is already registered, it won't be registered twice.
 *
 * @param name - the component name
 */
export function registerComponent(name: CanUndef<string>): CanUndef<ComponentMeta> {
	if (name == null || !isComponent.test(name)) {
		return;
	}

	const
		regComponent = componentInitializers[name];

	if (regComponent != null) {
		for (let i = 0; i < regComponent.length; i++) {
			regComponent[i]();
		}

		delete componentInitializers[name];
	}

	return components.get(name);
}
