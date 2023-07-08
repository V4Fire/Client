/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

/**
 * Render strategy for producing the components.
 */
export interface ComponentRenderStrategy {
	/**
	 * An approach that reuses the current instance of the rendering engine whenever a new rendering is performed.
	 */
	reuse: 'reuse';

	/**
	 * The default approach, which creates a new instance of the rendering engine each time a new rendering is performed.
	 */
	default: 'default';
}

/**
 * Strategies for component operation modes.
 */
export interface ComponentStrategy {
	/**
	 * Strategy where element visibility is determined using `intersectionObserver`.
	 * Nodes will not be removed from the DOM tree.
	 */
	intersectionObserver: 'intersectionObserver';

	/**
	 * Strategy where element visibility is determined by listening to the `scroll` event.
	 * Nodes will not be removed from the DOM tree.
	 */
	scroll: 'scroll';

	/**
	 * Strategy where element visibility is determined by listening to the `scroll` event.
	 * Nodes will be removed from and returned to the DOM tree.
	 */
	scrollWithDropNodes: 'scrollWithDropNodes';

	/**
	 * Strategy where element visibility is determined by listening to the `scroll` event.
	 * Nodes from the DOM tree will be recycled.
	 */
	scrollWithRecycleNodes: 'scrollWithRecycleNodes';
}

/**
 * Component state.
 *
 * @typeParam DATA - Instance of the data element.
 * @typeParam RAW_DATA - The data loaded from the server but not yet processed.
 * This type parameter determines the type of the lastLoadedRawData property
 */
export interface VirtualScrollState<DATA = object, RAW_DATA = unknown> {
	/**
	 * The largest component index of type `item` that appeared in the viewport.
	 */
	maxViewedItem: CanUndef<number>;

	/**
	 * The largest component index of any type that appeared in the viewport.
	 */
	maxViewedChild: CanUndef<number>;

	/**
	 * The number of components of type `item` that have not yet been visible to the user.
	 */
	itemsTillEnd: CanUndef<number>;

	/**
	 * The number of components of any type that have not yet been visible to the user.
	 */
	childTillEnd: CanUndef<number>;

	/**
	 * The current page number for loading data.
	 * It changes after each successful data load.
	 */
	loadPage: number;

	/**
	 * The current page number for rendering data.
	 * It changes after each successful rendering.
	 */
	renderPage: number;

	/**
	 * Indicates if the last loaded data is empty.
	 */
	isLastEmpty: boolean;

	/**
	 * Indicates if the last data load ended with an error.
	 */
	isLastErrored: boolean;

	/**
	 * Indicates if the component is in the initial loading state.
	 */
	isInitialLoading: boolean;

	/**
	 * Indicates if the component is in the initial rendering state.
	 */
	isInitialRender: boolean;

	/**
	 * Indicates if the component has stopped making requests.
	 */
	isRequestsStopped: boolean;

	/**
	 * Indicates if there is an ongoing loading process.
	 */
	isLoadingInProgress: boolean;

	/**
	 * Indicates if the component's lifecycle is done, i.e., all data is rendered and loaded.
	 */
	isLifecycleDone: boolean;

	/**
	 * The last loaded data.
	 */
	lastLoadedData: Readonly<DATA[]>;

	/**
	 * The component data.
	 */
	data: Readonly<DATA[]>;

	/**
	 * List of all components of type `item` that have been rendered.
	 */
	items: Readonly<MountedItem[]>;

	/**
	 * List of all components that have been rendered.
	 */
	childList: Readonly<MountedChild[]>;

	/**
	 * The last loaded raw data.
	 */
	lastLoadedRawData: CanUndef<RAW_DATA>;
}

/**
 * Private (not accessible to the client) component state.
 *
 * This state stores all the internal component state that should not be
 * accessible to the client.
 */
export interface PrivateComponentState {
	/**
	 * Pointer to the index of the data element that was last rendered.
	 */
	dataCursor: number;
}

/**
 * Types of rendered components.
 */
export interface ComponentItemType {
	/**
	 * This type indicates that the component is the "main" component to render.
	 *
	 * For example, in the {@link VirtualScrollState} interface, you can notice that
	 * there are specific fields for the `item` type, such as `itemsTillEnd`.
	 *
	 * Components with this type are stored both in the `items` array and the `childList` array in
	 * {@link VirtualScrollState}.
	 */
	item: 'item';

	/**
	 * This type indicates that the component is "secondary".
	 *
	 * Components with this type are stored in the `childList` array in {@link VirtualScrollState}.
	 */
	separator: 'separator';
}

/**
 * Abstract representation of a component to be rendered.
 *
 * To render a `b-button` component with the default slot, the following set of parameters needs to be passed:
 *
 * @example
 * ```typescript
 * const bButton = {
 *   type: 'item',
 *   item: 'b-button',
 *   props: {
 *     id: 'button'
 *   },
 *   key: 'unique id',
 *   children: {
 *     default: 'Hello world'
 *   }
 * }
 * ```
 */
export interface ComponentItem {
	/**
	 * The type of the component (item or separator).
	 */
	type: keyof ComponentItemType;

	/**
	 * The name of the component, e.g., `b-button` or `section`.
	 */
	item: string;

	/**
	 * The component's properties.
	 */
	props?: Dictionary<unknown>;

	/**
	 * Unique key for this component (data set).
	 */
	key: string;

	/**
	 * Children nodes of the component.
	 */
	children?: VNodeChildren;
}

/**
 * Represents any mounted component (item or separator) within the DOM tree.
 */
export interface MountedChild extends ComponentItem {
	/**
	 * The DOM node associated with the component.
	 */
	node: HTMLElement;

	/**
	 * The index of the component within the list of children.
	 */
	childIndex: number;
}

/**
 * Represents a mounted item component within the DOM tree.
 */
export interface MountedItem extends MountedChild {
	/**
	 * The index of the item within the list of items.
	 */
	itemIndex: number;
}

/**
 * Represents the nodes of a component.
 */
export interface ComponentRefs {
	/**
	 * The container element in which components are rendered.
	 */
	container: HTMLElement;

	/**
	 * The slot that is displayed while data is being loaded.
	 */
	loader?: HTMLElement;

	/**
	 * The slot that is displayed for tombstones.
	 */
	tombstones?: HTMLElement;

	/**
	 * The slot that is displayed when data loading is complete and there is no data.
	 */
	empty?: HTMLElement;

	/**
	 * The slot that is displayed when a data loading error occurs.
	 */
	retry?: HTMLElement;

	/**
	 * The slot that is displayed when all data is loaded and rendered.
	 */
	done?: HTMLElement;

	/**
	 * The slot that is displayed when there is no active loading.
	 */
	renderNext?: HTMLElement;
}

/**
 * The type of data stored by the component.
 */
export interface ComponentDb {
	/**
	 * The component data.
	 */
	data: unknown[];

	/**
	 * The total number of data items.
	 */
	total?: number;
}

/**
 * Typeof {@link bVirtualScroll.itemsFactory}.
 */
export interface ComponentItemFactory<DATA = unknown> {
	(state: VirtualScrollState<DATA>, ctx: bVirtualScroll): ComponentItem[];
}
