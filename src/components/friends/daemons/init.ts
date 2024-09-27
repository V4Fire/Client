/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { asyncOptionsKeys } from 'core/async';
import type { WatchObject } from 'core/component';

import type Daemons from 'components/friends/daemons/class';
import { createDaemonWrappedFn } from 'components/friends/daemons/create';
import type { DaemonWatcher } from 'components/friends/daemons/interface';

/**
 * Runs a daemon by the given name with the passed arguments
 *
 * @param name
 * @param args
 */
export function run<T = unknown>(this: Daemons, name: string, ...args: unknown[]): CanUndef<T> {
	const
		{ctx} = this;

	const
		daemon = this.daemons[name];

	if (daemon == null) {
		return;
	}

	const
		fn = daemon.wrappedFn ?? daemon.fn;

	if (daemon.immediate === true) {
		return fn.apply(ctx, args);
	}

	const asyncOps = {
		group: `daemons:${this.ctx.componentName}`,
		label: `daemons:${name}`,
		...Object.select(daemon, asyncOptionsKeys)
	};

	if (asyncOps.label == null) {
		Object.delete(asyncOps, 'label');
	}

	ctx.async.setImmediate(() => fn.apply(ctx, args), Object.cast(asyncOps));
}

/**
 * Initializes all static daemons
 */
export function init(this: Daemons): void {
	Object.entries(this.daemons).forEach(([name, daemon]) => {
		if (daemon == null) {
			return;
		}

		createDaemonWrappedFn.call(this, daemon);

		Array.concat([], daemon.hook).forEach((hook) => {
			attachHook.call(this, name, hook);
		});

		Array.concat([], daemon.watch).forEach((watcher) => {
			attachWatcher.call(this, name, watcher);
		});
	});
}

/**
 * Attaches the given component hook for a demon by the specified name
 *
 * @param name
 * @param hook
 */
export function attachHook(this: Daemons, name: string, hook: string): void {
	this.meta.hooks[hook].push({
		fn: () => {
			run.call(this, name);
		}
	});
}

/**
 * Attaches the given component watcher for a demon by the specified name
 *
 * @param name
 * @param watcher
 */
export function attachWatcher(this: Daemons, name: string, watcher: DaemonWatcher): void {
	const
		daemon = this.daemons[name];

	if (daemon == null) {
		return;
	}

	const
		{watchers} = this.ctx.meta;

	const
		watchPath = Object.isPlainObject(watcher) ? watcher.path : watcher,
		watchParams = Object.isDictionary(watcher) ? Object.reject(watcher, 'path') : {};

	const watchDaemon: WatchObject = {
		handler: (...args) => run.call(this, name, ...args),
		method: name,
		args: [],
		...watchParams
	};

	if (daemon.immediate) {
		watchDaemon.flush = 'sync';
	}

	const w = watchers.get(watchPath) ?? [];
	watchers.set(watchPath, w);

	w.push(watchDaemon);
}
