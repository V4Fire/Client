/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentState } from 'components/base/b-scrolly/interface/component';

/**
 * Interface representing the response of the client to the `renderGuard` method for rendering requests.
 *
 * To grant permission for rendering, the response object should have the following structure:
 * ```typescript
 * const canPerform: CanPerformRenderResult = {
 *   result: true
 * }
 * ```
 *
 * To deny rendering, the response object should have the following structure:
 * ```typescript
 * const canPerform: CanPerformRenderResult = {
 *   result: false,
 *   reason: 'notEnoughData'
 * }
 * ```
 *
 * Depending on the reason, specific actions will be taken based on the implementation of the `renderGuard`.
 */
export interface CanPerformRenderResult {
	/**
	 * If `true`, rendering is permitted; if `false`, rendering is denied.
	 */
	result: boolean;

	/**
	 * The reason for rejecting the rendering request.
	 */
	reason?: keyof CanPerformRenderRejectionReason;
}

/**
 * Reasons for rejecting a render operation.
 */
export interface CanPerformRenderRejectionReason {
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
	(state: ComponentState, ctx: bScrolly): RES;
}
