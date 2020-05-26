/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { UnsafeIData } from 'super/i-data/i-data';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
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

export interface RequestMoreParams<T extends unknown = unknown> {
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
	 * True if the last requested data response was empty
	 */
	isLastEmpty: boolean;

	/**
	 * Last loaded data chunk
	 */
	lastLoadedData: Array<T>;
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

// @ts-ignore
export interface UnsafeBVirtualScroll<CTX extends bVirtualScroll = bVirtualScroll> extends UnsafeIData<CTX> {
	// @ts-ignore (access)
	scrollRender: CTX['scrollRender'];

	// @ts-ignore (access)
	scrollRequest: CTX['scrollRequest'];

	// @ts-ignore (access)
	componentRender: CTX['componentRender'];

	// @ts-ignore (access)
	getOptionKey: CTX['getOptionKey'];
}

export interface UnsafeScrollRender {
	onRequestsDone: ScrollRender['onRequestsDone'];
	asyncGroup: ScrollRender['asyncGroup'];
}

export interface UnsafeScrollRequest {

}

export interface DataToRender {
	itemAttrs: Dictionary;
	itemParams: OptionEl;
	index: number;
}
