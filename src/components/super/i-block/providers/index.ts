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

import SyncPromise from 'core/promise/sync';
import config from 'config';

import type { AsyncOptions } from 'core/async';
import { component, hydrationStore } from 'core/component';

import { statuses } from 'components/super/i-block/const';
import { system, hook } from 'components/super/i-block/decorators';

import type { InitLoadCb, InitLoadOptions } from 'components/super/i-block/interface';

import iBlockState from 'components/super/i-block/state';

const
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
	@hook('beforeDataCreate')
	initLoad(data?: unknown | InitLoadCb, opts: InitLoadOptions = {}): CanPromise<void> {
		const
			that = this;

		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;

		const
			hydrationMode = this.isReadyOnce && hydrationStore.has(this.componentId);

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

			const tasks = <Array<CanPromise<unknown>>>Array.concat(
				[],

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				this.state.globalName != null && this.state.initFromStorage() || []
			);

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

					let
						isLoaded = false;

					tasks.push(Promise.race([
						component.waitComponentStatus('ready').then(() => isLoaded = true),

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
	 * By default, the reboot will run in silent mode, i.e. without switching the component status to `loading`.
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
}
