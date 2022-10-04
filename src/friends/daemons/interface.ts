/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Group, Label, Join } from 'core/async';
import type { Hook, WatchOptions } from 'core/component';

import type iBlock from 'super/i-block';
import type { ComponentStatus } from 'super/i-block';

export interface Daemon<CTX extends iBlock = iBlock> {
	fn: DaemonFn<CTX>;
	immediate?: boolean;

	hook?: DaemonHook;
	watch?: DaemonWatcher[];
	wait?: ComponentStatus;

	group?: Group;
	label?: Nullable<Label>;
	join?: Join;
}

export interface WrappedDaemon<CTX extends iBlock = iBlock> extends Daemon<CTX> {
	wrappedFn?: WrappedDaemonFn<CTX>;
}

export type DaemonsDict<CTX extends iBlock = iBlock> = Dictionary<Daemon<CTX>>;
export type WrappedDaemonsDict<CTX extends iBlock = iBlock> = Dictionary<WrappedDaemon<CTX>>;


export type DaemonHook =
	Hook[] |
	DaemonHookObject;

export interface DaemonHookOptions {
	after: CanUndef<Set<string>>;
}

export type DaemonHookObject = {
	[P in keyof Record<Hook, string>]?: CanArray<string>;
};

export interface DaemonWatchOptions extends WatchOptions {
	field: string;
}

export type DaemonWatcher =
	DaemonWatchOptions |
	string;

export interface DaemonFn<
	CTX extends iBlock = iBlock,
	ARGS extends any[] = any[],
	R = unknown
> {
	(this: CTX['unsafe'], ...args: ARGS): R;
}

export interface WrappedDaemonFn<
	CTX extends iBlock = iBlock,
	ARGS extends any[] = any[],
	R = unknown
> {
	(this: CTX['unsafe'], ...args: ARGS): CanPromise<R>;
}
