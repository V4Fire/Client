/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import log, { LogMessageOptions } from 'core/log';
import { wrapWithSuspending, AsyncOptions, BoundFn } from 'core/async';

import { bindRemoteWatchers, component, customWatcherRgxp, RawWatchHandler, WatchPath } from 'core/component';

import { field, system, computed, hook, wait } from 'super/i-block/modules/decorators';
import { activate, deactivate } from 'super/i-block/modules/activation';

import Block from 'friends/block';
import type { AsyncWatchOptions } from 'friends/sync';

import iBlockFriends from 'super/i-block/friends';

export const
	$$ = symbolGenerator();

@component()
export default abstract class iBlockBase extends iBlockFriends {
	/**
	 * Component unique identifier
	 */
	@system({
		atom: true,
		unique: (ctx, oldCtx) => !ctx.$el?.classList.contains(oldCtx.componentId),
		init: () => `uid-${Math.random().toString().slice(2)}`
	})

	override readonly componentId!: string;

	/**
	 * True if the component is already activated
	 * @see [[iBlock.activatedProp]]
	 */
	@system((o) => {
		void o.lfc.execCbAtTheRightTime(() => {
			if (o.isFunctional && !o.field.get<boolean>('forceActivation')) {
				return;
			}

			if (o.field.get<boolean>('isActivated')) {
				o.activate(true);

			} else {
				o.deactivate();
			}
		});

		return o.sync.link('activatedProp', (val: CanUndef<boolean>) => {
			val = val !== false;

			if (o.hook !== 'beforeDataCreate') {
				o[val ? 'activate' : 'deactivate']();
			}

			return val;
		});
	})

	isActivated!: boolean;

	/**
	 * True if the component was in `ready` status at least once
	 */
	@system({unique: true})
	isReadyOnce: boolean = false;

	/**
	 * True if the current component is a functional
	 */
	@computed()
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * True if the current component is rendered by using server-side rendering
	 */
	@computed()
	get isSSR(): boolean {
		return this.$renderEngine.supports.ssr;
	}

	/**
	 * Number of `beforeReady` event listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * A list of `blockReady` listeners:
	 * it's used to optimize component initializing
	 */
	@system({unique: true})
	protected blockReadyListeners: Function[] = [];

	/**
	 * A temporary cache.
	 * Mutation of this object don't emits re-rendering of the component.
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected tmp!: Dictionary;

	/**
	 * A temporary cache.
	 * Mutation of this object emits re-rendering of the component.
	 */
	@field({merge: true})
	protected watchTmp: Dictionary = {};

	/**
	 * Cache of watched values
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected watchCache!: Dictionary;

	/**
	 * Cache object for `opt.ifOnce`
	 */
	@system({merge: true})
	protected readonly ifOnceStore: Dictionary<number> = {};

	/**
	 * Link to the current component
	 */
	@computed()
	protected get self(): this {
		return this;
	}

	/**
	 * @see [[iBlock.activatedProp]]
	 * @param [force]
	 */
	override activate(force?: boolean): void {
		activate(Object.cast(this), force);
	}

	/** @see [[iBlock.activatedProp]] */
	override deactivate(): void {
		deactivate(Object.cast(this));
	}

	/**
	 * Sets a watcher to a component/object property or event by the specified path.
	 *
	 * When you watch for some property changes, the handler function can take the second argument that refers
	 * to the old value of a property. If the object watching is non-primitive, the old value will be cloned from the
	 * original old value to avoid having two links to one object.
	 *
	 * ```typescript
	 * @component()
	 * class Foo extends iBlock {
	 *   @field()
	 *   list: Dictionary[] = [];
	 *
	 *   @watch('list')
	 *   onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   // When you don't declare the second argument in a watcher,
	 *   // the previous value isn't cloned
	 *   @watch('list')
	 *   onListChangeWithoutCloning(value: Dictionary[]): void {
	 *     // true
	 *     console.log(value === arguments[1]);
	 *     console.log(value[0] === oldValue[0]);
	 *   }
	 *
	 *   // When you watch a property in a deep and declare the second argument
	 *   // in a watcher, the previous value is cloned deeply
	 *   @watch({path: 'list', deep: true})
	 *   onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   created() {
	 *     this.list.push({});
	 *     this.list[0].foo = 1;
	 *   }
	 * }
	 * ```
	 *
	 * You need to use the special delimiter ":" within a path to listen to an event.
	 * Also, you can specify an event emitter to listen to by writing a link before ":".
	 * For instance:
	 *
	 * 1. `':onChange'` - a component will listen to its own event `onChange`;
	 * 2. `'localEmitter:onChange'` - a component will listen to an event `onChange` from `localEmitter`;
	 * 3. `'$parent.localEmitter:onChange'` - a component will listen to an event `onChange` from `$parent.localEmitter`;
	 * 4. `'document:scroll'` - a component will listen to an event `scroll` from `window.document`.
	 *
	 * A link to the event emitter is taken from component properties or the global object.
	 * The empty link '' is a link to a component itself.
	 *
	 * Also, if you listen to an event, you can manage when to start to listen to the event by using special characters
	 * at the beginning of a path string:
	 *
	 * 1. `'!'` - start to listen to an event on the "beforeCreate" hook, for example: `'!rootEmitter:reset'`;
	 * 2. `'?'` - start to listen an event on the "mounted" hook, for example: `'?$el:click'`.
	 *
	 * By default, all events start to listen on the "created" hook.
	 *
	 * To listen for changes of another watchable object, you need to specify the watch path as an object:
	 *
	 * ```
	 * {
	 *   ctx: linkToWatchObject,
	 *   path?: pathToWatch
	 * }
	 * ```
	 *
	 * @param path - path to a component property to watch or event to listen
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * // Watch for changes of `foo`
	 * this.watch('foo', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of another watchable object
	 * this.watch({ctx: anotherObject, path: 'foo'}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Deep watch for changes of `foo`
	 * this.watch('foo', {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of `foo.bla`
	 * this.watch('foo.bla', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to `onChange` event of the current component
	 * this.watch(':onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to `onChange` event of `parentEmitter`
	 * this.watch('parentEmitter:onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		path: WatchPath,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to a component property/event by the specified path
	 *
	 * @param path - path to a component property to watch or event to listen
	 * @param handler
	 * @param [opts] - additional options
	 */
	watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		obj: object,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param handler
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		obj: object,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	watch<T = unknown>(
		path: WatchPath | object,
		optsOrHandler: AsyncWatchOptions | RawWatchHandler<this, T>,
		handlerOrOpts?: RawWatchHandler<this, T> | AsyncWatchOptions
	): void {
		const
			{async: $a} = this;

		if (this.isSSR) {
			return;
		}

		let
			handler,
			opts;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = handlerOrOpts;

		} else {
			handler = handlerOrOpts;
			opts = optsOrHandler;
		}

		opts ??= {};

		if (Object.isString(path) && RegExp.test(customWatcherRgxp, path)) {
			bindRemoteWatchers(this, {
				async: $a,
				watchers: {
					[path]: [
						{
							handler: (ctx, ...args: unknown[]) => handler.call(this, ...args),
							...opts
						}
					]
				}
			});

			return;
		}

		void this.lfc.execCbAfterComponentCreated(() => {
			// eslint-disable-next-line prefer-const
			let link, unwatch;

			const emitter = (_, wrappedHandler: Function) => {
				wrappedHandler['originalLength'] = handler['originalLength'] ?? handler.length;
				handler = wrappedHandler;

				$a.worker(() => {
					if (link != null) {
						$a.off(link);
					}
				}, opts);

				return () => unwatch?.();
			};

			link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(opts, 'watchers'));
			unwatch = this.$watch(Object.cast(path), opts, handler);
		});
	}

	/**
	 * Executes the specified function on the next render tick
	 *
	 * @see [[Async.proxy]]
	 * @param fn
	 * @param [opts] - additional options
	 */
	nextTick(fn: BoundFn<this>, opts?: AsyncOptions): void;

	/**
	 * Returns a promise that will be resolved on the next render tick
	 *
	 * @see [[Async.promise]]
	 * @param [opts] - additional options
	 */
	nextTick(opts?: AsyncOptions): Promise<void>;
	nextTick(fnOrOpts?: BoundFn<this> | AsyncOptions, opts?: AsyncOptions): CanPromise<void> {
		const
			{async: $a} = this;

		if (Object.isFunction(fnOrOpts)) {
			this.$nextTick($a.proxy(fnOrOpts, opts));
			return;
		}

		return $a.promise(this.$nextTick(), fnOrOpts);
	}

	/**
	 * Forces the component' re-rendering
	 */
	@wait({defer: true, label: $$.forceUpdate})
	forceUpdate(): Promise<void> {
		this.$forceUpdate();
		return Promise.resolve();
	}

	/**
	 * Logs an event with the specified context
	 *
	 * @param ctxOrOpts - the logging context or logging options
	 * @param [details] - event details
	 */
	log(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void {
		let
			context = ctxOrOpts,
			logLevel;

		if (!Object.isString(ctxOrOpts)) {
			logLevel = ctxOrOpts.logLevel;
			context = ctxOrOpts.context;
		}

		if (!this.verbose && (logLevel == null || logLevel === 'info')) {
			return;
		}

		log(
			{
				context: ['component', context, this.componentName].join(':'),
				logLevel
			},

			...details,
			this
		);

		if (this.globalName != null) {
			log(
				{
					context: ['component:global', this.globalName, context, this.componentName].join(':'),
					logLevel
				},

				...details,
				this
			);
		}
	}

	/**
	 * Initializes an instance of the `Block` class for the current component
	 */
	@hook('mounted')
	protected initBlockInstance(): void {
		if (this.block != null) {
			const
				{node} = this.block;

			if (node == null || node === this.$el) {
				return;
			}

			// @ts-ignore (unsafe)
			if (node.component === this) {
				delete node.component;
			}
		}

		this.block = new Block(Object.cast(this));

		if (this.blockReadyListeners.length > 0) {
			for (let i = 0; i < this.blockReadyListeners.length; i++) {
				this.blockReadyListeners[i]();
			}

			this.blockReadyListeners = [];
		}
	}
}
