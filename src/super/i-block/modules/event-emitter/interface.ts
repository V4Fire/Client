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

export interface EventEmitterLike extends AsyncEventEmitterLike {
	fire?: Function;
	emit?: Function;
	dispatch?: Function;
	dispatchEvent?: Function;
}

export type EventEmitterLikeP = CanUndef<
	EventEmitterLike |
	(() => CanUndef<EventEmitterLike>)
>;

export interface BaseEventEmitter<L, CTX extends object> {
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

export interface ReadonlyEventEmitter<CTX extends object = Async> extends BaseEventEmitter<CanUndef<object>, CTX> {

}

export interface EventEmitter<CTX extends object = Async> extends BaseEventEmitter<object, CTX> {
	emit(event: string, ...args: unknown[]): boolean;
}

export interface EventEmitterWrapOptions {
	suspend?: boolean;
	remote?: boolean;
}

export interface ReadonlyEventWrapOptions extends EventEmitterWrapOptions {
	remote: true;
}
