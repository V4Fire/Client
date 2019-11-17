/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import { RemoteData, RequestMoreParams } from 'base/b-virtual-scroll/modules/interface';

export default class Request {
	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * @param ctx
	 */
	constructor(ctx: bVirtualScroll) {
		this.component = ctx;
	}

	/**
	 * Requests an additional data
	 * @param params
	 */
	loadEntities(params: RequestMoreParams): Promise<CanUndef<RemoteData>> {
		const
			{component} = this;

		const query = {
			...component.request,
			...component.requestQuery?.(params)
		};

		return component.get(query)
			.then((data) => {
				if (!data) {
					return;
				}

				const
					converted = component.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!converted?.data?.length) {
					return;
				}

				component.options = component.options.concat(converted);
				return converted;
			})

			.catch((err) => (stderr(err), undefined));
	}

	/**
	 * Retries last request
	 */
	retryRequest(): void {
		this.isRequestsDone = false;
		this.isLastEmpty = false;
		this.component.removeMod('requestsDone', true);
		this.updateRange();
	}

	/**
	 * Requests an additional data
	 */
	request(): Promise<void> {
		const
			{component} = this,
			resolved = Promise.resolve(),
			shouldRequest = component.shouldMakeRequest(getRequestParams(this));

		if (this.isRequestsDone) {
			return resolved;
		}

		if (!shouldRequest || !component.dataProvider || component.mods.progress === 'true') {
			return resolved;
		}

		const
			params = getRequestParams(this);

		// @ts-ignore (access)
		return component.loadEntities(params)
			.then((v: CanUndef<RemoteData>) => {
				if (!component.field.get('data.length', v)) {
					this.isLastEmpty = true;
					this.checksRequestDone(getRequestParams(this, {lastLoaded: []}));
					return;
				}

				const
					{data, total} = <RemoteData>v;

				this.page++;
				this.max = total || Infinity;
				this.isLastEmpty = false;
				this.loadedData = this.loadedData.concat(data);

				this.registerData(data);
				this.checksRequestDone(getRequestParams(this));
				this.updateRange();

			}).catch(stderr);
	}
}
