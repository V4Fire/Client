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
 * Marks a class property as a component prop
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @prop(Number)
 *   bla: number = 0;
 *
 *   @prop({type: Number, required: false})
 *   baz?: number;
 *
 *   @prop({type: Number, default: () => Math.random()})
 *   bar!: number;
 * }
 * ```
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
 * Marks a class property as a component field.
 * In a regular component mutations of field properties force component re-rendering.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   bla: number = 0;
 *
 *   @field(() => Math.random())
 *   baz?: number;
 * }
 * ```
 */
export const field = paramsFactory<InitFieldFn | DecoratorField>('fields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Marks a class property as a system field.
 * Mutations of system properties never force component re-rendering.
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   bla: number = 0;
 *
 *   @field(() => Math.random())
 *   baz?: number;
 * }
 * ```
 */
export const system = paramsFactory<InitFieldFn | DecoratorSystem>('systemFields', (p) => {
	if (Object.isFunction(p)) {
		return {init: p};
	}

	return p;
});

/**
 * Attaches extra meta information to a component computed field or accessor
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @computed({cache: true})
 *   get foo() {
 *     return 42;
 *   }
 * }
 * ```
 */
export const computed = paramsFactory<DecoratorComponentAccessor>(null);

/**
 * Universal decorator for a component property/accessor/method
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @p({cache: true})
 *   get foo() {
 *     return 42;
 *   }
 * }
 * ```
 */
export const p = paramsFactory<
	DecoratorProp |
	DecoratorField |
	DecoratorMethod |
	DecoratorComponentAccessor
>(null);

/**
 * Attaches a hook listener to a component method
 * @decorator
 */
export const hook = paramsFactory<DecoratorHook>(null, (hook) => ({hook}));

/**
 * Attaches a watcher to a component property/event to a component method or property.
 *
 * To listen an event you need to use the special delimiter ":" within a path.
 * Also, you can specify an event emitter to listen by writing a link before ":".
 *
 * @decorator
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {
 *   @field()
 *   foo: Dictionary = {bla: 0};
 *
 *   // Watch for changes of "foo"
 *   @watch('foo')
 *   watcher1() {
 *
 *   }
 *
 *   // Deep watch for changes of "foo"
 *   @watch({path: 'foo', deep: true}})
 *   watcher2() {
 *
 *   }
 *
 *   // Watch for changes of "foo.bla"
 *   @watch('foo.bla')
 *   watcher3() {
 *
 *   }
 *
 *   // Listen "onChange" event of a component
 *   @watch(':onChange')
 *   watcher3() {
 *
 *   }
 *
 *   // Listen "onChange" event of a component parentEmitter
 *   @watch('parentEmitter:onChange')
 *   watcher4() {
 *
 *   }
 * }
 * ```
 */
export const watch = paramsFactory<
	DecoratorFieldWatcher |
	DecoratorMethodWatchers
>(null, (watch) => ({watch}));
