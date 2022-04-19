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
	 * If true, then the property is unique for each component.
	 * Also, the parameter can take a function that returns a boolean value.
	 *
	 * @default `false`
	 */
	unique?: boolean | UniqueFieldFn<CTX>;

	/**
	 * Default value of the property
	 */
	default?: unknown;

	/**
	 * Initializer of the field value
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
	 * If true, the property will be initialized before all non-atom properties
	 * @default `false`
	 */
	atom?: boolean;

	/**
	 * Name or a list of names after which this property should be initialized
	 */
	after?: CanArray<string>;

	/**
	 * Watcher for changes of the property
	 */
	watch?: DecoratorFieldWatcher<CTX, A, B>;

	/**
	 * If false, the property can't be watched within a functional component
	 * @default `true`
	 */
	functionalWatching?: boolean;

	/**
	 * If true, then if a component will restore own state from the old component
	 * (it occurs when you use a functional component), the actual value will be merged with the previous.
	 * Also, this parameter can take a function to merge.
	 *
	 * @default `false`
	 */
	merge?: MergeFieldFn<CTX> | boolean;

	/**
	 * Non-standard extra information of the field
	 */
	meta?: Dictionary;
}

export interface DecoratorField<
	CTX extends ComponentInterface = ComponentInterface,
	A = unknown,
	B = A
> extends DecoratorSystem<CTX, A, B> {
	/**
	 * If false, then changes of the property don't directly force re-rendering of a template.
	 * Mind, the template still can be re-rendered, but only at the initiative of the engine used.
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
