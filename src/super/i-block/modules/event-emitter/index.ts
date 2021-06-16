/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/event-emitter/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import Async, { addSuspendingGroup } from 'core/async';
import { emitLikeEvents } from 'super/i-block/modules/event-emitter/const';

import type {

	EventEmitterLikeP,
	EventEmitterWrapperOptions,
	ReadonlyEventEmitterWrapperOptions,
	EventEmitterWrapper,
	ReadonlyEventEmitterWrapper

} from 'super/i-block/modules/event-emitter/interface';

export * from 'super/i-block/modules/event-emitter/interface';

/**
 * Wraps the specified event emitter with async
 *
 * @param $a - async object
 * @param emitter
 * @param [opts] - additional options or false
 */
export function wrapEventEmitter(
	$a: Async,
	emitter: EventEmitterLikeP,
	opts?: false | EventEmitterWrapperOptions
): EventEmitterWrapper;

/**
 * Wraps the specified event emitter with async
 *
 * @param $a - async object
 * @param emitter
 * @param opts - additional options or true
 */
export function wrapEventEmitter(
	$a: Async,
	emitter: EventEmitterLikeP,
	opts: true | ReadonlyEventEmitterWrapperOptions
): ReadonlyEventEmitterWrapper;

export function wrapEventEmitter(
	$a: Async,
	emitter: EventEmitterLikeP,
	opts?: boolean | EventEmitterWrapperOptions
): EventEmitterWrapper {
	const
		p = Object.isPlainObject(opts) ? opts : {readonly: Boolean(opts)};

	const wrappedEmitter = {
		on: (event, fn, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return;
			}

			const normalizedParams = p.suspend ?
				addSuspendingGroup(params) :
				params;

			const
				link = $a.on(e, event, fn, normalizedParams, ...args);

			if (p.suspend && link != null) {
				$a.worker(() => $a.off(link), params);
			}

			return link;
		},

		once: (event, fn, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return;
			}

			const normalizedParams = p.suspend ?
				addSuspendingGroup(params) :
				params;

			const
				link = $a.once(e, event, fn, normalizedParams, ...args);

			if (p.suspend && link != null) {
				$a.worker(() => $a.off(link), params);
			}

			return link;
		},

		promisifyOnce: (event, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return Promise.resolve();
			}

			const normalizedParams = p.suspend ?
				addSuspendingGroup(params) :
				params;

			return new SyncPromise((resolve, reject) => {
				const link = $a.once(<any>e, event, resolve, {
					...normalizedParams,
					promise: true,
					onClear: $a.onPromiseClear(resolve, reject),
					onMerge: $a.onPromiseMerge(resolve, reject)
				}, ...args);

				if (p.suspend && link != null) {
					$a.worker(() => $a.off(link), params);
				}
			});
		},

		off: (params) => {
			$a.off(addSuspendingGroup(params));
		}
	};

	if (!p.readonly) {
		(<EventEmitterWrapper>wrappedEmitter).emit = (event, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (!e) {
				return;
			}

			for (let i = 0; i < emitLikeEvents.length; i++) {
				const
					key = emitLikeEvents[i];

				if (Object.isFunction(e[key])) {
					return e[key](event, ...args);
				}
			}
		};
	}

	return <EventEmitterWrapper>wrappedEmitter;
}
