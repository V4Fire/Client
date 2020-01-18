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
	// @ts-ignore
	return {};
}
