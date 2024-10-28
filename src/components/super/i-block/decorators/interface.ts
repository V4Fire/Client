/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';
import type { ComponentInterface } from 'core/component';

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentStatus } from 'components/super/i-block/interface';

import type {

	InitFieldFn as BaseInitFieldFn,
	MergeFieldFn as BaseMergeFieldFn,
	UniqueFieldFn as BaseUniqueFieldFn,

	DecoratorProp as BaseDecoratorProp,
	DecoratorField as BaseDecoratorField,

	DecoratorFieldWatcher as BaseDecoratorFieldWatcher,
	DecoratorMethodWatcher as BaseDecoratorMethodWatcher

} from 'core/component/decorators';

export interface InitFieldFn<
	CTX extends ComponentInterface = iBlock
> extends BaseInitFieldFn<CTX> {}

export interface MergeFieldFn<
	CTX extends ComponentInterface = iBlock
> extends BaseMergeFieldFn<CTX> {}

export interface UniqueFieldFn<
	CTX extends ComponentInterface = iBlock
> extends BaseUniqueFieldFn<CTX> {}

export type DecoratorMethodWatcher<
	CTX extends ComponentInterface = iBlock,
	A = unknown,
	B = A
> = BaseDecoratorMethodWatcher<CTX, A, B>;

export type DecoratorFieldWatcher<
	CTX extends ComponentInterface = iBlock,
	A = unknown,
	B = A
> = BaseDecoratorFieldWatcher<CTX, A, B>;

export interface DecoratorProp<
	CTX extends ComponentInterface = iBlock,
	A = unknown,
	B = A
> extends BaseDecoratorProp<CTX, A, B> {}

export interface DecoratorField<
	CTX extends ComponentInterface = iBlock,
	A = unknown,
	B = A
> extends BaseDecoratorField<CTX, A, B> {}

export type WaitStatuses =
	number |
	string |
	ComponentStatus;

export interface WaitDecoratorOptions extends AsyncOptions {
	/**
	 * If set to true, the wrapped function will always be executed deferred
	 * @default `false`
	 */
	defer?: boolean;
}

export interface WaitOptions<F extends Function = Function> extends WaitDecoratorOptions {
	/**
	 * A function to wrap
	 */
	fn: F;
}
