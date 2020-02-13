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

export interface Unsafe<T extends iBlock = bVirtualScroll> extends SuperUnsafe<T> {
	scrollRender: bVirtualScroll['scrollRender'];
	scrollRequest: bVirtualScroll['scrollRequest'];
	componentRender: bVirtualScroll['componentRender'];
	getOptionKey: bVirtualScroll['getOptionKey'];
	getDefaultRequestParams: bVirtualScroll['getDefaultRequestParams'];
	convertDataToDB: bVirtualScroll['convertDataToDB'];
}

export interface UnsafeScrollRender {
	onRequestsDone: ScrollRender['onRequestsDone'];
}

export interface UnsafeScrollRequest {

}
