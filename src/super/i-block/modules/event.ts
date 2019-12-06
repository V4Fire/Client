/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, {

	AsyncOnOptions,
	AsyncOnceOptions,
	ClearOptionsId,
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
		params: AsyncOnOptions<CTX>,
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
		params: AsyncOnceOptions<CTX>,
		...args: unknown[]
	): L;

	promisifyOnce<T = unknown>(events: CanArray<string>, ...args: unknown[]): Promise<CanUndef<T>>;
	promisifyOnce<T = unknown>(
		events: CanArray<string>,
		params: AsyncOnceOptions<CTX>,
		...args: unknown[]
	): Promise<CanUndef<T>>;

	off(id?: object): void;
	off(params: ClearOptionsId<object>): void;
}

export interface RemoteEvent<CTX extends object = Async> extends BaseEvent<CanUndef<object>, CTX> {

}

export interface Event<CTX extends object = Async> extends BaseEvent<object, CTX> {
	emit(event: string, ...args: unknown[]): boolean;
}

export interface EventFactoryParams {
	suspend?: boolean;
	remote?: boolean;
}

export interface RemoteEventFactoryParams extends EventFactoryParams {
	remote: true;
}

const
	unsuspendRgxp = /:!suspend(?:\b|$)/;

/**
 * Returns wrapped event emitter
 *
 * @param $a - async object
 * @param emitter
 * @param params - emitter parameters
 */
export function eventFactory($a: Async, emitter: EventEmitterLikeP, params?: false | EventFactoryParams): Event;

/**
 * @param $a - async object
 * @param emitter
 * @param params - emitter parameters or if true, then the return type will be RemoteEvent
 */
// tslint:disable-next-line:completed-docs
export function eventFactory(
	$a: Async,
	emitter: EventEmitterLikeP,
	params: true | RemoteEventFactoryParams
): RemoteEvent;

// tslint:disable-next-line:completed-docs
export function eventFactory($a: Async, emitter: EventEmitterLikeP, params?: boolean | EventFactoryParams): Event {
	const
		p = Object.isObject(params) ? params : {remote: Boolean(params)};

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
