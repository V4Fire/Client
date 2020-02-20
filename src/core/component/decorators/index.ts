/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { paramsFactory } from 'core/component/decorators/base';
import { InitFieldFn } from 'core/component/interface';

import {

	DecoratorProp,
	DecoratorSystem,
	DecoratorField,

	DecoratorComponentAccessor,
	DecoratorMethod,

	DecoratorHook,
	DecoratorFieldWatcher,
	DecoratorMethodWatchers

} from 'core/component/decorators/interface';

export * from 'core/component/decorators/base';
export * from 'core/component/decorators/interface';

/**
 * Marks a class property as a component initial property
 * @decorator
 */
export const prop = paramsFactory<
	CanArray<Function> |
	ObjectConstructor |
	DecoratorProp
>('props', (p) => {
	if (Object.isFunction(p) || Object.isArray(p)) {
		return {type: p};
	}

	return p;
});

/**
 * Marks a class property as a component data property
 * @decorator
 */
export const field = paramsFactory<InitFieldFn | DecoratorField>('fields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Marks a class property as a system property
 * @decorator
 */
export const system = paramsFactory<InitFieldFn | DecoratorSystem>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Universal decorator of component properties
 * @decorator
 */
export const p = paramsFactory<
	DecoratorProp |
	DecoratorField |
	DecoratorMethod |
	DecoratorComponentAccessor
>(null);

/**
 * Attaches a hook listener to a method
 * @decorator
 */
export const hook = paramsFactory<DecoratorHook>(null, (hook) => ({hook}));

/**
 * Attaches a watch listener to a method or a field
 * @decorator
 */
export const watch = paramsFactory<
	DecoratorFieldWatcher |
	DecoratorMethodWatchers
>(null, (watch) => ({watch}));
