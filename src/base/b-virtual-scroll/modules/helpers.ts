/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';

import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';
import ScrollRequest from 'base/b-virtual-scroll/modules/scroll-request';

import { RequestMoreParams, ScrollRenderStatus } from 'base/b-virtual-scroll/modules/interface';

// tslint:disable-next-line:completed-docs
export function isNatural(v: number): boolean {
	return v.isNatural();
}

/**
 * Returns a value of height with margins of the specified node
 * @param node
 */
export function getHeightWithMargin(node: HTMLElement): number {
	const
		style = window.getComputedStyle(node);

	return ['top', 'bottom']
		.map((side) => parseInt(style[`margin-${side}`], 10))
		.reduce((total, side) => total + side, node.offsetHeight);
}

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
	const base = {
		currentPage: 0,
		currentRange: new Range(0, 0),
		items: [],
		lastLoaded: [],
		currentSlice: [],
		isLastEmpty: false,
		itemsToReachBottom: 0
	};

	const params = scrollRequestCtx && scrollRenderCtx && scrollRenderCtx.status !== ScrollRenderStatus.notInitialized ? {
		currentRange: scrollRenderCtx.range,
		currentPage: scrollRequestCtx.page,
		lastLoaded: scrollRenderCtx.lastRegisteredData,
		isLastEmpty: scrollRequestCtx.isLastEmpty,

		currentSlice: scrollRenderCtx.items.slice(scrollRenderCtx.range.start, scrollRenderCtx.range.end),
		itemsToReachBottom: scrollRequestCtx.total - scrollRenderCtx.currentAnchor.index,
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
