/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Group, Label, Join } from 'core/async';
import type { Hook, MethodWatcher } from 'core/component';

import type iBlock from 'super/i-block';
import type { ComponentStatus } from 'super/i-block';

export interface Daemon<CTX extends iBlock = iBlock> {
	/**
	 * A function that is called by the daemon.
	 * The function context is the component that the daemon is bound to.
	 * The function arguments are taken from the handlers that the daemon is binding on.
	 */
	fn: DaemonFn<CTX>;

	/**
	 * If true, the daemon function is called immediately when the listener event fires
	 * @default `false`
	 */
	immediate?: boolean;

	/**
	 * A component hook (or hooks) on which the daemon function should be called
	 */
	hook?: CanArray<Hook>;

	/**
	 * A path (or paths) to the component property or event on which the daemon function should be called
	 * @see `core/component/decorators/watch`
	 */
	watch?: CanArray<DaemonWatcher>;

	/**
	 * Sets the `componentStatus` value for the associated component on which the daemon function can be called
	 * @see `super/i-block/modules/decorators`
	 */
	wait?: ComponentStatus;

	/**
	 * A name of the group the daemon belongs to.
	 * The parameter is provided to [[Async]].
	 */
	group?: Group;

	/**
	 * A label associated with the daemon.
	 * The parameter is provided to [[Async]].
	 */
	label?: Nullable<Label>;

	/**
	 * A strategy type to join conflict tasks.
	 * The parameter is provided to [[Async]].
	 */
	join?: Join;
}

export interface WrappedDaemon extends Omit<Daemon, 'hook' | 'watch'> {
	hook: Hook[];
	watch: DaemonWatcher[];
	wrappedFn?: WrappedDaemonFn;
}

export type DaemonsDict<CTX extends iBlock = iBlock> = Dictionary<Daemon<CTX>>;
export type WrappedDaemonsDict = Dictionary<WrappedDaemon>;

export type DaemonWatcher =
	string |
	MethodWatcher & {path: string};

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
