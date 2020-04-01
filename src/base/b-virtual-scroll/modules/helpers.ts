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

	const
		lastLoadedData = scrollRequestCtx?.lastLoadedData.length ? scrollRequestCtx.lastLoadedData : component?.options;

	const base: RequestMoreParams = {
		currentPage: 0,
		nextPage: 1,
		items: [],
		lastLoadedData: lastLoadedData || [],
		isLastEmpty: false,
		itemsTillBottom: 0
	};

	const params = scrollRequestCtx && scrollRenderCtx ? {
		items: scrollRenderCtx.items,
		currentPage: scrollRequestCtx.page,
		lastLoadedData: lastLoadedData || [],
		isLastEmpty: scrollRequestCtx.isLastEmpty,
		itemsTillBottom: scrollRenderCtx.items.length - scrollRenderCtx.lastIntersectsItem,
		total: component && component.total
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
