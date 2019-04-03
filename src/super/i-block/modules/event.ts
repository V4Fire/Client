/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, {

	AsyncOnOpts,
	AsyncOnceOpts,
	ClearOptsId,
	ProxyCb,
	EventEmitterLike as AsyncEventEmitterLike

} from 'core/async';

interface EventEmitterLike extends AsyncEventEmitterLike {
	fire?: Function;
	emit?: Function;
	dispatch?: Function;
	dispatchEvent?: Function;
}

type EventEmitterLikeP = CanUndef<
	EventEmitterLike |
	(() => CanUndef<EventEmitterLike>)
>;

const emitLikeEvents = [
	'emit',
	'fire',
	'dispatch',
	'dispatchEvent'
];

export interface BaseEvent<L, CTX extends object> {
	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): L;

	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnOpts<CTX>,
		...args: unknown[]
	): L;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): L;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): L;

	promisifyOnce<T = unknown>(events: CanArray<string>, ...args: unknown[]): Promise<CanUndef<T>>;
	promisifyOnce<T = unknown>(
		events: CanArray<string>,
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): Promise<CanUndef<T>>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export interface RemoteEvent<CTX extends object = Async> extends BaseEvent<CanUndef<object>, CTX> {

}

export interface Event<CTX extends object = Async> extends BaseEvent<object, CTX> {
	emit(event: string, ...args: unknown[]): boolean;
}

/**
 * Returns wrapped event emitter
 *
 * @param $a - async object
 * @param emitter
 */
export function eventFactory($a: Async, emitter: EventEmitterLikeP): Event;

/**
 * @param $a - async object
 * @param emitter
 * @param remote - if true, then the return type will be RemoteEvent
 */
// tslint:disable-next-line:completed-docs
export function eventFactory($a: Async, emitter: EventEmitterLikeP, remote: true): RemoteEvent;
// tslint:disable-next-line:completed-docs
export function eventFactory($a: Async, emitter: EventEmitterLikeP, remote?: boolean): Event {
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

			return $a.promisifyOnce(e, event, params, ...args);
		},

		off: (...args) => {
			$a.off(...args);
		}
	};

	if (!remote) {
		(<Event>wrappedEmitter).emit = (event, ...args) => {
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

	return <Event>wrappedEmitter;
}
