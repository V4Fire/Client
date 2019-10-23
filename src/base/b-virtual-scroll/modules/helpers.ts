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
	return v.itemsToRichBottom <= 10 && !v.isLastEmpty;
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
