/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { Hook, WatchOptions } from 'core/component';
import { Statuses } from 'super/i-block/interface';

export interface DaemonsAsyncOptions {
	group?: AsyncOptions['group'];
	label?: Nullable<AsyncOptions['label']>;
	join?: AsyncOptions['join'];
}

export type DaemonHookObject = {
	[P in keyof Record<Hook, string>]?: CanArray<string>;
};

export type DaemonHook = Hook[] | DaemonHookObject;

export interface Daemon {
	hook?: DaemonHook;
	watch?: DaemonWatcher[];
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
	wrappedFn?: Function;
	fn: Function;
}

export interface SpawnedDaemonObject {
	fn: Function;
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
}

export interface DaemonHookOptions {
	after: CanUndef<Set<string>>;
}

export interface DaemonWatchObject extends WatchOptions {
	field: string;
}

export type DaemonWatcher = DaemonWatchObject | string;
export type SpawnedDaemon = SpawnedDaemonObject | Function;
export type DaemonsDict = Dictionary<Daemon>;
