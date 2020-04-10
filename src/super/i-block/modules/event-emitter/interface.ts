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

export interface ReadonlyEventEmitterWrapper<CTX extends object = Async> {
	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): object;

	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnOptions<CTX>,
		...args: unknown[]
	): object;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): object;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnceOptions<CTX>,
		...args: unknown[]
	): object;

	promisifyOnce<T = unknown>(events: CanArray<string>, ...args: unknown[]): Promise<CanUndef<T>>;
	promisifyOnce<T = unknown>(
		events: CanArray<string>,
		params: AsyncOnceOptions<CTX>,
		...args: unknown[]
	): Promise<CanUndef<T>>;

	off(id?: object): void;
	off(params: ClearOptionsId<object>): void;
}

export interface EventEmitterWrapper<CTX extends object = Async> extends ReadonlyEventEmitterWrapper<CTX> {
	emit(event: string, ...args: unknown[]): boolean;
}

export interface EventEmitterWrapperOptions {
	suspend?: boolean;
	readonly?: boolean;
}

export interface ReadonlyEventEmitterWrapperOptions extends EventEmitterWrapperOptions {
	readonly: true;
}
