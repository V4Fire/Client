/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';
import { RemoteData, RequestMoreParams, ScrollRenderState } from 'base/b-virtual-scroll/modules/interface';

export default class Request {
	/**
	 * Current page
	 */
	page: number = 1;

	/**
	 * Total amount of elements being loaded
	 */
	total: number = 0;

	/**
	 * All loaded data
	 */
	data: unknown[] = [];

	/**
	 * True if all requests is done
	 */
	isDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Component instance
	 */
	protected component: bVirtualScroll;

	/**
	 * API for scroll request helpers
	 */
	protected get scrollRender(): ScrollRender {
		// @ts-ignore (access)
		return this.component.scrollRender;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: bVirtualScroll) {
		this.component = component;
	}

	/**
	 * Resets the current state
	 */
	reset(): void {
		this.total = 0;
		this.page = 1;
		this.data = [];
	}

	/**
	 * Reloads the last request
	 */
	reloadLast(): void {
		this.isDone = false;
		this.isLastEmpty = false;
		this.component.removeMod('requestsDone', true);
		this.scrollRender.updateRange();
	}

	/**
	 * Tries to request additional data
	 */
	try(): Promise<void> {
		const
			{component, scrollRender} = this;

		const
			resolved = Promise.resolve(),
			shouldRequest = component.shouldMakeRequest(getRequestParams(this, scrollRender));

		const cantRequest = () =>
			this.isDone ||
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
				this.data = this.data.concat(data);

				scrollRender.max = total || Infinity;
				scrollRender.add(data);

			}).catch(stderr);
	}

	/**
	 * Checks are all requests complete
	 * @param params
	 */
	checksRequestDone(params: RequestMoreParams): void {
		const {component, scrollRender} = this;
		this.isDone = !component.shouldContinueRequest(params);

		if (this.isDone) {
			// @ts-ignore (access)
			scrollRender.onRequestsDone();

		} else {
			component.removeMod('requestsDone', true);
		}
	}

	/**
	 * Loads additional data
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
