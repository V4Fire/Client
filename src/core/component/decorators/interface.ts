/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { WatchPath, WatchOptions } from 'core/object/watch';

import {

	ComponentInterface,
	Hook,
	MethodWatcher,
	WatchHandler

} from 'core/component/interface';

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
	(ctx: CTX['unsafe'], data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX['unsafe'], oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX['unsafe'], oldCtx: CTX): unknown;
}

export interface DecoratorFieldWatcherObject<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends WatchOptions {
	/**
	 * Handler (or a name of a component method) that is invoked on watcher events
	 */
	handler: string | WatchHandler<CTX, A, B>;

	/** @deprecated */
	fn?: string | WatchHandler<CTX, A, B>;

	/**
	 * If false, then the handler that is invoked on watcher events doesn't take any arguments from an event
	 * @default `true`
	 */
	provideArgs?: boolean;
}

export type DecoratorFieldWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	DecoratorFieldWatcherObject<CTX, A, B> |
	WatchHandler<CTX, A, B> |
	Array<string | DecoratorFieldWatcherObject<CTX, A, B> | WatchHandler<CTX, A, B>>;

export interface DecoratorProp<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends PropOptions {
	/**
	 * If true, then the property always uses own default property when it necessary
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

export interface DecoratorSystem<
	CTX extends ComponentInterface = ComponentInterface
> extends DecoratorFunctionalOptions {
	/**
	 * If true, the property will be initialized before all non-atomic properties
	 * @default `false`
	 */
	atom?: boolean;

	/**
	 * Default value for the property
	 */
	default?: unknown;

	/**
	 * If true, then the property is unique for a component.
	 * Also, the parameter can take a function that returns a boolean value.
	 * @default `false`
	 */
	unique?: boolean | UniqueFieldFn<CTX>;

	/**
	 * Name or list of names after which this property should be initialized
	 */
	after?: CanArray<string>;

	/**
	 * Initializer (constructor) of a value.
	 * This property is useful for complex values.
	 *
	 * @example
	 * ```
	 * @component()
	 * class Foo extends iBlock {
	 *   @field({init: () => Math.random()})
	 *   bla!: number;
	 * }
	 * ```
	 */
	init?: InitFieldFn<CTX>;

	/**
	 * If true, then if a component will restore own state from an old component
	 * (it occurs when you use a functional component), the actual value will be merged with the previous.
	 * Also, this parameter can take a function to merge.
	 *
	 * @default `false`
	 */
	merge?: MergeFieldFn<CTX> | boolean;

	/**
	 * Additional information about the property
	 */
	meta?: Dictionary;
}

export interface DecoratorField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorSystem<CTX> {
	/**
	 * Watcher for changes of the property
	 */
	watch?: DecoratorFieldWatcher<CTX, A, B>;

	/**
	 * If false, then changes of the property don't force direct re-render
	 * @default `true`
	 */
	forceUpdate?: boolean;
}

export interface DecoratorFunctionalOptions {
	/**
	 * If false, the instance won't be borrowed from a parent when the owner component is a flyweight
	 * @default `true`
	 */
	replace?: boolean;

	/**
	 * If false, the instance can't be used with functional components
	 * @default `true`
	 */
	functional?: boolean;
}

export interface DecoratorComponentAccessor extends DecoratorFunctionalOptions {
	/**
	 * If true, a value of the accessor will be cached
	 */
	cache?: boolean;

	/**
	 * List of dependencies for the accessor.
	 * The dependencies are needed to watch for changes of the accessor or to invalidate the cache.
	 *
	 * Also, when the accessor has a logically connected prop/field
	 * (by using a name convention "${property} -> ${property}Prop | ${property}Store"),
	 * we don't need to add additional dependencies.
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   blaStore: number = 0;
	 *
	 *   @computed({cache: true, dependencies: ['blaStore']})
	 *   get bar(): number {
	 *     return this.blaStore * 2;
	 *   }
	 *
	 *   @computed({cache: true})
	 *   get bla(): number {
	 *     return blaStore * 3;
	 *   }
	 * }
	 * ```
	 */
	dependencies?: WatchPath[];
}

export type DecoratorHookOptions = {
	[hook in Hook]?: DecoratorFunctionalOptions & {
		/**
		 * Method name or list of method names after which the method should be invoked on a hook event
		 */
		after?: CanArray<string>;
	}
};

export type DecoratorHook =
	Hook |
	Hook[] |
	DecoratorHookOptions |
	DecoratorHookOptions[];

export type DecoratorMethodWatcher<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> =
	string |
	MethodWatcher<CTX, A, B> |
	Array<string | MethodWatcher<CTX, A, B>>;

export interface DecoratorMethod<CTX extends ComponentInterface = ComponentInterface, A = unknown, B = A> {
	/**
	 * Watcher for changes of some properties
	 */
	watch?: DecoratorMethodWatcher<CTX, A, B>;

	/**
	 * Parameters for watcher
	 */
	watchParams?: MethodWatcher<CTX, A, B>;

	/**
	 * Hook or a list of hooks after which the method should be invoked
	 */
	hook?: DecoratorHook;
}

export interface ParamsFactoryTransformer {
	(params: object, cluster: string): Dictionary<any>
}

export interface FactoryTransformer<T = object> {
	(params?: T): Function;
}
