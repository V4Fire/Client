/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type RequestError from 'core/request/error';
import type { ModelMethod } from 'core/data';

import DataProvider from 'components/friends/data-provider';
import { component, watch } from 'components/super/i-block/i-block';

import iDataData from 'components/super/i-data/data';
import type { RequestParams, RetryRequestFn } from 'components/super/i-data/interface';

const
	$$ = symbolGenerator();

@component({partial: 'iData'})
export default abstract class iDataHandlers extends iDataData {
	protected override initGlobalEvents(resetListener?: boolean): void {
		super.initGlobalEvents(resetListener != null ? resetListener : Boolean(this.dataProvider));
	}

	/**
	 * Initializes data event listeners
	 */
	protected initDataListeners(): void {
		const
			{dataProvider} = this;

		if (dataProvider == null) {
			return;
		}

		const
			{emitter: $e} = dataProvider;

		const group = {group: 'dataProviderSync'};
		$e.off(group);

		$e.on('add', async (data) => {
			if (dataProvider.getDefaultRequestParams('add') != null) {
				this.onAddData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('update', async (data) => {
			if (dataProvider.getDefaultRequestParams('update') != null) {
				this.onUpdateData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('delete', async (data) => {
			if (dataProvider.getDefaultRequestParams('delete') != null) {
				this.onDeleteData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('refresh', async (data) => {
			await this.onRefreshData(await (Object.isFunction(data) ? data() : data));
		}, group);

		$e.on('error', (err, retry) => {
			const
				errType = err?.type;

			if (errType === 'clearAsync' || errType === 'abort') {
				return;
			}

			this.onRequestError(err, retry);
		}, group);
	}

	/**
	 * Synchronization of request fields
	 *
	 * @param [requestParams]
	 * @param [oldRequestParams]
	 */
	protected syncRequestParamsWatcher<T = unknown>(
		requestParams?: RequestParams<T>,
		oldRequestParams?: RequestParams<T>
	): void {
		if (requestParams == null) {
			return;
		}

		const
			{async: $a} = this;

		Object.entries(requestParams).forEach(([key, val]) => {
			const
				oldVal = oldRequestParams?.[key];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (val != null && oldVal != null && Object.fastCompare(val, oldVal)) {
				return;
			}

			const providerMethod = Object.cast<ModelMethod>(
				key.split(':', 1)[0]
			);

			if (providerMethod === 'get' && this.canUseHydratedData) {
				return;
			}

			const group = {group: `requestSync:${providerMethod}`};
			$a.clearAll(group);

			if (providerMethod === 'get') {
				if (this.canUseHydratedData) {
					return;
				}

				this.componentStatus = 'loading';
				$a.setImmediate(this.initLoad.bind(this), group);

			} else {
				const handler = () => this[providerMethod](...this.dataProvider?.getDefaultRequestParams(providerMethod) ?? []);
				$a.setImmediate(handler, group);
			}
		});
	}

	/**
	 * Synchronization of `dataProvider` properties
	 * @param [initLoad] - if false, there is no need to call `initLoad`
	 */
	@watch([
		{path: 'dataProviderProp', provideArgs: false},
		{path: 'dataProviderOptions', provideArgs: false}
	])

	protected syncDataProviderWatcher(initLoad: boolean = true): void {
		const
			{dataProviderProp} = this;

		if (this.dataProvider != null) {
			this.async
				.clearAll({group: /requestSync/})
				.clearAll({label: $$.initLoad});

			this.dataProvider.emitter.off();
			this.dataProvider = undefined;
		}

		if (dataProviderProp != null) {
			const watchParams = {
				deep: true,
				group: 'requestSync'
			};

			this.watch('request', watchParams, this.syncRequestParamsWatcher.bind(this));
			this.watch('requestParams', watchParams, this.syncRequestParamsWatcher.bind(this));

			this.dataProvider = new DataProvider(this, dataProviderProp, this.dataProviderOptions);
			this.initDataListeners();

			if (initLoad) {
				void this.initLoad();
			}
		}
	}

	/**
	 * Handler: an error occurred during data loading from the provider
	 *
	 * @param err - the caused error
	 * @param retry - a function to repeat the request
	 * @emits `requestError(err: Error |` [[RequestError]], retry:` [[RetryRequestFn]]`)`
	 */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		this.emitError('requestError', err, retry);
	}

	/**
	 * Handler: new data has successfully been added to the component provider
	 * @param data
	 */
	protected onAddData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: the data in the component provider has been successfully updated
	 * @param data
	 */
	protected onUpdateData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: the data has been successfully removed from the component provider
	 * @param data
	 */
	protected onDeleteData(data: unknown): void {
		if (data != null) {
			this.db = this.convertDataToDB(data);

		} else {
			this.reload().catch(stderr);
		}
	}

	/**
	 * Handler: need to reload data from the provider
	 * @param _data
	 */
	protected onRefreshData(_data: this['DB']): Promise<void> {
		return this.reload();
	}
}
