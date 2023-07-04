/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { VirtualScrollState } from 'components/base/b-virtual-scroll/interface/component';

/**
 * Interface representing the response of the client to the `renderGuard` method for rendering requests.
 *
 * To grant permission for rendering, the response object should have the following structure:
 *
 * ```typescript
 * const canPerform: RenderGuardResult = {
 *   result: true
 * }
 * ```
 *
 * To deny rendering, the response object should have the following structure:
 *
 * ```typescript
 * const canPerform: RenderGuardResult = {
 *   result: false,
 *   reason: 'notEnoughData'
 * }
 * ```
 *
 * Based on the result of this function, the component takes appropriate actions. For example,
 * it may load data if it is not sufficient for rendering, or perform rendering if all conditions are met.
 */
export interface RenderGuardResult {
	/**
	 * If `true`, rendering is permitted; if `false`, rendering is denied.
	 */
	result: boolean;

	/**
	 * The reason for rejecting the rendering request.
	 */
	reason?: keyof RenderGuardRejectionReason;
}

/**
 * Reasons for rejecting a render operation.
 */
export interface RenderGuardRejectionReason {
	/**
	 * Insufficient data to perform a render (e.g., `data.length` is 5 and `chunkSize` is 12).
	 */
	notEnoughData: 'notEnoughData';

	/**
	 * No data available to perform a render (e.g., `data.length` is 0).
	 */
	noData: 'noData';

	/**
	 * All rendering operations have been completed.
	 */
	done: 'done';

	/**
	 * The client returns `false` in `shouldPerformDataRender`.
	 */
	noPermission: 'noPermission';
}

/**
 * A function used to query the client about whether to perform a specific action or not.
 */
export interface ShouldPerform<RES = boolean> {
	(state: VirtualScrollState, ctx: bVirtualScroll): RES;
}
