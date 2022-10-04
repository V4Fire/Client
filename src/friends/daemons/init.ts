/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { asyncOptionsKeys } from 'core/async';
import type Daemons from 'friends/daemons/class';

import { createDaemonWrappedFn } from 'friends/daemons/create';
import type { DaemonHookOptions, DaemonWatcher } from 'friends/daemons/interface';

/**
 * Runs a daemon by the given name with the passed arguments
 *
 * @param name
 * @param args
 */
export function run<R = unknown>(this: Daemons, name: string, ...args: unknown[]): CanUndef<R> {
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

	const asyncOptions = {
		group: `daemons:${this.ctx.componentName}`,
		label: `daemons:${name}`,
		...Object.select(daemon, asyncOptionsKeys)
	};

	if (asyncOptions.label == null) {
		Object.delete(asyncOptions, 'label');
	}

	ctx.async.setImmediate(() => fn.apply(ctx, args), Object.cast(asyncOptions));
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

		const
			hooks = Object.isPlainObject(daemon.hook) ? Object.keys(daemon.hook) : daemon.hook;

		hooks?.forEach((hook) => {
			const params = {
				after: Object.isPlainObject(daemon.hook) ? new Set<string>(...[].concat(daemon.hook[hook])) : undefined
			};

			attachHook.call(this, name, hook, params);
		});

		daemon.watch?.forEach((watcher) => attachWatcher.call(this, name, watcher));
	});
}

/**
 * Attaches the given component hook for a demon by the specified name
 *
 * @param name
 * @param hook
 * @param [opts] - additional options
 */
export function attachHook(this: Daemons, name: string, hook: string, opts?: DaemonHookOptions): void {
	this.ctx.meta.hooks[hook].push({
		fn: () => run.call(this, name),
		...opts
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
		{watchers} = this.ctx.meta;

	const
		watchName = Object.isSimpleObject(watcher) ? watcher.field : watcher,
		watchParams = Object.isPlainObject(watcher) ? Object.reject(watcher, 'field') : {};

	const watchDaemon = {
		handler: (...args) => run.call(this, name, ...args),
		method: name,
		args: [],
		...watchParams
	};

	const
		w = watchers[watchName];

	if (w) {
		w.push(watchDaemon);

	} else {
		watchers[watchName] = [watchDaemon];
	}
}
