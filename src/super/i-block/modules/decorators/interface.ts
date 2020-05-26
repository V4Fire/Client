/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { ComponentInterface } from 'core/component';

import iBlock from 'super/i-block';
import { ComponentStatus } from 'super/i-block/interface';

import {

	InitFieldFn as BaseInitFieldFn,
	MergeFieldFn as BaseMergeFieldFn,
	UniqueFieldFn as BaseUniqueFieldFn,

	DecoratorProp as BaseDecoratorProp,
	DecoratorField as BaseDecoratorField,

	DecoratorFieldWatcher as BaseDecoratorFieldWatcher,
	DecoratorMethodWatcher as BaseDecoratorMethodWatcher

} from 'core/component/decorators';

export type DecoratorEventListenerMethod = 'on' | 'once';

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
> = BaseDecoratorMethodWatcher<CTX , A, B>;

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
	 * If true, then the wrapped function will always return a promise
	 * @default `false`
	 */
	defer?: boolean | number;
}

export interface WaitOptions<F extends Function = Function> extends WaitDecoratorOptions {
	/**
	 * Function to wrap
	 */
	fn: F;
}
