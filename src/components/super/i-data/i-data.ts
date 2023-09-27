/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-data/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import RequestError from 'core/request/error';

import type { RequestQuery } from 'core/data';
import type { AsyncOptions } from 'core/async';

import type iBlock from 'components/super/i-block/i-block';

import {

	component,
	hydrationStore,

	InitLoadCb,
	InitLoadOptions,
	UnsafeGetter

} from 'components/super/i-block/i-block';

import iDataHandlers from 'components/super/i-data/handlers';
import type { UnsafeIData } from 'components/super/i-data/interface';

export { RequestError };

export {

	Socket,

	RequestQuery,
	RequestBody,
	RequestResponseObject,
	Response,

	ModelMethod,
	ProviderOptions,

	ExtraProvider,
	ExtraProviders

} from 'core/data';

export * from 'components/super/i-block/i-block';
export * from 'components/super/i-data/interface';

const
	$$ = symbolGenerator();

@component({functional: null})
export default abstract class iData extends iDataHandlers {
	override get unsafe(): UnsafeGetter<UnsafeIData<this>> {
		return Object.cast(this);
	}

	override initLoad(data?: unknown, opts: InitLoadOptions = {}): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		const {
			async: $a
		} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const
			callSuper = () => super.initLoad(() => this.db, opts);

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			if (this.dataProviderProp != null && this.dataProvider == null) {
				this.syncDataProviderWatcher(false);
			}

			const
				providerHydrationKey = '[[DATA_PROVIDER]]';

			const setDBData = (data: CanUndef<this['DB']>) => {
				this.saveDataToRootStore(data);
				this.hydrationStore?.set(this.componentId, providerHydrationKey, Object.cast(data));
				this.db = this.convertDataToDB<this['DB']>(data);
			};

			if (HYDRATION && !this.isReadyOnce && hydrationStore.has(this.componentId)) {
				const
					store = hydrationStore.get(this.componentId),
					data = Object.cast<CanUndef<this['DB']>>(store![providerHydrationKey]);

				delete data![providerHydrationKey];
				setDBData(data);

				return callSuper();
			}

			opts = {
				emitStartEvent: false,
				...opts
			};

			$a
				.clearAll({group: 'requestSync:get'});

			if (this.isFunctional && !SSR) {
				const res = super.initLoad(() => {
					if (data !== undefined) {
						this.db = this.convertDataToDB<this['DB']>(data);
					}

					return this.db;
				}, opts);

				if (Object.isPromise(res)) {
					this.$initializer = res;
				}

				return res;
			}

			const
				{dataProvider} = this;

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			if (data !== undefined) {
				const db = this.convertDataToDB<this['DB']>(data);
				void this.lfc.execCbAtTheRightTime(() => this.db = db, label);

			} else if ((!SSR || this.ssrRender) && dataProvider?.provider.baseURL != null) {
				const
					needRequest = Object.isArray(dataProvider.getDefaultRequestParams('get'));

				if (needRequest) {
					const res = $a
						.nextTick(label)

						.then(() => {
							const
								defParams = dataProvider.getDefaultRequestParams<this['DB']>('get');

							if (defParams == null) {
								return;
							}

							Object.assign(defParams[1], {
								...label,
								important: this.componentStatus === 'unloaded'
							});

							if (this.dependencies.length > 0) {
								void this.moduleLoader.load(...this.dependencies);
							}

							if (this.globalName != null) {
								void this.state.initFromStorage();
							}

							return dataProvider.get(<RequestQuery>defParams[0], defParams[1]);
						})

						.then(
							(data) => {
								void this.lfc.execCbAtTheRightTime(() => setDBData(data), label);
								return callSuper();
							},

							(err) => {
								stderr(err);
								return callSuper();
							}
						);

					this.$initializer = res;
					return res;
				}

				if (this.db !== undefined) {
					void this.lfc.execCbAtTheRightTime(() => this.db = undefined, label);
				}
			}

			return callSuper();

		} catch (err) {
			stderr(err);
			return callSuper();
		}
	}

	/**
	 * An alias to the original `initLoad` method
	 * {@link iBlock.initLoad}
	 *
	 * @param [data]
	 * @param [opts]
	 */
	initBaseLoad(data?: unknown | InitLoadCb, opts?: InitLoadOptions): CanPromise<void> {
		return super.initLoad(data, opts);
	}

	override reload(opts?: InitLoadOptions): Promise<void> {
		if (!this.r.isOnline && !this.offlineReload) {
			return Promise.resolve();
		}

		return super.reload(opts);
	}

	/**
	 * Saves data to the root data store.
	 * All components with defined global names or data providers additionally store their data in the root component.
	 * You can check each provider data by using `r.providerDataStore`.
	 *
	 * @param data
	 * @param [key] - the key that will be used to store the data
	 */
	protected saveDataToRootStore(data: unknown, key?: string): void {
		key ??= getKey(this.globalName ?? this.dataProviderProp);

		if (key == null) {
			return;
		}

		this.r.providerDataStore.set(key, data);

		function getKey(val: string | CanUndef<iData['dataProviderProp']>): CanUndef<string> {
			if (val == null || Object.isString(val)) {
				return val ?? undefined;
			}

			if (Object.isFunction(val)) {
				return val.name;
			}

			return val.constructor.name;
		}
	}
}
