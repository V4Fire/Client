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

	ComponentProp,
	SystemField,
	ComponentField,

	ComponentAccessor,
	ComponentMethod,

	ComponentHooks,
	FieldWatcher,
	MethodWatchers

} from 'core/component/decorators/interface';

export * from 'core/component/decorators/interface';

/**
 * Marks a class property as a component initial property
 * @decorator
 */
export const prop = paramsFactory<CanArray<Function> | ObjectConstructor | ComponentProp>('props', (p) => {
	if (Object.isFunction(p) || Object.isArray(p)) {
		return {type: p};
	}

	return p;
});

/**
 * Marks a class property as a component data property
 * @decorator
 */
export const field = paramsFactory<InitFieldFn | ComponentField>('fields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Marks a class property as a system property
 * @decorator
 */
export const system = paramsFactory<InitFieldFn | SystemField>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Universal decorator of component properties
 * @decorator
 */
export const p = paramsFactory<ComponentProp | ComponentField | ComponentMethod | ComponentAccessor>(null);

/**
 * Attaches a hook listener to a method
 * @decorator
 */
export const hook = paramsFactory<ComponentHooks>(null, (hook) => ({hook}));

/**
 * Attaches a watch listener to a method or a field
 * @decorator
 */
export const watch = paramsFactory<FieldWatcher | MethodWatchers>(null, (watch) => ({watch}));
