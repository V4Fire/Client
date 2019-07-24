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

export type DaemonHookObject = {
	[P in keyof Record<Hooks, string>]?: CanArray<string>;
};

export interface DaemonsAsyncOpts {
	label?: Nullable<AsyncOpts['label']>;
	group?: AsyncOpts['group'];
	join?: AsyncOpts['join'];
}

export interface Daemon {
	hook?: Hooks[] | DaemonHookObject;
	watch?: DaemonWatcher[];
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOpts;
	wrappedFn?: Function;
	fn: Function;
}

export interface DaemonSpawnedObj {
	fn: Function;
	wait?: Statuses;
	immediate?: boolean;
	asyncOptions?: DaemonsAsyncOpts;
}

export interface DaemonHookParams {
	after: CanUndef<Set<string>>;
}

export type DaemonWatcher = DaemonWatchObject | string;
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
			daemon = this.get(name);

		if (!daemon) {
			return;
		}

		const
			// @ts-ignore
			{async: $a} = ctx;

		const
			fn = daemon.wrappedFn || daemon.fn;

		if (daemon.immediate !== true) {
			const asyncOptions = {
				group: `daemons-${this.component.componentName}`,
				label: `daemons-${name}`,
				...daemon.asyncOptions
			};

			if (asyncOptions.label === null) {
				delete asyncOptions.label;
			}

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
	 * @param [params]
	 */
	protected bindToHook(hook: string, name: string, params?: DaemonHookParams): void {
		const
			// @ts-ignore (access)
			{hooks} = this.component.meta;

		hooks[hook].push({
			fn: () => this.run(name),
			...params
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
			// @ts-ignore (access)
			{watchers} = this.component.meta;

		const
			watchName = Object.isSimpleObject(watch) ? watch.field : watch,
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

			const
				hooks = Object.isObject(daemon.hook) ? Object.keys(daemon.hook) : daemon.hook;

			if (hooks) {
				for (let i = 0; i < hooks.length; i++) {
					const
						hook = hooks[i];

					const params = {
						after: Object.isObject(daemon.hook) ? new Set<string>(...[].concat(daemon.hook[hook])) : undefined
					};

					this.bindToHook(hook, name, params);
				}
			}

			if (daemon.watch) {
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
		hook = mergeHooks(a, b),
		watch = (b.watch || []).union(a.watch || []);

	return {
		...b,
		...a,
		hook,
		watch
	};
}

/**
 * Merge daemons hooks
 *
 * @param a - base daemon hooks
 * @param b - parent daemon hooks
 */
function mergeHooks(a: Daemon, b: Daemon): CanUndef<DaemonHookObject | Hooks[]> {
	const
		{hook: aHooks} = a,
		{hook: bHooks} = b;

	if (!aHooks && !bHooks) {
		return;
	}

	const convertHooksToObject = (h) => Array.isArray(h) ? h.reduce((acc, a) => (acc[a] = undefined, acc), {}) : h;

	return {
		...convertHooksToObject(bHooks),
		...convertHooksToObject(aHooks)
	};
}
