/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { axis } from 'base/b-virtual-scroll/b-virtual-scroll';

export type Axis = keyof typeof axis;

export type RequestQuery<T extends unknown = unknown> = (params: RequestMoreParams<T>) => Dictionary<Dictionary>;
export type RequestFn<T extends unknown = unknown> = (params: RequestMoreParams<T>) => boolean;

export type RequestParams = CanUndef<Record<string, Dictionary>>;

export interface OptionEl<T extends unknown = unknown> {
	/**
	 * Current render component data
	 */
	current: T;

	/**
	 * Previous render component
	 */
	prev: CanUndef<T>;

	/**
	 * Next render component
	 */
	next: CanUndef<T>;
}

export interface RequestMoreParams<T extends unknown = unknown> {
	/**
	 * Number of last loaded page
	 */
	currentPage: number;

	/**
	 * Number of chunk to be uploaded
	 */
	nextPage: number;

	/**
	 * Number of items that can be showed until bottom of the page will be reached
	 */
	itemsToReachBottom: number;

	/**
	 * Render items
	 */
	items: RenderItem<T>[];

	/**
	 * True if last requested data response answered with empty data
	 */
	isLastEmpty: boolean;

	/**
	 * Last loaded data chunk
	 */
	lastLoadedData: Array<T>;
}

export interface RemoteData {
	/**
	 * Data for components rendering
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
	 * Destructor of DOM node
	 */
	destructor: CanUndef<Function>;

	/**
	 * Index of element in DOM
	 */
	index: number;
}
