/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { Hook, WatchOptions } from 'core/component';

import iBlock from 'super/i-block';
import { ComponentStatus } from 'super/i-block/interface';

export interface DaemonsAsyncOptions {
	group?: AsyncOptions['group'];
	label?: Nullable<AsyncOptions['label']>;
	join?: AsyncOptions['join'];
}

export type DaemonHookObject = {
	[P in keyof Record<Hook, string>]?: CanArray<string>;
};

export type DaemonHook =
	Hook[] |
	DaemonHookObject;

export interface DaemonFn<
	CTX extends iBlock = iBlock['unsafe'],
	ARGS extends unknown[] = unknown[],
	R = unknown
> {
	(this: CTX, ...args: ARGS): R;
}

export interface DaemonHookOptions {
	after: CanUndef<Set<string>>;
}

export interface DaemonWatchOptions extends WatchOptions {
	field: string;
}

export type DaemonWatcher =
	DaemonWatchOptions |
	string;

export interface WrappedDaemonFn<
	CTX extends iBlock = iBlock['unsafe'],
	ARGS extends unknown[] = unknown[],
	R = unknown
> {
	(this: CTX, ...args: ARGS): CanPromise<R>;
}

export interface Daemon<CTX extends iBlock = iBlock['unsafe']> {
	hook?: DaemonHook;
	watch?: DaemonWatcher[];
	wait?: ComponentStatus;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
	wrappedFn?: WrappedDaemonFn<CTX>;
	fn: DaemonFn<CTX>;
}

export interface SpawnedDaemonObject<CTX extends iBlock = iBlock['unsafe']> {
	fn: WrappedDaemonFn<CTX>;
	wait?: ComponentStatus;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
}

export type SpawnedDaemon<CTX extends iBlock = iBlock['unsafe']> =
	SpawnedDaemonObject<CTX> |
	WrappedDaemonFn<CTX>;

export type DaemonsDict<CTX extends iBlock = iBlock['unsafe']> = Dictionary<Daemon<CTX>>;
