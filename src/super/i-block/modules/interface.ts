/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts, AsyncOnOpts, AsyncOnceOpts, ClearOptsId, ProxyCb } from 'core/async';
import { ModVal, WatchOptions } from 'core/component';

export type Classes = Dictionary<string | Array<string | true> | true>;

export interface LinkWrapper<V = unknown, R = unknown> {
	(value: V, oldValue?: V): R;
}

export type WatchObjectField<T = unknown> =
	string |
	[string] |
	[string, string] |
	[string, LinkWrapper<T, any>] |
	[string, string, LinkWrapper<T, any>];

export type WatchObjectFields<T = unknown> = Array<WatchObjectField<T>>;

export type BindModCb<V = unknown, R = unknown, CTX extends iBlock = iBlock> =
	((value: V, ctx: CTX) => R) | Function;

export interface SizeTo {
	gt: Dictionary<Size>;
	lt: Dictionary<Size>;
}

export type Size = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<Dictionary<SyncLink<T>>>;
export type ModsTable = Dictionary<ModVal>;
export type ModsNTable = Dictionary<CanUndef<string>>;

export type Statuses =
	'destroyed' |
	'inactive' |
	'loading' |
	'beforeReady' |
	'ready' |
	'unloaded';

export interface WaitStatusOpts extends AsyncOpts {
	defer?: boolean;
}

export interface AsyncTaskObjectId {
	id: AsyncTaskSimpleId;
	weight?: number;
	filter?(id: AsyncTaskSimpleId): boolean;
}

export type ParentMessageFields =
	'instanceOf' |
	'globalName' |
	'componentName' |
	'componentId';

export interface ParentMessage<T = iBlock> {
	check: [ParentMessageFields, unknown];
	action(this: T): Function;
}

export type AsyncTaskSimpleId = string | number;
export type AsyncTaskId = AsyncTaskSimpleId | (() => AsyncTaskObjectId) | AsyncTaskObjectId;
export type AsyncQueueType = 'asyncComponents' | 'asyncBackComponents';
export type AsyncWatchOpts = WatchOptions & AsyncOpts;

export interface RemoteEvent<CTX extends object = Async> {
	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): CanUndef<object>;

	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnOpts<CTX>,
		...args: unknown[]
	): CanUndef<object>;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): CanUndef<object>;

	once<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): CanUndef<object>;

	promisifyOnce<T = unknown>(events: CanArray<string>, ...args: unknown[]): CanUndef<Promise<T>>;
	promisifyOnce<T = unknown>(
		events: CanArray<string>,
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): CanUndef<Promise<T>>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export interface Event<CTX extends object = Async> {
	emit(event: string, ...args: unknown[]): boolean;

	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		...args: unknown[]
	): object;

	on<E = unknown, R = unknown>(
		events: CanArray<string>,
		handler: ProxyCb<E, R, CTX>,
		params: AsyncOnOpts<CTX>,
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
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): object;

	promisifyOnce<T = unknown>(events: CanArray<string>, ...args: unknown[]): Promise<T>;
	promisifyOnce<T = unknown>(
		events: CanArray<string>,
		params: AsyncOnceOpts<CTX>,
		...args: unknown[]
	): Promise<T>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export type ConverterCallType = 'component' | 'remote';
export type Stage = string | number;
