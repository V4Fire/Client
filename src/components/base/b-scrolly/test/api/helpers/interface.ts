/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentItem, ComponentState, MountedChild, MountedItem } from 'components/base/b-scrolly/interface';
import type { ScrollyComponentObject } from 'components/base/b-scrolly/test/api/component-object';
import type { SpyObject } from 'tests/helpers/mock/interface';
import type { RequestInterceptor } from 'tests/helpers/providers/interceptor';

/**
 * The interface defining the data conveyor for convenient data manipulation.
 */
export interface DataConveyor<DATA = any> {
	/**
	 * Adds a specified number of data items to the conveyor.
	 *
	 * @param count - The number of data items to add.
	 * @returns An array containing the newly added data items.
	 */
	addData(count: number): DATA[];

	/**
	 * Adds a specified number of mounted items to the conveyor.
	 *
	 * @param count - The number of mounted items to add.
	 * @returns An array containing the newly added mounted items.
	 */
	addItems(count: number): MountedItem[];

	/**
	 * Adds a specified number of mounted child items (separators) to the conveyor.
	 *
	 * @param count - The number of mounted child items to add.
	 * @returns An array containing the newly added mounted child items.
	 */
	addSeparators(count: number): MountedChild[];

	/**
	 * Adds an array of component items as mounted child items to the conveyor.
	 *
	 * @param child - The array of component items to add as mounted child items.
	 * @returns The updated array of mounted child items.
	 */
	addChild(child: ComponentItem[]): MountedChild[];

	/**
	 * Resets the data conveyor, clearing all data and items.
	 */
	reset(): void;

	/**
	 * Retrieves the array of data items in the conveyor.
	 */
	get data(): DATA[];

	/**
	 * Returns a data page.
	 */
	get page(): number;

	/**
	 * Retrieves the array of mounted child items in the conveyor.
	 */
	get childList(): MountedChild[];

	/**
	 * Retrieves the array of last loaded data items in the conveyor.
	 */
	get lastLoadedData(): DATA[];

	/**
	 * Retrieves the array of mounted items in the conveyor.
	 */
	get items(): MountedItem[];
}

/**
 * The interface defining the API for manipulating the component state.
 */
export interface StateApi {
	/**
	 * Compiles and returns the assembled component state object.
	 *
	 * @param override - An object for overriding the current fields of the component state.
	 * @returns The compiled component state.
	 */
	compile(override?: Partial<ComponentState>): ComponentState;

	/**
	 * Resets the component state to its initial values.
	 */
	reset(): void;

	/**
	 * The data conveyor used for managing data within the component state.
	 */
	data: DataConveyor;
}

/**
 * Helpers returned by the `createTestHelpers` function.
 */
export interface ScrollyTestHelpers {
	/**
	 * The component object representing the `bScrolly` component.
	 */
	component: ScrollyComponentObject;

	/**
	 * The spy object for the `initLoad` function.
	 */
	initLoadSpy: SpyObject;

	/**
	 * The request interceptor provider.
	 */
	provider: RequestInterceptor;

	/**
	 * The state API object for convenient manipulation of the component's state fork.
	 */
	state: StateApi;
}

export interface IndexedObj {
	i: number;
}

export type DataItemCtor<COMPILED = any> = (i: number) => COMPILED;
export type MountedItemCtor<DATA = any> = (data: DATA, i: number) => MountedItem;
export type MountedSeparatorCtor<DATA = any> = (data: DATA, i: number) => MountedChild;

