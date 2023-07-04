/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { MountedChild, VirtualScrollState, MountedItem, PrivateComponentState } from 'components/base/b-virtual-scroll/interface';
import { isItem } from 'components/base/b-virtual-scroll/modules/helpers';
import { createInitialState, createPrivateInitialState } from 'components/base/b-virtual-scroll/modules/state/helpers';
import Friend from 'components/friends/friend';

/**
 * Friendly to the `bVirtualScroll` class that represents the internal state of a component.
 */
export class ComponentInternalState extends Friend {
	override readonly C!: bVirtualScroll;

	/**
	 * Current state of the component.
	 */
	protected state: VirtualScrollState = createInitialState();

	/**
	 * Current private state of the component.
	 */
	protected privateState: PrivateComponentState = createPrivateInitialState();

	/**
	 * Compiles and returns the current state of the component.
	 *
	 * @returns The current state of the component.
	 */
	compile(): Readonly<VirtualScrollState> {
		return this.state;
	}

	/**
	 * Resets the state of the component.
	 */
	reset(): void {
		this.state = createInitialState();
		this.privateState = createPrivateInitialState();
	}

	/**
	 * Increments the load page pointer.
	 */
	incrementLoadPage(): void {
		this.state.loadPage++;
	}
	/**
	 * Increments the render page pointer.
	 */
	incrementRenderPage(): void {
		this.state.renderPage++;
	}

	/**
	 * Updates the loaded data state.
	 *
	 * @param data - The new data to update the state.
	 * @param isInitialLoading - Indicates if it's the initial loading.
	 */
	updateData(data: object[], isInitialLoading: boolean): void {
		this.state.data = this.state.data.concat(data);
		this.state.isLastEmpty = data.length === 0;
		this.state.isInitialLoading = isInitialLoading;
		this.state.lastLoadedData = data;
	}

	/**
	 * Updates the arrays with mounted child elements of the component.
	 *
	 * @param mounted - The mounted child elements.
	 */
	updateMounted(mounted: MountedChild[]): void {
		const
			{state} = this,
			childList = <MountedChild[]>state.childList,
			itemsList = <MountedItem[]>state.items,
			newItems = <MountedItem[]>mounted.filter((child) => child.type === 'item');

		childList.push(...mounted);
		itemsList.push(...newItems);
	}

	/**
	 * Updates the state of the last raw loaded data.
	 *
	 * @param data - The last raw loaded data.
	 */
	setRawLastLoaded(data: unknown): void {
		this.state.lastLoadedRawData = data;
	}

	/**
	 * Sets the flag indicating if it's the initial render cycle.
	 *
	 * @param value - The value of the flag.
	 */
	setIsInitialRender(value: boolean): void {
		this.state.isInitialRender = value;
	}

	/**
	 * Sets the flag indicating if requests are stopped and the component won't make any more requests
	 * until the lifecycle is refreshed.
	 *
	 * @param value - The value of the flag.
	 */
	setIsRequestsStopped(value: boolean): void {
		this.state.isRequestsStopped = value;
	}

	/**
	 * Sets the flag indicating if the component's lifecycle is done.
	 *
	 * @param value - The value of the flag.
	 */
	setIsLifecycleDone(value: boolean): void {
		this.state.isLifecycleDone = value;
	}

	/**
	 * Sets the flag indicating if the component is currently loading data.
	 *
	 * @param value - The value of the flag.
	 */
	setIsLoadingInProgress(value: boolean): void {
		this.state.isLoadingInProgress = value;
	}

	/**
	 * Устанавливает флаг который указывает на то, что последняя загрузка завершилась с ошибкой.
	 *
	 * @param value
	 */
	setIsLastErrored(value: boolean): void {
		this.state.isLastErrored = value;
	}

	/**
	 * Sets the maximum viewed index based on the passed component's index.
	 *
	 * @param component - The component to compare and update the maximum viewed index.
	 */
	setMaxViewedIndex(component: MountedChild): void {
		const
			{state} = this,
			{childIndex} = component;

		if (isItem(component) && (state.maxViewedItem == null || state.maxViewedItem < component.itemIndex)) {
			state.maxViewedItem = component.itemIndex;
			state.itemsTillEnd = state.items.length - 1 - state.maxViewedItem;
		}

		if (state.maxViewedChild == null || state.maxViewedChild < childIndex) {
			state.maxViewedChild = component.childIndex;
			state.childTillEnd = state.childList.length - 1 - state.maxViewedChild;
		}
	}

	/**
	 * Returns the cursor indicating the last index of the last rendered data element.
	 */
	getRenderCursor(): number {
		return this.privateState.renderCursor;
	}

	/**
	 * Updates the cursor indicating the last index of the last rendered data element.
	 */
	updateRenderCursor(): void {
		const
			{ctx} = this;

		if (ctx.chunkSize != null) {
			const
				{state} = this,
				current = this.getRenderCursor(),
				chunkSize = ctx.getChunkSize(state);

			this.privateState.renderCursor = current + chunkSize;
		}
	}
}

