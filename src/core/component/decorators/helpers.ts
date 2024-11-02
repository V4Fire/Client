/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { initEmitter } from 'core/component/event';

import type { ComponentMeta } from 'core/component/meta';

import type {

	PartDecorator,

	ComponentPartDecorator3,
	ComponentPartDecorator4,

	ComponentDescriptor,
	DecoratorFunctionalOptions

} from 'core/component/decorators/interface';

/**
 * Creates a decorator for a component's property or method based on the provided decorator function.
 * The decorator function expects three input arguments (excluding the object descriptor).
 *
 * @param decorator
 */
export function createComponentDecorator3(decorator: ComponentPartDecorator3): PartDecorator {
	return (proto: object, partKey: string) => {
		createComponentDecorator(decorator, partKey, undefined, proto);
	};
}

/**
 * Creates a decorator for a component's property or method based on the provided decorator function.
 * The decorator function expects four input arguments (including the object descriptor).
 *
 * @param decorator
 */
export function createComponentDecorator4(decorator: ComponentPartDecorator4): PartDecorator {
	return (proto: object, partKey: string, partDesc?: PropertyDescriptor) => {
		createComponentDecorator(decorator, partKey, partDesc, proto);
	};
}

function createComponentDecorator(
	decorator: ComponentPartDecorator3 | ComponentPartDecorator4,
	partKey: string,
	partDesc: CanUndef<PropertyDescriptor>,
	proto: object
): void {
	initEmitter.once('bindConstructor', (_componentName: string, regEvent: string) => {
		initEmitter.once(regEvent, (componentDesc: ComponentDescriptor) => {
			if (decorator.length <= 3) {
				(<ComponentPartDecorator3>decorator)(componentDesc, partKey, proto);

			} else {
				(<ComponentPartDecorator4>decorator)(componentDesc, partKey, partDesc, proto);
			}
		});
	});
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
