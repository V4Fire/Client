/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isComponent, componentRegInitializers, componentParams, components } from 'core/component/const';

import type { ComponentMeta } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect';

import { initEmitter } from 'core/component/event';

/**
 * Registers parent components for the given one.
 * The function returns false if all parent components are already registered.
 *
 * This function is necessary because we have lazy component registration: when we see the "foo" component for
 * the first time in the template, we need to check the registration of all its parent components.
 *
 * @param component - the component information object
 */
export function registerParentComponents(component: ComponentConstructorInfo): boolean {
	const
		{name, layer} = component;

	let
		parentName = component.parentParams?.name,
		parentComponent = component.parent;
	
	initEmitter.emit(`registerComponent.${layer}.${component?.name}`);

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

		const regParentComponent = componentRegInitializers[parentName];

		if (regParentComponent != null) {
			regParentComponent.forEach((reg) => reg());
			delete componentRegInitializers[parentName];

			return true;
		}
	}

	return false;
}

/**
 * Registers a component by the specified name.
 * The function returns the metaobject of the created component, or undefined if the component isn't found.
 * If the component is already registered, it won't be registered twice.
 *
 * This function is necessary because we have lazy component registration.
 * Keep in mind that you must call `registerParentComponents` before calling this function.
 *
 * @param name - the component name
 */
export function registerComponent(name: CanUndef<string>, layer?: string): CanNull<ComponentMeta> {
	if (name == null || !isComponent.test(name)) {
		return null;
	}

<<<<<<< HEAD
	const component = components.get(name);

	let componentName = (component?.componentName || name).replaceAll('-functional', '');	
	initEmitter.emit(`registerComponent.${component?.layer || layer}.${componentName}`);

	const
		regComponent = componentRegInitializers[name];
=======
	const regComponent = componentRegInitializers[name];
>>>>>>> 90b6fe5867f089d0a8e10967bc1eac085f961718

	if (regComponent != null) {
		regComponent.forEach((reg) => reg());

		delete componentRegInitializers[name];

	}

	return component ?? null;
}
