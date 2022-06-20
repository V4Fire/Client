import { isComponent, componentRegInitializers, componentParams, components } from 'core/component/const';

import type { ComponentMeta } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect';

/**
 * Registers parent components for the given one.
 * The function returns false if all parent components are already registered.
 *
 * This function is needed because we have lazy component registration: when we see the "foo" component for
 * the first time in the template, we need to check the registration of all its parent components.
 *
 * @param component - the component information object
 */
export function registerParentComponents(component: ComponentConstructorInfo): boolean {
	const
		{name} = component;

	let
		parentName = component.parentParams?.name,
		parentComponent = component.parent;

	if (!Object.isTruly(parentName) || !componentRegInitializers[<string>parentName]) {
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
			regParentComponent = componentRegInitializers[parentName];

		if (regParentComponent != null) {
			for (let i = 0; i < regParentComponent.length; i++) {
				regParentComponent[i]();
			}

			delete componentRegInitializers[parentName];
			return true;
		}
	}

	return false;
}

/**
 * Registers a component by the specified name.
 * The function returns the meta object of the created component, or undefined if the component isn't found.
 * If the component is already registered, it won't be registered twice.
 *
 * This function is needed because we have lazy component registration.
 * Keep in mind that you must call `registerParentComponents` before calling this function.
 *
 * @param name - the component name
 */
export function registerComponent(name: CanUndef<string>): CanUndef<ComponentMeta> {
	if (name == null || !isComponent.test(name)) {
		return;
	}

	const
		regComponent = componentRegInitializers[name];

	if (regComponent != null) {
		for (let i = 0; i < regComponent.length; i++) {
			regComponent[i]();
		}

		delete componentRegInitializers[name];
	}

	return components.get(name);
}
