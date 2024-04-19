/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import { isItem } from 'components/base/b-virtual-scroll-new/modules/helpers';
import { createInitialState, createPrivateInitialState } from 'components/base/b-virtual-scroll-new/modules/state/helpers';
import type { MountedChild, VirtualScrollState, MountedItem, PrivateComponentState } from 'components/base/b-virtual-scroll-new/interface';

/**
 * Friendly to the `bVirtualScrollNew` class that represents the internal state of a component.
 */
export class ComponentInternalState extends Friend {
	override readonly C!: bVirtualScrollNew;

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
	 * Resets the state of the component
	 */
	reset(): void {
		this.state = createInitialState();
		this.privateState = createPrivateInitialState();
	}

	/**
	 * Increments the load page pointer
	 */
	incrementLoadPage(): void {
		this.state.loadPage++;
	}

	/**
	 * Increments the render page pointer
	 */
	incrementRenderPage(): void {
		this.state.renderPage++;
	}

	/**
	 * Updates the loaded data state.
	 *
	 * @param data - the new data to update the state.
	 * @param isInitialLoading - indicates if it's the initial loading.
	 */
	updateData(data: object[], isInitialLoading: boolean): void {
		this.state.data = this.state.data.concat(data);
		this.state.isLastEmpty = data.length === 0;
		this.state.isInitialLoading = isInitialLoading;
		this.state.lastLoadedData = data;
	}

	/**
	 * Updates the arrays with mounted child elements of the component
	 * @param mounted - the mounted child elements.
	 */
	updateMounted(mounted: MountedChild[]): void {
		const
			{state} = this,
			childList = <MountedChild[]>state.childList,
			itemsList = <MountedItem[]>state.items,
			newItems = <MountedItem[]>mounted.filter((child) => child.type === 'item');

		childList.push(...mounted);
		itemsList.push(...newItems);

		this.updateRemainingChildren();
	}

	/**
	 * Updates the indicator that shows whether the current rendering process is the
	 * last one in this lifecycle.
	 */
	updateIsLastRender(): void {
		const
			{state, ctx} = this;

		if (!state.areRequestsStopped) {
			return;
		}

		const
			chunkSize = ctx.getChunkSize(state),
			dataOffset = this.getDataOffset() + chunkSize;

		if (<CanUndef<object>>state.data[dataOffset] == null) {
			state.isLastRender = true;
		}
	}

	/**
	 * Updates the state of the last raw loaded data
	 * @param data - the last raw loaded data.
	 */
	setRawLastLoaded(data: unknown): void {
		this.state.lastLoadedRawData = data;
	}

	/**
	 * Sets the flag indicating if it's the initial render cycle
	 * @param value - the value of the flag.
	 */
	setIsInitialRender(value: boolean): void {
		this.state.isInitialRender = value;
	}

	/**
	 * Sets the flag indicating that the process of inserting components into the DOM tree is currently in progress
	 * @param value
	 */
	setIsDomInsertInProgress(value: boolean): void {
		this.privateState.isDomInsertInProgress = value;
	}

	/**
	 * Sets the flag indicating if requests are stopped and the component won't make any more requests
	 * until the lifecycle is refreshed.
	 *
	 * @param value - the value of the flag.
	 */
	setIsRequestsStopped(value: boolean): void {
		this.state.areRequestsStopped = value;
	}

	/**
	 * Sets a flag indicating whether the tombstones slot is in the viewport
	 * @param value
	 */
	setIsTombstonesInView(value: boolean): void {
		this.state.isTombstonesInView = value;
	}

	/**
	 * Sets the flag indicating if the component's lifecycle is done
	 * @param value - the value of the flag.
	 */
	setIsLifecycleDone(value: boolean): void {
		this.state.isLifecycleDone = value;
	}

	/**
	 * Sets the flag indicating if the component is currently loading data
	 * @param value - the value of the flag.
	 */
	setIsLoadingInProgress(value: boolean): void {
		this.state.isLoadingInProgress = value;
	}

	/**
	 * Sets a flag indicating whether the last load operation ended with an error
	 * @param value - the value to set.
	 */
	setIsLastErrored(value: boolean): void {
		this.state.isLastErrored = value;
	}

	/**
	 * Sets the maximum viewed index based on the passed component's index
	 * @param component - the component to compare and update the maximum viewed index.
	 */
	setMaxViewedIndex(component: MountedChild): void {
		const
			{state} = this,
			{childIndex} = component;

		if (isItem(component) && (state.maxViewedItem == null || state.maxViewedItem < component.itemIndex)) {
			state.maxViewedItem = component.itemIndex;
			state.remainingItems = state.items.length - 1 - state.maxViewedItem;
		}

		if (state.maxViewedChild == null || state.maxViewedChild < childIndex) {
			state.maxViewedChild = component.childIndex;
			state.remainingChildren = state.childList.length - 1 - state.maxViewedChild;
		}

		this.updateRemainingChildren();
	}

	/**
	 * Returns the cursor indicating the last index of the last rendered data element
	 */
	getDataOffset(): number {
		return this.state.dataOffset;
	}

	/**
	 * Returns the value of the flag indicating whether the process
	 * of inserting components into the DOM tree is currently in progress
	 */
	getIsDomInsertInProgress(): boolean {
		return this.privateState.isDomInsertInProgress;
	}

	/**
	 * Updates the cursor indicating the last index of the last rendered data element
	 */
	updateDataOffset(): void {
		const
			{ctx, state} = this,
			current = this.getDataOffset(),
			chunkSize = ctx.getChunkSize(state);

		this.state.dataOffset = current + chunkSize;
	}

	/**
	 * Updates the state of the tillEnd-like fields.
	 * Calculates the remaining number of child elements until the end and the remaining number of items until the end.
	 */
	updateRemainingChildren(): void {
		const
			{state} = this;

		if (state.maxViewedChild == null) {
			state.remainingChildren = state.childList.length - 1;

		} else {
			state.remainingChildren = state.childList.length - 1 - state.maxViewedChild;
		}

		if (state.maxViewedItem == null) {
			state.remainingItems = state.items.length - 1;

		} else {
			state.remainingItems = state.items.length - 1 - state.maxViewedItem;
		}
	}
}

