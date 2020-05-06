/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

export type Prop<T = unknown> =
	{(): T} |
	{new(...args: any[]): T & object} |
	{new(...args: string[]): Function};

export type PropType<T = unknown> = CanArray<
	Prop<T>
>;

export interface PropOptions<T = unknown> {
	/**
	 * Constructor of a property type or a list of constructors
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
	 * If false, then the property isn't required
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

export interface InitFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX): unknown;
}

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;
