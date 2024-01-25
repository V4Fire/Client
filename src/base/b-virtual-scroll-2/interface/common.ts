/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll2 from 'base/b-virtual-scroll-2/b-virtual-scroll-2';

import type { renderGuardRejectionReason } from 'base/b-virtual-scroll-2/b-virtual-scroll-2';
import type { VirtualScrollState } from 'base/b-virtual-scroll-2/interface/component';

import type { UnsafeIData } from 'super/i-data/i-data';

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
 * {@link renderGuardRejectionReason}
 */
export type RenderGuardRejectionReason = typeof renderGuardRejectionReason;

/**
 * A function used to query the client about whether to perform a specific action or not.
 */
export interface ShouldPerform<RES = boolean> {
	(state: VirtualScrollState, ctx: bVirtualScroll2): RES;
}

// @ts-ignore (extend)
export interface UnsafeBVirtualScroll<CTX extends bVirtualScroll2 = bVirtualScroll2> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	onRenderEngineStart: CTX['onRenderEngineStart'];
	// @ts-ignore (access)
	onRenderEngineDone: CTX['onRenderEngineDone'];
	// @ts-ignore (access)
	onElementEnters: CTX['onElementEnters'];
	// @ts-ignore (access)
	componentEmitter: CTX['componentEmitter'];
	// @ts-ignore (access)
	slotsStateController: CTX['slotsStateController'];
	// @ts-ignore (access)
	componentInternalState: CTX['componentInternalState'];
	// @ts-ignore (access)
	componentFactory: CTX['componentFactory'];
	// @ts-ignore (access)
	observer: CTX['observer'];
}
