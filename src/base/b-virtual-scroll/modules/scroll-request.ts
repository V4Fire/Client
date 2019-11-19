/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';

import { RemoteData, RequestMoreParams, ScrollRenderState } from 'base/b-virtual-scroll/modules/interface';

export default class Request {
	/**
	 * True if it is considered that all data is uploaded
	 */
	isRequestsDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Total amount of elements being loaded
	 */
	totalLoaded: number = 0;

	/**
	 * All loaded data
	 */
	loadedData: unknown[] = [];

	/**
	 * Current page
	 */
	page: number = 1;

	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

	/**
	 * Scroll render module
	 */
	protected get scrollRender(): ScrollRender {
		// @ts-ignore (access)
		return this.component.scrollRender;
	}

	/**
	 * @param ctx
	 */
	constructor(ctx: bVirtualScroll) {
		this.component = ctx;
	}

	/**
	 * Resets current state
	 */
	reset(): void {
		this.totalLoaded = 0;
		this.page = 1;
		this.loadedData = [];
	}

	/**
	 * Retries last request
	 */
	retry(): void {
		this.isRequestsDone = false;
		this.isLastEmpty = false;
		this.component.removeMod('requestsDone', true);
		this.scrollRender.updateRange();
	}

	/**
	 * Trying to request additional data
	 */
	try(): Promise<void> {
		const
			{component, scrollRender} = this,
			resolved = Promise.resolve(),
			shouldRequest = component.shouldMakeRequest(getRequestParams(this, scrollRender));

		const cantRequest = () => this.isRequestsDone ||
				!shouldRequest ||
				!component.dataProvider ||
				component.mods.progress === 'true' ||
				scrollRender.state !== ScrollRenderState.render;

		if (cantRequest()) {
			return resolved;
		}

		const
			params = getRequestParams(this, scrollRender);

		return this.load(params)
			.then((v) => {
				if (!component.field.get('data.length', v)) {
					this.isLastEmpty = true;
					this.checksRequestDone(getRequestParams(this, scrollRender, {lastLoaded: []}));
					return;
				}

				const
					{data, total} = <RemoteData>v;

				this.page++;
				this.isLastEmpty = false;
				this.loadedData = this.loadedData.concat(data);

				scrollRender.max = total || Infinity;
				scrollRender.add(data);

			}).catch(stderr);
	}

	/**
	 * Checks are all requests complete
	 * @param params
	 */
	checksRequestDone(params: RequestMoreParams): void {
		const
			{scrollRender} = this;

		this.isRequestsDone = !this.component.shouldContinueRequest(params);

		if (this.isRequestsDone) {
			// @ts-ignore (access)
			scrollRender.onRequestsDone();

		} else {
			this.component.removeMod('requestsDone', true);
		}
	}

	/**
	 * Requests an additional data
	 * @param params
	 */
	protected load(params: RequestMoreParams): Promise<CanUndef<RemoteData>> {
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
					// @ts-ignore (access)
					converted = component.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!converted?.data?.length) {
					return;
				}

				component.options = component.options.concat(converted);
				return converted;
			})

			.catch((err) => (stderr(err), undefined));
	}
}

/**
 * Returns a request params
 *
 * @param [scrollRequestCtx]
 * @param [scrollRenderCtx]
 * @param [merge]
 */
export function getRequestParams(
	scrollRequestCtx?: Request,
	scrollRenderCtx?: ScrollRender,
	merge?: Dictionary
): RequestMoreParams {
	const base = {
		currentPage: 0,
		currentRange: new Range(0, 0),
		items: [],
		lastLoaded: [],
		currentSlice: [],
		isLastEmpty: false,
		itemsToReachBottom: 0
	};

	const params = scrollRequestCtx && scrollRenderCtx ? {
		currentRange: scrollRenderCtx.range,
		currentPage: scrollRequestCtx.page,
		lastLoaded: scrollRenderCtx.lastRegisterData,
		isLastEmpty: scrollRequestCtx.isLastEmpty,

		currentSlice: scrollRenderCtx.items.slice(scrollRenderCtx.range.start, scrollRenderCtx.range.end),
		itemsToReachBottom: scrollRequestCtx.totalLoaded - scrollRenderCtx.currentAnchor.index,
		items: scrollRenderCtx.items
	} : base;

	const merged = {
		...params,
		...merge
	};

	// tslint:disable-next-line: prefer-object-spread
	return Object.assign(merged, {
		nextPage: merged.currentPage + 1
	});
}
