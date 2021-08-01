/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/daemons/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import { wait } from 'super/i-block/modules/decorators';

import type {

	Daemon,
	SpawnedDaemon,

	DaemonsDict,
	DaemonWatcher,

	DaemonHook,
	DaemonHookOptions

} from 'super/i-block/modules/daemons/interface';

export * from 'super/i-block/modules/daemons/interface';

/**
 * Class to manage component daemons
 */
export default class Daemons extends Friend {
	//#if runtime has component/daemons

	/**
	 * Creates a new daemon dictionary with extending from the specified parent and returns it
	 *
	 * @param base
	 * @param [parent]
	 */
	static createDaemons<CTX extends iBlock = iBlock>(
		base: DaemonsDict,
		parent?: DaemonsDict
	): DaemonsDict<CTX['unsafe']> {
		const
			mixedDaemons = {...parent, ...base};

		if (parent) {
			for (let keys = Object.keys(parent), i = 0; i < keys.length; i++) {
				const
					daemonName = keys[i],
					parentDaemon = parent[daemonName],
					daemon = base[daemonName];

				if (daemon && parentDaemon) {
					mixedDaemons[daemonName] = mergeDaemons(daemon, parentDaemon);
				}
			}
		}

		return mixedDaemons;
	}

	/**
	 * Map of component daemons
	 */
	protected get daemons(): DaemonsDict<this['CTX']> {
		return (<typeof iBlock>this.ctx.instance.constructor).daemons;
	}

	constructor(component: any) {
		super(component);
		this.init();
	}

	/**
	 * Returns true if a daemon by the specified name is exist
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
	spawn(name: string, spawned: SpawnedDaemon<this['CTX']>): boolean {
		const
			exists = this.isExists(name);

		if (exists) {
			return false;
		}

		spawned = Object.isFunction(spawned) ? {fn: spawned} : spawned;
		return this.register(name, this.wrapDaemonFn(<Daemon>spawned));
	}

	/**
	 * Runs a daemon with the specified arguments
	 *
	 * @param name
	 * @param args
	 */
	run<R = unknown>(name: string, ...args: unknown[]): CanUndef<R> {
		const
			{ctx} = this;

		const
			daemon = this.get(name);

		if (!daemon) {
			return;
		}

		const
			fn = daemon.wrappedFn ?? daemon.fn;

		if (daemon.immediate !== true) {
			const asyncOptions = {
				group: `daemons:${this.ctx.componentName}`,
				label: `daemons:${name}`,
				...daemon.asyncOptions
			};

			if (asyncOptions.label == null) {
				Object.delete(asyncOptions, 'label');
			}

			ctx.async.setImmediate(() => fn.apply(ctx, args), <any>asyncOptions);

		} else {
			return fn.apply(ctx, args);
		}
	}

	/**
	 * Returns a daemon by the specified name
	 * @param name
	 */
	protected get(name: string): CanUndef<Daemon<this['CTX']>> {
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
	 * Creates a wrapped function for the specified daemon
	 * @param daemon
	 */
	protected wrapDaemonFn<T extends Daemon>(daemon: T): T {
		daemon.wrappedFn = daemon.wait != null ? wait(daemon.wait, daemon.fn) : daemon.fn;
		return daemon;
	}

	/**
	 * Binds the specified daemon to a component lifecycle
	 *
	 * @param hook
	 * @param name
	 * @param [opts] - additional options
	 */
	protected bindToHook(hook: string, name: string, opts?: DaemonHookOptions): void {
		const
			{hooks} = this.ctx.meta;

		hooks[hook].push({
			fn: () => this.run(name),
			...opts
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
			{watchers} = this.ctx.meta;

		const
			watchName = Object.isSimpleObject(watch) ? watch.field : watch,
			watchParams = Object.isPlainObject(watch) ? Object.reject(watch, 'field') : {};

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
	 * Initializes all static daemons
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
				hooks = Object.isPlainObject(daemon.hook) ? Object.keys(daemon.hook) : daemon.hook;

			if (hooks) {
				for (let i = 0; i < hooks.length; i++) {
					const
						hook = hooks[i];

					const params = {
						after: Object.isPlainObject(daemon.hook) ? new Set<string>(...[].concat(daemon.hook[hook])) : undefined
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

	//#endif
}

/**
 * Merge the two specified daemons to a new object and returns it
 *
 * @param base
 * @param parent
 */
export function mergeDaemons(base: Daemon, parent: Daemon): Daemon {
	const
		hook = mergeHooks(base, parent),
		watch = (parent.watch ?? []).union(base.watch ?? []);

	return {
		...parent,
		...base,
		hook,
		watch
	};
}

/**
 * Merge hooks of two specified daemons to a new object and returns it
 *
 * @param base
 * @param parent
 */
export function mergeHooks(base: Daemon, parent: Daemon): CanUndef<DaemonHook> {
	const
		{hook: aHooks} = base,
		{hook: bHooks} = parent;

	if (!aHooks && !bHooks) {
		return;
	}

	const
		convertHooksToObject = (h) => Array.isArray(h) ? h.reduce((acc, a) => (acc[a] = undefined, acc), {}) : h;

	return {
		...convertHooksToObject(bHooks),
		...convertHooksToObject(aHooks)
	};
}
