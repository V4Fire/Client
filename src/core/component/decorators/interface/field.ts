/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';
import type { DecoratorFieldWatcher } from 'core/component/decorators/interface/watcher';
import type { DecoratorFunctionalOptions } from 'core/component/decorators/interface/types';

export interface DecoratorSystem<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorFunctionalOptions {
	/**
	 * Marks the field as unique for each component instance.
	 * Also, the parameter can take a function that returns a boolean value.
	 *
	 * @default `false`
	 */
	unique?: boolean | UniqueFieldFn<CTX>;

	/**
	 * This option allows you to set a default value for the field.
	 * But using it, as a rule, is not explicitly required, since a default value can be passed through the
	 * native syntax of class properties.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system()
	 *   bla: number = 0;
	 * }
	 * ```
	 */
	default?: unknown;

	/**
	 * A function to initialize the field value.
	 * The function takes as its first argument a reference to the component context.
	 * As the second argument, the function takes a reference to a dictionary with other fields of the same type that
	 * have already been initialized.
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({init: () => Math.random()})
	 *   bla!: number;
	 *
	 *   @system(() => Math.random())
	 *   bar!: number;
	 * }
	 * ```
	 */
	init?: InitFieldFn<CTX>;

	/**
	 * A name or list of names after which this property should be initialized.
	 * Keep in mind, you can only specify names that are of the same type as the current field (fields or system).
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class bExample extends iBlock {
	 *   @system(() => Math.random())
	 *   bla!: number;
	 *
	 *   @system({
	 *     after: 'bla',
	 *     init: (ctx, data) => data.bla + 10
	 *   })
	 *
	 *   baz!: number;
	 * }
	 * ```
	 */
	after?: CanArray<string>;

	/**
	 * Indicates that property should be initialized before all non-atom properties.
	 * This option is needed when you have a field that must be guaranteed to be initialized before other fields,
	 * and you don't want to use `after` everywhere. But you can still use `after` along with other atomic fields.
	 *
	 * @default `false`
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({atom: true, init: () => Math.random()})
	 *   bla!: number;
	 *
	 *   @system((ctx, data) => data.bla + 10)
	 *   baz!: number;
	 * }
	 * ```
	 */
	atom?: boolean;

	/**
	 * A watcher or list of watchers for the current field.
	 * The watcher can be defined as a component method to invoke, callback function, or watch handle.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({watch: [
	 *     'onIncrement',
	 *
	 *     (ctx, val, oldVal, info) =>
	 *       console.log(val, oldVal, info),
	 *
	 *     // Also, see core/object/watch
	 *     {
	 *       // If false, then a handler that is invoked on the watcher event does not take any arguments from the event
	 *       provideArgs: false,
	 *
	 *       // How the event handler should be called:
	 *       //
	 *       // 1. `'post'` - the handler will be called on the next tick after the mutation and
	 *       //    guaranteed after updating all tied templates;
	 *       //
	 *       // 2. `'pre'` - the handler will be called on the next tick after the mutation and
	 *       //    guaranteed before updating all tied templates;
	 *       //
	 *       // 3. `'sync'` - the handler will be invoked immediately after each mutation.
	 *       flush: 'sync',
	 *
	 *       // Can define as a function too
	 *       handler: 'onIncrement'
	 *     }
	 *   ]})
	 *
	 *   i: number = 0;
	 *
	 *   onIncrement(val, oldVal, info) {
	 *     console.log(val, oldVal, info);
	 *   }
	 * }
	 * ```
	 */
	watch?: DecoratorFieldWatcher<CTX, A, B>;

	/**
	 * If false, the field can't be watched if created inside a functional component
	 * @default `true`
	 */
	functionalWatching?: boolean;

	/**
	 * If true, then if the component will restore its own state from the old component
	 * (this happens when using a functional component), then the actual value will be merged with the previous one.
	 * Also, this parameter can take a function to merge.
	 *
	 * @default `false`
	 */
	merge?: MergeFieldFn<CTX> | boolean;

	/**
	 * A dictionary with some extra information of the field
	 */
	meta?: Dictionary;
}

export interface DecoratorField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorSystem<CTX, A, B> {
	/**
	 * If false, then property changes don't directly force re-rendering the template.
	 * Keep in mind that the template can still be re-rendered, but only at the initiative of the engine being used.
	 * @default `true`
	 */
	forceUpdate?: boolean;
}

export interface InitFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX['unsafe'], data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX['unsafe'], oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX['unsafe'], oldCtx: CTX): AnyToBoolean;
}
