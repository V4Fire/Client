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

import Async, { wrapWithSuspending } from '@src/core/async';
import { emitLikeEvents } from '@src/super/i-block/modules/event-emitter/const';

import type {

	EventEmitterLikeP,

	EventEmitterWrapperOptions,
	ReadonlyEventEmitterWrapperOptions,

	EventEmitterWrapper,
	ReadonlyEventEmitterWrapper

} from '@src/super/i-block/modules/event-emitter/interface';

export * from '@src/super/i-block/modules/event-emitter/interface';

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
		on: (event, fn, opts, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return;
			}

			const normalizedOpts = p.suspend ?
				wrapWithSuspending(opts) :
				opts;

			return $a.on(e, event, fn, normalizedOpts, ...args);
		},

		once: (event, fn, opts, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return;
			}

			const normalizedOpts = p.suspend ?
				wrapWithSuspending(opts) :
				opts;

			return $a.once(e, event, fn, normalizedOpts, ...args);
		},

		promisifyOnce: (event, opts, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
				return Promise.resolve();
			}

			const normalizedOpts = p.suspend ?
				wrapWithSuspending(opts) :
				opts;

			return $a.promisifyOnce(e, event, normalizedOpts, ...args);
		},

		off: (opts) => {
			const normalizedOpts = p.suspend ?
				wrapWithSuspending(opts) :
				opts;

			$a.off(normalizedOpts);
		}
	};

	if (!p.readonly) {
		(<EventEmitterWrapper>wrappedEmitter).emit = (event, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (e == null) {
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
