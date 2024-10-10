/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initEmitter } from 'core/component/event';

import { componentDecoratedKeys } from 'core/component/const';

import type { ComponentMeta } from 'core/component/meta';

import type {

	PartDecorator,
	ComponentPartDecorator,

	DecoratorFunctionalOptions

} from 'core/component/decorators/interface';

/**
 * Creates a decorator for a component's property or method based on the provided decorator function
 * @param decorator
 */
export function createComponentDecorator(decorator: ComponentPartDecorator): PartDecorator {
	return (_: object, partKey: string, partDesc?: PropertyDescriptor) => {
		initEmitter.once('bindConstructor', (componentName, regEvent) => {
			const decoratedKeys = componentDecoratedKeys[componentName] ?? new Set();
			componentDecoratedKeys[componentName] = decoratedKeys;

			decoratedKeys.add(partKey);

			initEmitter.once(regEvent, (componentDesc) => {
				decorator(componentDesc, partKey, partDesc);
			});
		});
	};
}

/**
 * Accepts decorator parameters and a component metaobject,
 * and normalizes the value of the functional option based on these parameters
 *
 * @param params
 * @param meta
 */
export function normalizeFunctionalParams<T extends Dictionary & DecoratorFunctionalOptions>(
	params: T,
	meta: ComponentMeta
): T {
	// eslint-disable-next-line eqeqeq
	if (params.functional === undefined && meta.params.functional === null) {
		params.functional = false;
	}

	return params;
}
