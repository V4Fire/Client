/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface } from 'core/component/interface';
import type { DecoratorFieldWatcher } from 'core/component/decorators/interface/watcher';

/**
 * Options of a component prop
 */
export interface PropOptions<T = unknown> {
	/**
	 * Property type constructor or a list of constructors (if the property can have several types)
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
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
	 * Should or not the property has always a value
	 * @default `true`
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
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
	 * Default value for the property
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop({default: 1})
	 *   bla!: number;
	 *
	 *   @prop()
	 *   baz: number = 0;
	 * }
	 * ```
	 */
	default?: T | null | undefined | (() => T | null | undefined);

	/**
	 * If false, the property can't work within functional or flyweight components
	 * @default `true`
	 */
	functional?: boolean;

	/**
	 * Property validator
	 *
	 * @param value
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @prop({type: Number, validator: (v) => v > 0}})
	 *   bla!: number;
	 * }
	 * ```
	 */
	validator?(value: T): boolean;
}

export interface DecoratorProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
	> extends PropOptions {
	/**
	 * If true, then the property always uses own default property when it is necessary
	 * @default `false`
	 */
	forceDefault?: boolean;

	/**
	 * Watcher for changes of the property
	 */
	watch?: DecoratorFieldWatcher<CTX, A, B>;

	/**
	 * Additional information about the property
	 */
	meta?: Dictionary;
}

export type Prop<T = unknown> =
	{(): T} |
	{new(...args: any[]): T & object} |
	{new(...args: string[]): Function};

export type PropType<T = unknown> = CanArray<Prop<T>>;
