/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { component, globalState, Hook } from 'core/component';

import iBlockState from 'super/i-block/state';
import {InitLoadCb, InitLoadOptions} from "super/i-block/interface";
import {AsyncOptions} from "core/async";
import SyncPromise from "core/promise/sync";
import {statuses} from "super/i-block/const";
import {$$} from "super/i-block/i-block";
import {ConverterCallType} from "friends/state";
import bRouter from "base/b-router/b-router";
import config from "config";

@component()
export default abstract class iBlockProviders extends iBlockState {
	/** @see [[iBlock.dontWaitRemoteProvidersProp]] */
	@system((o) => o.sync.link((val) => {
		if (val == null) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (o.dontWaitRemoteProviders != null) {
				return o.dontWaitRemoteProviders;
			}

			const isRemote = /\bremote-provider\b/;
			return !config.components[o.componentName]?.dependencies.some((dep) => isRemote.test(dep));
		}

		return val;
	}))

	dontWaitRemoteProviders!: boolean;

	/**
	 * Link to an application router
	 */
	get router(): CanUndef<bRouter> {
		return this.field.get('routerStore', this.r);
	}

	/**
	 * Link to an application route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	/**
	 * Dictionary with additional attributes for the component' root tag
	 */
	get rootAttrs(): Dictionary {
		return this.field.get<Dictionary>('rootAttrsStore')!;
	}

	/**
	 * Internal dictionary with additional attributes for the component' root tag
	 * @see [[iBlock.rootAttrsStore]]
	 */
	@field()
	protected rootAttrsStore: Dictionary = {};

	/**
	 * Loads initial data to the component
	 *
	 * @param [data] - data object (for events)
	 * @param [opts] - additional options
	 * @emits `initLoadStart(options: CanUndef<InitLoadOptions>)`
	 * @emits `initLoad(data: CanUndef<unknown>, options: CanUndef<InitLoadOptions>)`
	 */
	@hook('beforeDataCreate')
	initLoad(data?: unknown | InitLoadCb, opts: InitLoadOptions = {}): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const done = () => {
			const get = () => {
				if (Object.isFunction(data)) {
					try {
						return data.call(this);

					} catch (err) {
						stderr(err);
						return;
					}
				}

				return data;
			};

			this.componentStatus = 'beforeReady';

			void this.lfc.execCbAfterBlockReady(() => {
				this.isReadyOnce = true;
				this.componentStatus = 'ready';

				if (this.beforeReadyListeners > 1) {
					this.nextTick()
						.then(() => {
							this.beforeReadyListeners = 0;
							this.emit('initLoad', get(), opts);
						})

						.catch(stderr);

				} else {
					this.emit('initLoad', get(), opts);
				}
			});
		};

		const doneOnError = (err) => {
			stderr(err);
			done();
		};

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			const tasks = <Array<CanPromise<unknown>>>Array.concat(
				[],

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				this.state.globalName != null && this.state.initFromStorage() || []
			);

			if (this.dependencies.length > 0) {
				tasks.push(this.moduleLoader.load(...this.dependencies));
			}

			if (
				(this.isNotRegular || this.dontWaitRemoteProviders) &&
				!this.$renderEngine.supports.ssr
			) {
				if (tasks.length > 0) {
					const res = $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
					this.$initializer = res;
					return res;
				}

				done();
				return;
			}

			const res = this.nextTick(label).then((() => {
				const
					{$children: childComponents} = this;

				if (childComponents) {
					for (let i = 0; i < childComponents.length; i++) {
						const
							component = childComponents[i],
							status = component.componentStatus;

						if (component.remoteProvider && Object.isTruly(statuses[status])) {
							if (status === 'ready') {
								if (opts.recursive) {
									component.reload({silent: opts.silent === true, ...opts}).catch(stderr);

								} else {
									continue;
								}
							}

							let
								isLoaded = false;

							tasks.push(Promise.race([
								component.waitStatus('ready').then(() => isLoaded = true),

								$a.sleep((10).seconds(), {}).then(() => {
									if (isLoaded) {
										return;
									}

									this.log(
										{
											logLevel: 'warn',
											context: 'initLoad:remoteProviders'
										},

										{
											message: 'The component is waiting too long a remote provider',
											waitFor: {
												globalName: component.globalName,
												component: component.componentName,
												dataProvider: Object.get(component, 'dataProvider')
											}
										}
									);
								})
							]));
						}
					}
				}

				return $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
			}));

			this.$initializer = res;
			return res;

		} catch (err) {
			doneOnError(err);
		}
	}

	/**
	 * Reloads component data
	 * @param [opts] - additional options
	 */
	reload(opts?: InitLoadOptions): Promise<void> {
		const
			res = this.initLoad(undefined, {silent: true, ...opts});

		if (Object.isPromise(res)) {
			return res;
		}

		return Promise.resolve();
	}

	/**
	 * This method works as a two-way connector between the component and its storage.
	 *
	 * When the component initializes, it requests the storage for data associated with it by using a global name
	 * as a namespace to search. When the local storage is ready to provide data to the component,
	 * it passes data to this method. After this, the method returns a dictionary mapped to the component as properties
	 * (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the local storage
	 * by using this method. When the component provides local storage data, the method's second argument
	 * is equal to `'remote'`.
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with default component properties to reset a local storage state
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncStorageState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * This method works as a two-way connector between the global router and a component.
	 *
	 * When the component initializes, it asks the router for data. The router provides the data by using this method.
	 * After this, the method returns a dictionary mapped to the
	 * component as properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property that was in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the router
	 * by using this method (the router will produce a new transition by using `push`).
	 * When the component provides router data, the method's second argument is equal to `'remote'`.
	 *
	 * Mind that the router is global for all components, i.e., a dictionary that this method passes to the router
	 * will extend the current route data but not override (`router.push(null, {...route, ...componentData}})`).
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with default component properties to reset a router state
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncRouterState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * Initializes the core component API
	 */
	@hook({beforeRuntime: {functional: false}})
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);
	}
}
