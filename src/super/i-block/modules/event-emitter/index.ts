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

import Async from 'core/async';

import { unsuspendRgxp, emitLikeEvents } from 'super/i-block/modules/event-emitter/const';
import {

	EventEmitterLikeP,
	EventEmitterWrapOptions,
	ReadonlyEventWrapOptions,
	EventEmitter,
	ReadonlyEventEmitter

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
	opts?: false | EventEmitterWrapOptions
): EventEmitter;

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
	opts: true | ReadonlyEventWrapOptions
): ReadonlyEventEmitter;

export function wrapEventEmitter(
	$a: Async,
	emitter: EventEmitterLikeP,
	opts?: boolean | EventEmitterWrapOptions
): EventEmitter {
	const
		p = Object.isPlainObject(opts) ? opts : {remote: Boolean(opts)};

	const group = (p) => {
		const
			group = p ? p.group : '';

		if (!Object.isString(group) || unsuspendRgxp.test(group)) {
			return p;
		}

		return {...p, group: `${group}:suspend`};
	};

	const wrappedEmitter = {
		on: (event, fn, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (!e) {
				return;
			}

			if (p.suspend) {
				params = group(params);
			}

			return $a.on(e, event, fn, params, ...args);
		},

		once: (event, fn, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (!e) {
				return;
			}

			if (p.suspend) {
				params = group(params);
			}

			return $a.once(e, event, fn, params, ...args);
		},

		promisifyOnce: (event, params, ...args) => {
			let
				e = emitter;

			if (Object.isFunction(e)) {
				e = e();
			}

			if (!e) {
				return Promise.resolve();
			}

			if (p.suspend) {
				params = group(params);
			}

			return $a.promisifyOnce(e, event, params, ...args);
		},

		off: (params) => {
			$a.off(group(params));
		}
	};

	if (!p.remote) {
		(<EventEmitter>wrappedEmitter).emit = (event, ...args) => {
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

	return <EventEmitter>wrappedEmitter;
}
