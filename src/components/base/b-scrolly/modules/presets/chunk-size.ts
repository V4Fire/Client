/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';

import { renderGuardRejectionReason } from 'components/base/b-scrolly/const';
import type { RenderGuardResult, ComponentState } from 'components/base/b-scrolly/interface';

/**
 * Returns the next slice of data that should be rendered.
 *
 * @param state
 * @param chunkSize
 */
export function getNextDataSlice(state: ComponentState, chunkSize: number): object[] {
	const
		{data, renderPage} = state,
		nextDataSliceStartIndex = renderPage * chunkSize,
		nextDataSliceEndIndex = (renderPage + 1) * chunkSize;

	return data.slice(nextDataSliceStartIndex, nextDataSliceEndIndex);
}

/**
 * A preset configuration for the chunk size.
 */
export const chunkSizePreset = {
	/**
	 * A guard function that determines if the render can be performed based on the current state and chunk size.
	 *
	 * @param state
	 * @param ctx
	 * @param chunkSize
	 */
	renderGuard(
		state: ComponentState,
		ctx: bScrolly,
		chunkSize: number
	): RenderGuardResult {
		const dataSlice = getNextDataSlice(state, chunkSize);

		if (dataSlice.length === 0) {
			if (state.isRequestsStopped) {
				return {
					result: false,
					reason: renderGuardRejectionReason.done
				};
			}

			return {
				result: false,
				reason: renderGuardRejectionReason.noData
			};
		}

		if (dataSlice.length < chunkSize) {
			return {
				result: false,
				reason: renderGuardRejectionReason.notEnoughData
			};
		}

		if (state.isInitialRender) {
			return {
				result: true
			};
		}

		const clientResponse = ctx.shouldPerformDataRender?.(state, ctx);

		return {
			result: clientResponse == null ? true : clientResponse,
			reason: clientResponse === false ? renderGuardRejectionReason.noPermission : undefined
		};
	},

	getNextDataSlice
};
