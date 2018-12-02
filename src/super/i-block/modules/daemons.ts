/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { wait } from 'super/i-block/modules/decorators';

import { AsyncOpts } from 'core/async';
import { WatchOptions, Hooks } from 'core/component';
import { Statuses } from 'super/i-block/modules/interface';

export interface DaemonWatchObject extends WatchOptions {
	field: string;
}

export type DaemonWatcher = DaemonWatchObject | string;

export interface Daemon {
	hook?: Hooks[];
	watch?: DaemonWatcher[];
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
	suspended?: boolean;
	wrappedFn?: Function;
	fn: Function;
}

export interface DaemonSpawnStatus {
	spawned: boolean;
	killed: boolean;
}

export interface DaemonSpawnedObj {
	fn: Function;
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
}

export type SpawnedDaemon = DaemonSpawnedObj | Function;

export type DaemonsDict = Dictionary<Daemon>;

/**
 * Merge two daemons
 *
 * @param a - base daemon
 * @param b - parent daemon
 */
function mergeDaemons(a: Daemon, b: Daemon): Daemon {
	const
	hook = [...new Set((a.hook || []).concat(b.hook || []))],
	watch = (b.watch || []).concat(a.watch || []);

	return {
		...b,
		...a,
		hook,
		watch
	};
}

export default class Daemons {
	/**
	 * Inherits base daemons from parent and returns a new object
	 *
	 * @param base
	 * @param parent
	 */
	static createDaemons(base: DaemonsDict, parent: DaemonsDict): DaemonsDict {
		const
			mixedDaemons = {...parent, ...base};

		for (let keys = Object.keys(parent), i = 0; i < keys.length; i++) {
			const
				daemonName = keys[i],
				parentDaemon = parent[daemonName],
				daemon = base[daemonName];

			if (daemon && parentDaemon) {
				mixedDaemons[daemonName] = mergeDaemons(daemon, parentDaemon);
			}
		}

		return mixedDaemons;
	}

	/**
	 * iBlock instance
	 */
	protected component: iBlock;

	/**
	 * Returns component daemons
	 */
	protected get daemons(): DaemonsDict {
		return (<typeof iBlock>this.component.instance.constructor).daemons || {};
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;

		this.init();
	}

	/**
	 * true, if daemon exists
	 * @param name
	 */
	has(name: string): boolean {
		return Boolean(this.daemons[name]);
	}

	/**
	 * Returns a specified daemon
	 * @param name
	 */
	get(name: string): CanUndef<Daemon> {
		return this.daemons[name];
	}

	/**
	 * Spawn a new daemon
	 *
	 * @param name
	 * @param spawned
	 */
	spawn(name: string, spawned: SpawnedDaemon): boolean {
		const
			daemon = this.get(name);

		if (daemon) {
			return false;
		}

		spawned = Object.isFunction(spawned) ? {fn: spawned} : spawned;
		return this.put(name, this.wrapDaemon(<Daemon>spawned));
	}

	/**
	 * Unsuspends a daemon
	 * @param name
	 */
	unsuspend(name: string): boolean {
		return this.setSuspend(name, false);
	}

	/**
	 * Suspends a daemon
	 * @param name
	 */
	suspend(name: string): boolean {
		return this.setSuspend(name, true);
	}

	/**
	 * Calls a daemon
	 *
	 * @param name
	 * @param args
	 */
	call(name: string, ...args: unknown[]): void {
		const
			ctx = this.component,
			// @ts-ignore
			{async: $a} = ctx.async,
			daemon = this.get(name);

		if (!daemon || daemon.suspended) {
			return;
		}

		const
			asyncOptions = daemon.asyncOptions,
			fn = daemon.wrappedFn || daemon.fn;

		if (daemon.immediate) {
			Object.assign(asyncOptions, {
				group: `daemons-${this.component.componentName}`,
				label: `daemons-${name}`
			});

			$a.setImmediate(() => fn.apply(ctx, args), asyncOptions);

		} else {
			fn.apply(ctx, args);
		}
	}

	/**
	 * Put daemon in daemons nest
	 *
	 * @param name
	 * @param daemon
	 */
	protected put(name: string, daemon: Daemon): boolean {
		this.daemons[name] = daemon;
		return Boolean(this.daemons[name]);
	}

	/**
	 * Sets a daemon state (suspended/not suspended)
	 *
	 * @param name
	 * @param suspend
	 */
	protected setSuspend(name: string, suspend: boolean): boolean {
		const daemon = this.daemons[name];

		if (!daemon) {
			return false;
		}

		daemon.suspended = suspend;
		return true;
	}

	/**
	 * Creates a wrappedFn for daemon
	 * @param daemon
	 */
	protected wrapDaemon(daemon: Daemon): Daemon {
		daemon.wrappedFn = daemon.wait ? wait(daemon.wait, daemon.fn) : daemon.fn;
		return daemon;
	}

	/**
	 * Bind a specified daemon to component lifecycle
	 *
	 * @param name
	 * @param daemon
	 */
	protected bindToHook(hook: string, name: string): void {
		const
			// @ts-ignore
			{hooks} = this.component.meta;

		hooks[hook].push({
			fn: () => this.call(name),
			after: undefined
		});
	}

	/**
	 * Bind a specified daemon to watchers
	 *
	 * @param name
	 * @param daemon
	 */
	protected bindToWatch(watch: DaemonWatcher, name: string): void {
		const
			// @ts-ignore
			{watchers} = this.component.meta;

		const
			watchName = Object.isObject(watch) ? watch.field : watch,
			watchParams = Object.isObject(watch) ? Object.reject(watch, 'field') : {};

		const watchDaemon = {
			handler: (...args) => this.call(name, args),
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

	/**
	 * Initializes daemons
	 */
	protected init(): void {
		const
			{daemons} = this;

		for (let keys = Object.keys(daemons), i = 0; i < keys.length; i++) {
			const
				name = keys[i],
				daemon = this.get(name);

			if (!daemon) {
				continue;
			}

			this.wrapDaemon(daemon);

			if (daemon.hook && daemon.hook.length) {
				for (let i = 0; i < daemon.hook.length; i++) {
					this.bindToHook(daemon.hook[i], name);
				}
			}

			if (daemon.watch && daemon.watch.length) {
				for (let i = 0; i < daemon.watch.length; i++) {
					this.bindToWatch(daemon.watch[i], name);
				}
			}
		}
	}
}
