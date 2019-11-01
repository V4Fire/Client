/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RequestMoreParams } from 'base/b-virtual-scroll/modules/interface';
import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

/**
 * Default value for `optionProps` prop
 */
export function defaultOptionProps(): Dictionary {
	return {};
}

/**
 * Default value for `shouldRequest` prop
 * @param v
 */
export function defaultShouldRequest(v: RequestMoreParams): boolean {
	return v.itemsToReachBottom <= 10 && !v.isLastEmpty;
}

/**
 * Default value for `isRequestsDone` prop
 * @param v
 */
export function defaultShouldContinueRequest(v: RequestMoreParams): boolean {
	return !v.isLastEmpty;
}

/**
 * Default value for `shouldUpdate` prop
 * @param ctx
 */
export function defaultShouldUpdate(ctx: bVirtualScroll): boolean {
	return false;
}

// tslint:disable-next-line: completed-docs
export function isNatural(v: number): boolean {
	return v.isNatural();
}

/**
 * Height of node with margins
 * @param node
 */
export function getHeightWithMargin(node: HTMLElement): number {
	const
		style = window.getComputedStyle(node);

	const t = ['top', 'bottom']
		.map((side) => parseInt(style[`margin-${side}`], 10))
		.reduce((total, side) => total + side, node.offsetHeight);

	return t;
}
