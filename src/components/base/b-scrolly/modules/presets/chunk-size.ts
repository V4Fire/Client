/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { canPerformRenderRejectionReason, CanPerformRenderResult, ComponentState } from 'components/base/b-scrolly/b-scrolly';

/**
 * Returns a data slice that should be rendered next
 */
export function getNextDataSlice(state: ComponentState, chunkSize: number): object[] {
	const
		{data, renderPage} = state,
		nextDataSliceStartIndex = renderPage * chunkSize,
		nextDataSliceEndIndex = (renderPage + 1) * chunkSize;

	return data.slice(nextDataSliceStartIndex, nextDataSliceEndIndex);
}

export const chunkSizePreset = {
		renderGuard(
			state: ComponentState,
			ctx: bScrolly,
			chunkSize: number
		): CanPerformRenderResult {
			const
				dataSlice = getNextDataSlice(state, chunkSize);

			if (dataSlice.length === 0) {
				if (state.isRequestsStopped) {
					return {
						result: false,
						reason: canPerformRenderRejectionReason.done
					};
				}

				return {
					result: false,
					reason: canPerformRenderRejectionReason.noData
				};
			}

			if (dataSlice.length < chunkSize) {
				return {
					result: false,
					reason: canPerformRenderRejectionReason.notEnoughData
				};
			}

			if (state.isInitialRender) {
				return {
					result: true
				};
			}

			const
				clientResponse = ctx.shouldPerformDataRender?.(state, ctx);

			return {
				result: clientResponse == null ? true : clientResponse,
				reason: clientResponse === false ? canPerformRenderRejectionReason.noPermission : undefined
			};
		},

		getNextDataSlice
};

