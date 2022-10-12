/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import SyncPromise from 'core/promise/sync';
import config from 'config';

import type { AsyncOptions } from 'core/async';
import { component } from 'core/component';

import type bRouter from 'base/b-router/b-router';
import type { ConverterCallType } from 'friends/state';

import { statuses } from 'super/i-block/const';
import { system, hook } from 'super/i-block/modules/decorators';
import type { InitLoadCb, InitLoadOptions } from 'super/i-block/interface';

import iBlockState from 'super/i-block/state';

export const
	$$ = symbolGenerator();

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
	 * A link to the application router
	 */
	get router(): CanUndef<bRouter> {
		return this.field.get('routerStore', this.r);
	}

	/**
	 * A link to the active route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	/**
	 * Loads component initialization data.
	 * The method loads data from external providers (if any), local storage, etc.
	 * It is called when the component is created.
	 *
	 * @param [data] - additional initialization data
	 * @param [opts] - additional options
	 *
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
				(this.isFunctional || this.dontWaitRemoteProviders) &&
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

			const initializing = this.nextTick(label).then((() => {
				this.$children.forEach((component) => {
					const
						status = component.componentStatus;

					if (!component.remoteProvider || !Object.isTruly(statuses[status])) {
						return;
					}

					if (status === 'ready') {
						if (opts.recursive) {
							component.reload({silent: opts.silent === true, ...opts}).catch(stderr);

						} else {
							return;
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
									message: 'The component waits too long for the remote provider',
									waitFor: {
										globalName: component.globalName,
										component: component.componentName,
										dataProvider: Object.get(component, 'dataProvider')
									}
								}
							);
						})
					]));
				});

				return $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
			}));

			this.$initializer = initializing;
			return initializing;

		} catch (err) {
			doneOnError(err);
		}
	}

	/**
	 * Reloads component providers data
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
	 * When the component is initializing, it requests the storage for its associated data, using the `globalName` prop
	 * as the namespace to search. When the storage is ready to provide data to the component, it passes the data to
	 * this method. After that, the method returns a dictionary associated with the component properties
	 * (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes to each property in this dictionary.
	 * If at least one of  these properties is changed, the entire data batch will be synchronized with the storage
	 * using this method. When the component provides the storage data, the second argument to the method is `'remote'`.
	 *
	 * @param [data] - advanced data
	 * @param [type] - the call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the storage state.
	 * This method will be used when calling `state.resetStorage`.
	 *
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
	 * This method works as a two-way connector between the component and the application router.
	 *
	 * When the component is initializing, it requests the router for its associated data.
	 * The router provides the data by using this method. After that, the method returns a dictionary associated with
	 * the component properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes to each property in this dictionary.
	 * If at least one of  these properties is changed, the entire data batch will be synchronized with the router
	 * using this method. When the component provides the router data, the second argument to the method is `'remote'`.
	 *
	 * Keep in mind that the router is global to all components, meaning the dictionary this method passes to the router
	 * will extend the current route data, but not override  (`router.push(null, {...route, ...componentData}})`).
	 *
	 * @param [data] - advanced data
	 * @param [type] - the call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with the default component properties to reset the router state.
	 * This method will be used when calling `state.resetRouter`.
	 *
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

	@hook({beforeRuntime: {functional: false}})
	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);
	}
}
