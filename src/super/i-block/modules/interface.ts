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

export interface LinkWrapper {
	(this: this, value: any, oldValue: any): any;
}

export type WatchObjectField =
	string |
	[string] |
	[string, string] |
	[string, LinkWrapper] |
	[string, string, LinkWrapper];

export type WatchObjectFields = Array<WatchObjectField>;

export interface SizeTo {
	gt: Dictionary<Size>;
	lt: Dictionary<Size>;
}

export type Size = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface SyncLink {
	path: string;
	sync(value?: any): void;
}

export type SyncLinkCache = Dictionary<Dictionary<SyncLink>>;
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

export interface ParentMessage {
	check: [ParentMessageFields, any];
	action(this: iBlock): Function;
}

export type AsyncTaskSimpleId = string | number;
export type AsyncTaskId = AsyncTaskSimpleId | (() => AsyncTaskObjectId) | AsyncTaskObjectId;
export type AsyncQueueType = 'asyncComponents' | 'asyncBackComponents';
export type AsyncWatchOpts = WatchOptions & AsyncOpts;

export interface RemoteEvent<T extends object = Async> {
	on(events: string | string[], handler: Function, ...args: any[]): object | undefined;
	on(
		events: string | string[],
		handler: Function,
		params: AsyncOnOpts<T>,
		...args: any[]
	): object | undefined;

	once(events: string | string[], handler: Function, ...args: any[]): object | undefined;
	once(
		events: string | string[],
		handler: Function,
		params: AsyncOnceOpts<T>,
		...args: any[]
	): object | undefined;

	promisifyOnce(events: string | string[], ...args: any[]): Promise<any> | undefined;
	promisifyOnce(
		events: string | string[],
		params: AsyncOnceOpts<T>,
		...args: any[]
	): Promise<any> | undefined;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export interface Event<T extends object = Async> {
	emit(event: string, ...args: any[]): boolean;

	on(events: string | string[], handler: Function, ...args: any[]): object;
	on(
		events: string | string[],
		handler: Function,
		params: AsyncOnOpts<T>,
		...args: any[]
	): object;

	once(events: string | string[], handler: Function, ...args: any[]): object;
	once(
		events: string | string[],
		handler: Function,
		params: AsyncOnceOpts<T>,
		...args: any[]
	): object;

	promisifyOnce(events: string | string[], ...args: any[]): Promise<any>;
	promisifyOnce(
		events: string | string[],
		params: AsyncOnceOpts<T>,
		...args: any[]
	): Promise<any>;

	off(id?: object): void;
	off(params: ClearOptsId<object>): void;
}

export type ConverterCallType = 'component' | 'remote';
export type Stage = string | number;
