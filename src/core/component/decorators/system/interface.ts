/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';
import type { DecoratorFieldWatcher } from 'core/component/decorators/watch';
import type { DecoratorFunctionalOptions } from 'core/component/decorators/interface';

export interface DecoratorSystem<
	Ctx extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorFunctionalOptions {
	/**
	 * Marks the field as unique for each component instance.
	 * Also, the parameter can take a function that returns a boolean value.
	 * If this value is true, then the parameter is considered unique.
	 *
	 * Please note that the "external" code must provide the uniqueness guarantee
	 * because V4Fire does not perform special checks for uniqueness.
	 *
	 * @default `false`
	 */
	unique?: boolean | UniqueFieldFn<Ctx>;

	/**
	 * This option allows you to set the default value of the field.
	 * But using it, as a rule, is not explicitly required, since the default value can be passed through
	 * the native syntax of class properties.
	 *
	 * Note that if the default value is set using class property syntax, then it is a prototype, not a real value.
	 * That is, when set to each new instance, it will be cloned using `Object.fastClone`.
	 * If this behavior does not suit you, then pass the value explicitly via `default` or using the `init` option and
	 * an initializer function.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system()
	 *   bla: number = 0;
	 *
	 *   @field({default: 0})
	 *   bar!: number;
	 *
	 *   // There will be a trouble here when cloning the value
	 *   @field()
	 *   body: Element = document.body;
	 *
	 *   // All fine
	 *   @field({default: document.body})
	 *   validBody!: Element;
	 *
	 *   // All fine
	 *   @field(() => document.body)
	 *   validBody2!: Element;
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
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({init: Math.random})
	 *   hashCode!: number;
	 *
	 *   @system((ctx, {hashCode}) => String(hashCode))
	 *   normalizedHashCode!: string;
	 * }
	 * ```
	 */
	init?: InitFieldFn<Ctx>;

	/**
	 * A name or a list of names after which this property should be initialized.
	 * Keep in mind, you can only specify names that are of the same type as the current field (`@system` or `@field`).
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system(Math.random)
	 *   hashCode!: number;
	 *
	 *   @system({
	 *     after: 'hashCode',
	 *     init: (ctx, {hashCode}) => String(hashCode)
	 *   })
	 *
	 *   normalizedHashCode!: string;
	 * }
	 * ```
	 */
	after?: CanArray<string>;

	/**
	 * Indicates that property should be initialized before all non-atom properties.
	 * This option is necessary when you have a field that must be guaranteed to be initialized before other fields,
	 * and you don't want to use `after` everywhere. But you can still use `after` along with other atomic fields.
	 *
	 * @default `false`
	 *
	 * @example
	 * ```typescript
	 * import Async from 'core/async';
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({atom: true, init: (ctx) => new Async(ctx)})
	 *   async!: Async<this>;
	 *
	 *   @system((ctx, data) => data.async.proxy(() => { /* ... *\/ }))
	 *   handler!: Function;
	 * }
	 * ```
	 */
	atom?: boolean;

	/**
	 * A watcher or a list of watchers for the current field.
	 * The watcher can be defined as a component method to invoke, callback function, or watch handle.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
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
	 *       // If set to false, the handler invoked on the watcher event does not take any arguments from the event
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
	watch?: DecoratorFieldWatcher<Ctx, A, B>;

	/**
	 * If set to false, the field can't be watched if created inside a functional component.
	 * This option is useful when you are writing a superclass or a smart component that can be created
	 * as regular or functional.
	 *
	 * @default `true`
	 */
	functionalWatching?: boolean;

	/**
	 * This option is only relevant for functional components.
	 * The fact is that when a component state changes, all its child functional components are recreated from scratch.
	 * But we need to restore the state of such components. By default, properties are simply copied from old instances to
	 * new ones, but sometimes this strategy does not suit us. This option helps here - it allows you to declare that
	 * a certain property should be mixed based on the old and new values.
	 *
	 * Set this property to true to enable the strategy of merging old and new values.
	 * Or specify a function that will perform the merge. This function takes contexts of the old and new components,
	 * the name of the field to restore, and optionally, a path to a property to which the given is bound.
	 *
	 * @default `false`
	 */
	merge?: MergeFieldFn<Ctx> | boolean;

	/**
	 * A dictionary with some extra information of the field.
	 * You can access this information using `meta.fields` or `meta.systemFields`.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, system } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @system({init: Math.random, meta: {debug: true}})
	 *   hashCode!: number;
	 *
	 *   created() {
	 *     // {debug: true}}
	 *     console.log(this.meta.systemFields.hashCode.meta);
	 *   }
	 * }
	 * ```
	 */
	meta?: Dictionary;
}

export interface DecoratorField<
	Ctx extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorSystem<Ctx, A, B> {
	/**
	 * If set to true, property changes will cause the template to be guaranteed to be re-rendered.
	 * Be aware that enabling this property may result in redundant redrawing.
	 *
	 * @default `false`
	 */
	forceUpdate?: boolean;
}

export interface InitFieldFn<Ctx extends ComponentInterface = ComponentInterface> {
	(ctx: Ctx['unsafe'], data: Dictionary): unknown;
}

export interface MergeFieldFn<Ctx extends ComponentInterface = ComponentInterface> {
	(ctx: Ctx['unsafe'], oldCtx: Ctx['unsafe'], field: string, link?: string): unknown;
}

export interface UniqueFieldFn<Ctx extends ComponentInterface = ComponentInterface> {
	(ctx: Ctx['unsafe'], oldCtx: Ctx['unsafe']): AnyToBoolean;
}
