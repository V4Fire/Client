/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';
import ChunkRequest from 'base/b-virtual-scroll/modules/chunk-request';
import { DataState } from 'base/b-virtual-scroll/interface';

/**
 * Returns accumulated data among `b-virtual-scroll`,` chunk-render`, `chunk-request` and passes it to the client
 * to make any decisions, for example, one more chunk of data needs to be loaded
 *
 * @param [chunkRequestCtx]
 * @param [chunkRenderCtx]
 * @param [merge]
 *
 * @typeParam ITEM - data item to render
 * @typeParam RAW - raw provider data
 */
export function getRequestParams<ITEM extends unknown = unknown, RAW extends unknown = unknown>(
	chunkRequestCtx?: ChunkRequest,
	chunkRenderCtx?: ChunkRender,
	merge?: Dictionary
): DataState<ITEM, RAW> {
	const
		component = chunkRenderCtx?.component ?? chunkRequestCtx?.component,
		pendingData = chunkRequestCtx?.pendingData ?? [];

	const lastLoadedData = <CanUndef<ITEM[]>>chunkRequestCtx?.lastLoadedChunk.normalized;

	const base: DataState<ITEM, RAW> = {
		currentPage: 0,
		nextPage: 1,

		data: [],
		items: [],
		isLastEmpty: false,
		itemsTillBottom: 0,
		total: undefined,

		pendingData,

		lastLoadedData: lastLoadedData ?? [],
		lastLoadedChunk: {
			raw: undefined,
			normalized: lastLoadedData ?? []
		}
	};

	const params = chunkRequestCtx && chunkRenderCtx ?
		{
			items: chunkRenderCtx.items,
			itemsTillBottom: chunkRenderCtx.items.length - chunkRenderCtx.lastIntersectsItem,

			currentPage: chunkRequestCtx.page,
			isLastEmpty: chunkRequestCtx.isLastEmpty,
			total: component?.unsafe.total,

			pendingData,
			data: chunkRequestCtx.data,

			lastLoadedData: lastLoadedData ?? [],
			lastLoadedChunk: {
				raw: chunkRequestCtx.lastLoadedChunk.raw,
				normalized: lastLoadedData ?? []
			}
		} :
		base;

	const
		mergeLastLoadedChunk = <DataState['lastLoadedChunk']>merge?.lastLoadedChunk;

	const merged = {
		...params,
		...merge,
		lastLoadedChunk: {
			...params.lastLoadedChunk,
			...mergeLastLoadedChunk
		}
	};

	return <DataState<ITEM, RAW>>{
		...merged,
		nextPage: merged.currentPage + 1
	};
}

/**
 * True if the specified value is an `async replace` error
 * @param val
 */
export function isAsyncReplaceError(val: unknown): boolean {
	return Object.isPlainObject(val) && val.join === 'replace';
}

/**
 * True if the specified value is an `async clear` error
 * @param val
 */
export function isAsyncClearError(val: unknown): boolean {
	return Object.isPlainObject(val) && val.type === 'clearAsync';
}
