/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { RequestMoreParams } from 'base/b-virtual-scroll/modules/interface';

/**
 * Returns a request params
 *
 * @param [scrollRequestCtx]
 * @param [scrollRenderCtx]
 * @param [merge]
 */
export function getRequestParams(
	scrollRequestCtx?: ScrollRequest,
	scrollRenderCtx?: ScrollRender,
	merge?: Dictionary
): RequestMoreParams {
	const
		component = scrollRenderCtx?.component || scrollRequestCtx?.component;

	const lastLoadedData = scrollRequestCtx?.lastLoadedChunk.normalized.length ?
		scrollRequestCtx.lastLoadedChunk.normalized :
		component?.options;

	const base: RequestMoreParams = {
		currentPage: 0,
		nextPage: 1,
		items: [],
		isLastEmpty: false,
		itemsTillBottom: 0,

		lastLoadedData: lastLoadedData || [],
		lastLoadedChunk: {
			raw: undefined,
			normalized: lastLoadedData || []
		}
	};

	const params = scrollRequestCtx && scrollRenderCtx ? {
		items: scrollRenderCtx.items,
		currentPage: scrollRequestCtx.page,
		isLastEmpty: scrollRequestCtx.isLastEmpty,
		itemsTillBottom: scrollRenderCtx.items.length - scrollRenderCtx.lastIntersectsItem,
		total: component && component.total,

		lastLoadedData: lastLoadedData || [],
		lastLoadedChunk: {
			raw: scrollRequestCtx.rawLastLoadedData,
			normalized: lastLoadedData || []
		}

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
