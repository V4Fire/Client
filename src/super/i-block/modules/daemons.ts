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
import { WatchOptions, Hooks, ComponentInterface } from 'core/component';
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
	wrappedFn?: Function;
	fn: Function;
}

export interface DaemonSpawnedObj {
	fn: Function;
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: AsyncOpts;
}

export type SpawnedDaemon = DaemonSpawnedObj | Function;
export type DaemonsDict = Dictionary<Daemon>;

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
	 * Component instance
	 */
	protected component: ComponentInterface<iBlock>;

	/**
	 * Returns component daemons
	 */
	protected get daemons(): DaemonsDict {
		return (<typeof iBlock>this.component.instance.constructor).daemons;
	}

	/**
	 * @param component
	 */
	constructor(component: ComponentInterface<iBlock>) {
		this.component = component;
		this.init();
	}

	/**
	 * Returns true if a daemon by the specified name exists
	 * @param name
	 */
	isExists(name: string): boolean {
		return Boolean(this.daemons[name]);
	}

	/**
	 * Spawns a new daemon
	 *
	 * @param name
	 * @param spawned
	 */
	spawn(name: string, spawned: SpawnedDaemon): boolean {
		const
			exists = this.isExists(name);

		if (exists) {
			return false;
		}

		spawned = Object.isFunction(spawned) ? {fn: spawned} : spawned;
		return this.register(name, this.wrapDaemonFn(<Daemon>spawned));
	}

	/**
	 * Calls a daemon with specified parameters
	 *
	 * @param name
	 * @param args
	 */
	run<T = unknown>(name: string, ...args: unknown[]): CanUndef<T> {
		const
			ctx = this.component,
			// @ts-ignore
			{async: $a} = ctx,
			daemon = this.get(name);

		if (!daemon) {
			return;
		}

		const
			asyncOptions = daemon.asyncOptions || {},
			fn = daemon.wrappedFn || daemon.fn;

		if (daemon.immediate !== false) {
			Object.assign(asyncOptions, {
				group: `daemons-${this.component.componentName}`,
				label: `daemons-${name}`
			});

			$a.setImmediate(() => fn.apply(ctx, args), asyncOptions);

		} else {
			return fn.apply(ctx, args);
		}
	}

	/**
	 * Returns a daemon by the specified name
	 * @param name
	 */
	protected get(name: string): CanUndef<Daemon> {
		return this.daemons[name];
	}

	/**
	 * Registers a new daemon by the specified name
	 *
	 * @param name
	 * @param daemon
	 */
	protected register(name: string, daemon: Daemon): boolean {
		this.daemons[name] = daemon;
		return Boolean(this.daemons[name]);
	}

	/**
	 * Creates a wrapped function for daemon
	 * @param daemon
	 */
	protected wrapDaemonFn(daemon: Daemon): Daemon {
		daemon.wrappedFn = daemon.wait ? wait(daemon.wait, daemon.fn) : daemon.fn;
		return daemon;
	}

	/**
	 * Binds the specified daemon to a component lifecycle
	 *
	 * @param hook
	 * @param name
	 */
	protected bindToHook(hook: string, name: string): void {
		const
			// @ts-ignore
			{hooks} = this.component.meta;

		hooks[hook].push({
			fn: () => this.run(name),
			after: undefined
		});
	}

	/**
	 * Binds the specified daemon to component watchers
	 *
	 * @param watch
	 * @param name
	 */
	protected bindToWatch(watch: DaemonWatcher, name: string): void {
		const
			// @ts-ignore
			{watchers} = this.component.meta;

		const
			watchName = Object.isObject(watch) ? watch.field : watch,
			watchParams = Object.isObject(watch) ? Object.reject(watch, 'field') : {};

		const watchDaemon = {
			handler: (...args) => this.run(name, ...args),
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

			this.wrapDaemonFn(daemon);

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

/**
 * Merge two daemons
 *
 * @param a - base daemon
 * @param b - parent daemon
 */
function mergeDaemons(a: Daemon, b: Daemon): Daemon {
	const
		hook = (a.hook || []).union(b.hook || []),
		watch = (b.watch || []).union(a.watch || []);

	return {
		...b,
		...a,
		hook,
		watch
	};
}
