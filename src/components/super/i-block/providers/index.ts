/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/providers/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import Provider, { providers, instanceCache, ProviderOptions } from 'core/data';

import { i18nFactory } from 'core/i18n';
import SyncPromise from 'core/promise/sync';
import config from 'config';

import type { AsyncOptions } from 'core/async';
import { component, hydrationStore } from 'core/component';

import type iData from 'components/super/i-data/i-data';

import { statuses } from 'components/super/i-block/const';
import { system, hook } from 'components/super/i-block/decorators';

import type iBlock from 'components/super/i-block/i-block';
import type { InitLoadCb, InitLoadOptions } from 'components/super/i-block/interface';

import iBlockState from 'components/super/i-block/state';
import type { DataProviderProp } from 'components/super/i-block/providers/interface';

export * from 'components/super/i-block/providers/interface';

const
	$$ = symbolGenerator();

@component()
export default abstract class iBlockProviders extends iBlockState {
	/** {@link iBlock.dontWaitRemoteProvidersProp} */
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
	 * Loads component initialization data.
	 * The method loads data from external providers (if any), local storage, etc.
	 * It is called when the component is created.
	 *
	 * @param [data] - additional initialization data
	 * @param [opts] - additional options
	 *
	 * @emits `initLoadStart(opts: InitLoadOptions)`
	 * @emits `initLoad(data: unknown, opts: InitLoadOptions)`
	 */
	@hook('after:beforeDataCreate')
	initLoad(data?: unknown | InitLoadCb, opts: InitLoadOptions = {}): CanPromise<void> {
		if (SSR) {
			hydrationStore.init(this.componentId);

			if (!this.ssrRendering) {
				return;
			}
		}

		const
			that = this;

		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;

		const hydrationMode =
			HYDRATION &&
			hydrationStore.has(this.componentId);

		if (hydrationMode) {
			this.state.set(hydrationStore.get(this.componentId));
			done();
			return;
		}

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			const
				tasks: Array<CanPromise<unknown>> = [];

			if (this.state.globalName != null) {
				const storageInitialization = this.state.initFromStorage();
				tasks.push(storageInitialization);
			}

			if (this.dependencies.length > 0) {
				tasks.push(this.moduleLoader.load(...this.dependencies));
			}

			if (!SSR && (this.isFunctional || this.dontWaitRemoteProviders)) {
				if (tasks.length > 0) {
					const res = $a.promise(SyncPromise.all(tasks), label).then(done, doneWithError);
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

					const waitReady = component.waitComponentStatus('ready');

					const timeout = $a.sleep((3).seconds()).then(() => {
						throw 'timeout';
					});

					const task = Promise.race([waitReady, timeout]).catch((err) => {
						if (err !== 'timeout') {
							throw err;
						}

						this.log(
							{
								logLevel: 'warn',
								context: 'initLoad:remoteProviders'
							},

							{
								message: 'The component is waiting too long for data from a remote provider',
								waitFor: {
									route: this.route,
									globalName: component.globalName,
									component: component.componentName,
									dataProvider: (<iData>component).dataProvider?.provider.constructor.name
								}
							}
						);
					});

					tasks.push(task);
				});

				return $a.promise(SyncPromise.all(tasks), label).then(done, doneWithError);
			}));

			this.$initializer = initializing;
			return initializing;

		} catch (err) {
			doneWithError(err);
		}

		function done() {
			that.componentStatus = 'beforeReady';

			void that.lfc.execCbAfterBlockReady(() => {
				if (hydrationMode || !that.isFunctional) {
					ready();

				} else {
					that.nextTick(ready);
				}
			});

			function ready() {
				that.isReadyOnce = true;
				that.componentStatus = 'ready';

				if (hydrationMode || that.beforeReadyListeners === 0) {
					emitInitLoad();

				} else {
					that.nextTick()
						.then(() => {
							that.beforeReadyListeners = 0;
							emitInitLoad();
						})

						.catch(stderr);
				}

				function emitInitLoad() {
					that.emit('initLoad', get(), opts);
				}
			}

			function get() {
				if (Object.isFunction(data)) {
					try {
						return data.call(that);

					} catch (err) {
						stderr(err);
						return;
					}
				}

				return data;
			}
		}

		function doneWithError(err: unknown) {
			stderr(err);
			done();
		}
	}

	/**
	 * Reloads component providers: the method delegates functionality to the `initLoad` method.
	 * By default, the reboot will run in silent mode, i.e., without switching the component status to `loading`.
	 * You can customize this behavior by passing additional parameters.
	 *
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
	 * Creates an instance of the DataProvider based on the specified parameters
	 *
	 * @param provider
	 * @param opts
	 */
	createDataProviderInstance(provider: 'Provider', opts?: ProviderOptions): null;

	/**
	 * Creates an instance of the DataProvider based on the specified parameters
	 *
	 * @param provider
	 * @param opts
	 */
	createDataProviderInstance<T extends Provider, O extends ProviderOptions>(
		provider: T | {new(opts: O): T} | (() => T | {new(opts: O): T}),
		opts?: O
	): T;

	/**
	 * Creates an instance of the DataProvider based on the specified parameters
	 *
	 * @param provider
	 * @param opts
	 */
	createDataProviderInstance(provider: DataProviderProp, opts?: ProviderOptions): Provider;

	createDataProviderInstance(provider: DataProviderProp, opts?: ProviderOptions): CanNull<Provider> {
		const
			that = this,
			{remoteState} = this;

		opts = {
			...opts,

			i18n: (
				keysetNameOrNames: CanArray<string>,
				customLocale?: Language
			) => i18nFactory(keysetNameOrNames, customLocale ?? remoteState.lang),

			// Hardcode the id during the client render
			// because the providers cache must be preserved until the end of the user's session
			// FIXME: remove this condition after PR#1171 is merged
			id: SSR ? this.r.appProcessId : 'client',
			remoteState: this.remoteState
		};

		let
			dp: Provider;

		if (Object.isString(provider)) {
			const
				ProviderConstructor = <CanUndef<typeof Provider>>providers[provider];

			if (ProviderConstructor == null) {
				if (provider === 'Provider') {
					return null;
				}

				throw new ReferenceError(`The provider "${provider}" is not defined`);
			}

			dp = new ProviderConstructor(opts);
			registerDestructor();

		} else if (Object.isFunction(provider)) {
			const ProviderConstructor = Object.cast<typeof Provider>(provider);

			dp = new ProviderConstructor(opts);
			registerDestructor();

		} else {
			dp = <Provider>provider;
		}

		return dp;

		function registerDestructor() {
			that.r.unsafe.async.worker(() => {
				instanceCache[dp.getCacheKey()]?.destroy();
			});
		}
	}

	/**
	 * Clears the component hydration data
	 */
	@hook('mounted')
	protected clearComponentHydratedData(): void {
		hydrationStore.remove(this.componentId);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();
		this.createDataProviderInstance = this.instance.createDataProviderInstance.bind(this);
	}
}
