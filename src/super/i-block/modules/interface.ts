/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts, AsyncOnOpts, AsyncOnceOpts, ClearOptsId } from 'core/async';
import { WatchOptions } from 'vue';
import { ModVal } from 'core/component';

export type Classes = Dictionary<string | Array<string | true> | true>;

export interface LinkWrapper<T = unknown> {
	(this: this, value: T, oldValue: CanUndef<T>): T;
}

export type WatchObjectField<T = unknown> =
	string |
	[string] |
	[string, string] |
	[string, LinkWrapper<T>] |
	[string, string, LinkWrapper<T>];

export type WatchObjectFields<T = unknown> = Array<WatchObjectField<T>>;

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
export type ModsNTable = Dictionary<string | undefined>;

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

export interface RemoteEvent<T extends object = Async> {
	on(events: CanArray<string>, handler: Function, ...args: unknown[]): CanUndef<object>;
	on(
		events: CanArray<string>,
		handler: Function,
		params: AsyncOnOpts<T>,
		...args: unknown[]
	): CanUndef<object>;

	once(events: CanArray<string>, handler: Function, ...args: unknown[]): CanUndef<object>;
	once(
		events: CanArray<string>,
		handler: Function,
		params: AsyncOnceOpts<T>,
		...args: unknown[]
	): CanUndef<object>;

	promisifyOnce(events: CanArray<string>, ...args: unknown[]): CanUndef<Promise<unknown>>;
	promisifyOnce(
		events: CanArray<string>,
		params: AsyncOnceOpts<T>,
		...args: unknown[]
	): CanUndef<Promise<unknown>>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export interface Event<T extends object = Async> {
	emit(event: string, ...args: unknown[]): boolean;

	on(events: CanArray<string>, handler: Function, ...args: unknown[]): object;
	on(
		events: CanArray<string>,
		handler: Function,
		params: AsyncOnOpts<T>,
		...args: unknown[]
	): object;

	once(events: CanArray<string>, handler: Function, ...args: unknown[]): object;
	once(
		events: CanArray<string>,
		handler: Function,
		params: AsyncOnceOpts<T>,
		...args: unknown[]
	): object;

	promisifyOnce(events: CanArray<string>, ...args: unknown[]): Promise<unknown>;
	promisifyOnce(
		events: CanArray<string>,
		params: AsyncOnceOpts<T>,
		...args: unknown[]
	): Promise<unknown>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export type ConverterCallType = 'component' | 'remote';
export type Stage = string | number;
