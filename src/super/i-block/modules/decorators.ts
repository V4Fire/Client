/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { statuses } from 'super/i-block/i-block';
import { AsyncOpts } from 'core/async';
import { InitFieldFn as BaseInitFieldFn } from 'core/component'

import {

	ComponentMethod,
	MethodWatchers,

	p as pDecorator,
	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator,

	FieldWatcher as BaseFieldWatcher,
	ComponentProp as BaseComponentProp,
	ComponentField as BaseComponentField

} from 'core/component/decorators/base';

export interface InitFieldFn<T = iBlock> extends BaseInitFieldFn<T> {}
export type FieldWatcher<T = iBlock, A = any, B = A> = BaseFieldWatcher<T, A, B>;
export interface ComponentProp<T = iBlock, A = any, B = A> extends BaseComponentProp<T, A, B> {}
export interface ComponentField<T = iBlock, A = any, B = A> extends BaseComponentField<T, A, B> {}

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const p = pDecorator as (params?: ComponentProp | ComponentField | ComponentMethod) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const prop = propDecorator as (params?: Function | ObjectConstructor | ComponentProp) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const field = fieldDecorator as (params?: InitFieldFn | ComponentField) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const system = systemDecorator as (params?: InitFieldFn | ComponentField) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const watch = watchDecorator as (params?: FieldWatcher | MethodWatchers) => Function;

/**
 * Decorates a method or a function for using with the specified init status
 *
 * @see Async.wait
 * @decorator
 * @param status
 * @param [params] - additional parameters:
 *   *) [params.fn] - callback function
 *   *) [params.defer] - if true, then the function will always return a promise
 */
export function wait(
	status: number | string,
	params: AsyncOpts & {fn?: Function; defer?: boolean | number} | Function

) {
	let {
		join,
		label,
		group,
		defer,
		fn
	} = typeof params !== 'function' ? params : <Dictionary>{};

	if (Object.isString(status)) {
		status = statuses[status];
	}

	let
		handler = <Function>(fn || params);

	/** @this {iBlock} */
	function wrapper() {
		const
			args = arguments;

		if (join === undefined) {
			join = handler.length ? 'replace' : true;
		}

		const
			{async: $a, block: $b} = this,
			p = {join, label, group};

		function reject(err) {
			if (err.type !== 'clear') {
				throw err;
			}
		}

		if ($b) {
			if (status > 0 && $b.status < 0) {
				return;
			}

			if ($b.status >= status) {
				if (defer) {
					return $a.promise(
						(async () => {
							await $a.nextTick();
							return handler.apply(this, args);
						})(),

						p
					).catch(reject);
				}

				return handler.apply(this, args);
			}
		}

		return $a.promise(
			new Promise((resolve) =>
				this.localEvent.once(`block.status.${statuses[status]}`, () => resolve(handler.apply(this, args)))
			),

			p
		).catch(reject);
	}

	if (Object.isFunction(handler)) {
		return wrapper;
	}

	return (target, key, descriptors) => {
		handler = descriptors.value;
		descriptors.value = wrapper;
	};
}
