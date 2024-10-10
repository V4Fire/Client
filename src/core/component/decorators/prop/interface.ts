/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';
import type { DecoratorFieldWatcher } from 'core/component/decorators/watch';

/**
 * Options of a component prop
 */
export interface PropOptions<T = unknown> {
	/**
	 * A constructor function of the prop type.
	 * If the prop can be of different types, then you need to specify a list of constructors.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop({type: Number})
	 *   bla!: number;
	 *
	 *   @prop({type: [Number, String]})
	 *   baz!: number | string;
	 * }
	 * ```
	 */
	type?: PropType<T>;

	/**
	 * By default, all component props must be value-initialized.
	 * The values are either passed explicitly when a component is called, or are taken from the default values.
	 * If you set the `required` option to false, then the prop can be non-initialized.
	 *
	 * @default `true`
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop({required: false})
	 *   bla?: number;
	 *
	 *   @prop()
	 *   baz: number = 0;
	 * }
	 * ```
	 */
	required?: boolean;

	/**
	 * This option allows you to set the default value of the prop.
	 * But using it, as a rule, is not explicitly required, since the default value can be passed through
	 * the native syntax of class properties.
	 *
	 * Note that if the default value is set using class property syntax, then it is a prototype, not a real value.
	 * That is, when set to each new instance, it will be cloned using `Object.fastClone`.
	 * If this behavior does not suit you, then pass the value explicitly via `default`.
	 *
	 * Also, you can pass the default value as a function.
	 * It will be called, and its result will become the default value.
	 * Note that if your prop type is `Function`, then the default value will be treated "as is".
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop()
	 *   bla: number = 0;
	 *
	 *   @prop({default: 1})
	 *   baz!: number;
	 *
	 *   @prop({default: Math.random})
	 *   hashCode!: number;
	 * }
	 * ```
	 */
	default?: Nullable<T> | (() => Nullable<T>);

	/**
	 * A function to check the passed value for compliance with the requirements.
	 * Use it if you want to impose additional checks besides checking the prop type.
	 *
	 * @param value
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop({type: Number, validator: Number.isPositive})
	 *   bla!: number;
	 * }
	 * ```
	 */
	validator?(value: T): boolean;

	/**
	 * If set to false, the prop can't be passed to a functional component
	 * @default `true`
	 */
	functional?: boolean;
}

export interface DecoratorProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends PropOptions {
	/**
	 * If set to false, changing the prop will never trigger a re-render of the component template.
	 * Use this mode for props that are not used in the template to reduce the number of unwanted re-renders.
	 *
	 * Note that this logic only applies to non-functional components,
	 * as a functional component updates with any change in the parent state.
	 *
	 * @default `true`
	 */
	forceUpdate?: boolean;

	/**
	 * If set to true, the prop always uses its own default value when needed.
	 * This option is actually used when the `defaultProps` property is set to false for the described component
	 * (via the `@component` decorator), and we want to override this behavior for a particular prop.
	 *
	 * @default `false`
	 */
	forceDefault?: boolean;

	/**
	 * A watcher or a list of watchers for the current prop.
	 * The watcher can be defined as a component method to invoke, callback function, or watch handle.
	 *
	 * The `core/watch` module is used to make objects watchable.
	 * Therefore, for more information, please refer to its documentation.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop({watch: [
	 *     'onIncrement',
	 *
	 *     (ctx, val, oldVal, info) =>
	 *       console.log(val, oldVal, info),
	 *
	 *     // Also, see core/object/watch
	 *     {
	 *       // If set to false,
	 *       // then a handler that is invoked on the watcher event does not take any arguments from the event
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
	 * A dictionary with some extra information of the prop.
	 * You can access this information using `meta.props`.
	 *
	 * ```typescript
	 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @prop({default: Math.random, meta: {debug: true}})
	 *   hashCode!: number;
	 *
	 *   created() {
	 *     // {debug: true}
	 *     console.log(this.meta.props.hashCode.meta);
	 *   }
	 * }
	 * ```
	 */
	meta?: Dictionary;
}

export type Prop<T = unknown> =
	{(): T} |
	{new (...args: any[]): T & object} |
	{new (...args: string[]): Function};

export type PropType<T = unknown> = CanArray<Prop<T>>;
