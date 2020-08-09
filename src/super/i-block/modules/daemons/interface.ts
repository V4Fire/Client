/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Group, Label, Join } from 'core/async';
import { Hook, WatchOptions } from 'core/component';

import iBlock from 'super/i-block';
import { ComponentStatus } from 'super/i-block/interface';

export interface DaemonsAsyncOptions {
	group?: Group;
	label?: Nullable<Label>;
	join?: Join;
}

export type DaemonHookObject = {
	[P in keyof Record<Hook, string>]?: CanArray<string>;
};

export type DaemonHook =
	Hook[] |
	DaemonHookObject;

export interface DaemonFn<
	CTX extends iBlock = iBlock,
	ARGS extends any[] = any[],
	R = unknown
> {
	(this: CTX['unsafe'], ...args: ARGS): R;
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
	CTX extends iBlock = iBlock,
	ARGS extends any[] = any[],
	R = unknown
> {
	(this: CTX['unsafe'], ...args: ARGS): CanPromise<R>;
}

export interface Daemon<CTX extends iBlock = iBlock> {
	hook?: DaemonHook;
	watch?: DaemonWatcher[];
	wait?: ComponentStatus;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
	wrappedFn?: WrappedDaemonFn<CTX>;
	fn: DaemonFn<CTX>;
}

export interface SpawnedDaemonObject<CTX extends iBlock = iBlock> {
	fn: WrappedDaemonFn<CTX>;
	wait?: ComponentStatus;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOptions;
}

export type SpawnedDaemon<CTX extends iBlock = iBlock> =
	SpawnedDaemonObject<CTX> |
	WrappedDaemonFn<CTX>;

export type DaemonsDict<CTX extends iBlock = iBlock> = Dictionary<Daemon<CTX>>;
