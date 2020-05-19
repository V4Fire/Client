/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import bVirtualScroll, { Unsafe as SuperUnsafe } from 'base/b-virtual-scroll/b-virtual-scroll';

import ScrollRender from 'base/b-virtual-scroll/modules/scroll-render';

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

/**
 * @typeParam DataItem - render data
 * @typeParam RawData - raw loaded data
 */
export interface RequestMoreParams<DataItem extends unknown = unknown, RawData extends unknown = unknown> {
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
	items: RenderItem<DataItem>[];

	/**
	 * True if the last requested data response was empty
	 */
	isLastEmpty: boolean;

	/**
	 * Last loaded data chunk
	 */
	lastLoadedChunk: {
		/**
		 * Normalized data (processed with `dbConverter`)
		 */
		normalized: Array<DataItem>;

		/**
		 * Raw data that was loaded from the server
		 */
		raw: RawData;
	}

	/**
	 * @deprecated
	 * @see RequestMoreParams.lastLoadedChunk
	 */
	lastLoadedData: Array<DataItem>;
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
	scrollRender: bVirtualScroll['scrollRender'];
	scrollRequest: bVirtualScroll['scrollRequest'];
	componentRender: bVirtualScroll['componentRender'];
	getOptionKey: bVirtualScroll['getOptionKey'];
	getDefaultRequestParams: bVirtualScroll['getDefaultRequestParams'];
	convertDataToDB: bVirtualScroll['convertDataToDB'];
	dp: bVirtualScroll['dp'];
	total: bVirtualScroll['total'];
	localState: bVirtualScroll['localState'];
}

export interface UnsafeScrollRender {
	asyncGroup: ScrollRender['asyncGroup'];
}

export interface UnsafeScrollRequest {

}

/**
 * Last loaded data chunk
 */
export interface LastLoadedChunk<NormalizedData extends unknown = unknown[], RawData extends unknown = unknown> {
	normalized: NormalizedData;
	raw: RawData;
}

export interface DataToRender {
	itemAttrs: Dictionary;
	itemParams: OptionEl;
	index: number;
}

/**
 * The local state of the component
 *
 *   *) `error` - indicates that loading error appear
 *
 *   *) `loading` - indicates that component now loading the first chunk of data
 *
 *   *) `ready` - indicates that component now is ready to render data
 */
export type LocalState = 'loading' | 'ready' | 'error';
