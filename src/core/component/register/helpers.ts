/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentInitializers, componentParams, components } from 'core/component/const';
import { ComponentConstructorInfo } from 'core/component/reflection';
import { ComponentMeta } from 'core/component/interface';

/**
 * Registers a parent component of the specified component to a component library (vue, react, etc.).
 * This function is needed because we have lazy registering of components:
 * when we see a component "foo" in the first time in a template we need to check registration of all
 * its parent components. The function returns false if all component parent already registered.
 *
 * @param component - information object of the component
 */
export function registerParentComponents(component: ComponentConstructorInfo): boolean {
	const
		{name} = component;

	let
		parentName = component.parentParams?.name,
		parentComponent = component.parent;

	if (!parentName || !componentInitializers[parentName]) {
		return false;
	}

	while (parentName === name) {
		parentComponent = Object.getPrototypeOf(parentComponent);

		if (parentComponent) {
			const p = componentParams.get(parentComponent);
			parentName = p && p.name;
		}
	}

	if (parentName) {
		const
			regParentComponent = componentInitializers[parentName];

		if (regParentComponent) {
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
 * Register a component by the specified name to a component library (vue, react, etc.).
 * This function is needed because we have lazy registering of components.
 * Mind that you should call registerParentComponents before calling this function.
 * The function returns a meta object of the created component or undefined if the component by the specified name
 * wasn't found. If the component already registered, it won't be registered twice.
 *
 * @param name - component name
 */
export function registerComponent(name: string): CanUndef<ComponentMeta> {
	const
		regComponent = componentInitializers[name];

	if (regComponent) {
		for (let i = 0; i < regComponent.length; i++) {
			regComponent[i]();
		}

		delete componentInitializers[name];
	}

	return components.get(name);
}
