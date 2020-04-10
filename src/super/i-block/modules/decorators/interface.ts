/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { InitFieldFn as BaseInitFieldFn, ComponentInterface } from 'core/component';

import iBlock from 'super/i-block';
import { ComponentStatus } from 'super/i-block/interface';

import {

	DecoratorMethodWatchers as BaseMethodWatchers,
	DecoratorFieldWatcher as BaseFieldWatcher,
	DecoratorProp as BaseComponentProp,
	DecoratorField as BaseComponentField

} from 'core/component/decorators';

export type ModEventType = 'on' | 'once';

export interface InitFieldFn<
	CTX extends ComponentInterface = iBlock['unsafe']
> extends BaseInitFieldFn<CTX> {}

export type MethodWatchers<
	CTX extends ComponentInterface = iBlock['unsafe'],
	A = unknown,
	B = A
> = BaseMethodWatchers<CTX , A, B>;

export type FieldWatcher<
	CTX extends ComponentInterface = iBlock['unsafe'],
	A = unknown,
	B = A
> = BaseFieldWatcher<CTX, A, B>;

export interface ComponentProp<
	CTX extends ComponentInterface = iBlock['unsafe'],
	A = unknown,
	B = A
> extends BaseComponentProp<CTX, A, B> {}

export interface ComponentField<
	CTX extends ComponentInterface = iBlock['unsafe'],
	A = unknown,
	B = A
> extends BaseComponentField<CTX, A, B> {}

export type WaitStatuses =
	number |
	string |
	ComponentStatus;

export type WaitFn<
	ARGS extends unknown[] = unknown[],
	R = unknown
> = (...args: ARGS) => R;

export interface WaitDecoratorOptions extends AsyncOptions {
	/**
	 * If true, then the wrapped function will always return a promise
	 * @default `false`
	 */
	defer?: boolean | number;
}

export interface WaitOptions<F extends WaitFn = WaitFn> extends WaitDecoratorOptions {
	/**
	 * Function to wrap
	 */
	fn: F;
}

export type DecoratorCtx<CTX> = {component: CTX} | CTX;
