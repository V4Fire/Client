/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import bVirtualScroll, { Unsafe as SuperUnsafe } from 'base/b-virtual-scroll/b-virtual-scroll';

import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';
import ChunkRequest from 'base/b-virtual-scroll/modules/chunk-request';

export interface RequestQueryFn<T extends unknown = unknown> {
	(params: RequestMoreParams<T>): Dictionary<Dictionary>;
}
export interface RequestFn<T extends unknown = unknown> {
	(params: RequestMoreParams<T>): boolean;
}

export interface GetData<T extends unknown = unknown> {
	(ctx: bVirtualScroll, query: CanUndef<Dictionary>): Promise<T>;
}

export interface OptionEl<T extends unknown = unknown> {
	/**
	 * Current render data
	 */
	current: T;

	/**
	 * Previous render data
	 */
	prev: CanUndef<T>;

	/**
	 * Next render data
	 */
	next: CanUndef<T>;
}

export interface RequestMoreParams<T extends unknown = unknown, V extends unknown = unknown> {
	/**
	 * Number of the last loaded page
	 */
	currentPage: number;

	/**
	 * Number of a page to upload
	 */
	nextPage: number;

	/**
	 * Number of items to show till the page bottom is reached
	 */
	itemsTillBottom: number;

	/**
	 * Items to render
	 */
	items: RenderItem<T>[];

	/**
	 * Data that pending to be rendered
	 */
	pendingData: unknown[];

	/**
	 * True if the last requested data response was empty
	 */
	isLastEmpty: boolean;

	/**
	 * Last loaded data chunk
	 */
	lastLoadedData: Array<T>;

	/**
	 * Last loaded chunk of data that did not go through processing `dbConverter`
	 */
	rawLastLoadedData: V;
}

export interface RemoteData {
	/**
	 * Data to render components
	 */
	data: unknown[];

	/**
	 * Total number of elements
	 */
	total?: number;
}

export interface RenderItem<T extends unknown = unknown> {
	/**
	 * Component data
	 */
	data: T;

	/**
	 * Component DOM node
	 */
	node: CanUndef<HTMLElement>;

	/**
	 * Component destructor
	 */
	destructor: CanUndef<Function>;

	/**
	 * Component position in a DOM tree
	 */
	index: number;
}

export interface Unsafe<T extends iBlock = bVirtualScroll> extends SuperUnsafe<T> {
	chunkRender: bVirtualScroll['chunkRender'];
	chunkRequest: bVirtualScroll['chunkRequest'];
	componentRender: bVirtualScroll['componentRender'];
	getOptionKey: bVirtualScroll['getOptionKey'];
	getDefaultRequestParams: bVirtualScroll['getDefaultRequestParams'];
	convertDataToDB: bVirtualScroll['convertDataToDB'];
	dp: bVirtualScroll['dp'];
	total: bVirtualScroll['total'];
	localState: bVirtualScroll['localState'];
}

export interface UnsafeChunkRender {
	onRequestsDone: ChunkRequest['onRequestsDone'];
	asyncGroup: ChunkRender['asyncGroup'];
}

export interface UnsafeChunkRequest {
	pendingData: ChunkRequest['pendingData'];
}

export interface DataToRender {
	itemAttrs: Dictionary;
	itemParams: OptionEl;
	index: number;
}

/**
 * Local state of component
 *
 *   *) `error` - indicates that loading error appear
 *
 *   *) `loading` - indicates that component now loading first chunk of data
 *
 *   *) `ready` - indicates that component now is ready to render data
 */
export type LocalState = 'loading' | 'ready' | 'error';
