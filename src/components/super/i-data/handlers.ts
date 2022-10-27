/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type RequestError from 'core/request/error';

import Data from 'components/friends/data';
import { component, watch, wait } from 'components/super/i-block/i-block';

import iDataData from 'components/super/i-data/data';
import type { RequestParams, RetryRequestFn } from 'components/super/i-data/interface';

export const
	$$ = symbolGenerator();

@component({functional: null})
export default abstract class iDataHandlers extends iDataData {
	protected override initGlobalEvents(resetListener?: boolean): void {
		super.initGlobalEvents(resetListener != null ? resetListener : Boolean(this.dataProvider));
	}

	/**
	 * Initializes data event listeners
	 */
	@wait('ready', {label: $$.initDataListeners})
	protected initDataListeners(): void {
		const
			{data: provider} = this;

		if (provider == null) {
			return;
		}

		const
			{emitter: $e} = provider;

		const group = {group: 'dataProviderSync'};
		$e.off(group);

		$e.on('add', async (data) => {
			if (provider.getDefaultRequestParams('get')) {
				this.onAddData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('update', async (data) => {
			if (provider.getDefaultRequestParams('get')) {
				this.onUpdateData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('delete', async (data) => {
			if (provider.getDefaultRequestParams('get')) {
				this.onDeleteData(await (Object.isFunction(data) ? data() : data));
			}
		}, group);

		$e.on('refresh', async (data) => {
			await this.onRefreshData(await (Object.isFunction(data) ? data() : data));
		}, group);

		$e.on('error', this.onRequestError.bind(this), group);
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
		if (!requestParams) {
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

			const
				m = key.split(':', 1)[0],
				group = {group: `requestSync:${m}`};

			$a
				.clearAll(group);

			if (m === 'get') {
				this.componentStatus = 'loading';
				$a.setImmediate(this.initLoad.bind(this), group);

			} else {
				$a.setImmediate(() => this[m](...this.data?.getDefaultRequestParams(key) ?? []), group);
			}
		});
	}

	/**
	 * Synchronization of `dataProvider` properties
	 * @param [initLoad] - if false, there is no need to call `initLoad`
	 */
	@watch([
		{path: 'dataProvider', provideArgs: false},
		{path: 'dataProviderOptions', provideArgs: false}
	])

	protected syncDataProviderWatcher(initLoad: boolean = true): void {
		const
			provider = this.dataProvider;

		if (this.data != null) {
			this.async
				.clearAll({group: /requestSync/})
				.clearAll({label: $$.initLoad});

			this.data.emitter.off();
			this.data = undefined;
		}

		if (provider != null) {
			const watchParams = {
				deep: true,
				group: 'requestSync'
			};

			this.watch('request', watchParams, this.syncRequestParamsWatcher.bind(this));
			this.watch('requestParams', watchParams, this.syncRequestParamsWatcher.bind(this));

			this.data = new Data(this, provider, this.dataProviderOptions);
			this.initDataListeners();

			if (initLoad) {
				void this.initLoad();
			}
		}
	}

	/**
	 * Handler: an error occurred while loading data from the provider
	 *
	 * @param err - the caused error
	 * @param retry - a function to repeat the request
	 * @emits `requestError(err: Error |` [[RequestError]], retry:` [[RetryRequestFn]]`)`
	 */
	protected onRequestError(err: Error | RequestError, retry: RetryRequestFn): void {
		this.emitError('requestError', err, retry);
	}

	/**
	 * Handler: data has been added to the component provider
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
	 * Handler: data has been updated for the component provider
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
	 * Handler: data has been deleted from the component provider
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
	 * @param data
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected onRefreshData(data: this['DB']): Promise<void> {
		return this.reload();
	}
}
