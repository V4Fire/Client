/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iVirtualScrollProps from 'components/base/b-virtual-scroll/props';

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { MountedChild } from 'components/base/b-virtual-scroll/interface';

import { bVirtualScrollAsyncGroup, componentEvents } from 'components/base/b-virtual-scroll/const';
import { isAsyncReplaceError } from 'components/base/b-virtual-scroll/modules/helpers';

import iData, { component } from 'components/super/i-data/i-data';

/**
 * A class that provides an API to handle events emitted by the {@link bVirtualScroll} component.
 * This class is designed to work in conjunction with {@link bVirtualScroll}.
 */
@component()
export abstract class iVirtualScrollHandlers extends iVirtualScrollProps {
	/**
	 * Handler: component reset event.
	 * Resets the component state to its initial state.
	 */
	protected onReset(this: bVirtualScroll): void {
		this.componentInternalState.reset();
		this.observer.reset();

		this.async.clearAll({group: new RegExp(bVirtualScrollAsyncGroup)});

		this.componentEmitter.emit(componentEvents.resetState);
	}

	/**
	 * Handler: render start event.
	 * Triggered when the component rendering starts.
	 */
	protected onRenderStart(this: bVirtualScroll): void {
		this.componentEmitter.emit(componentEvents.renderStart);
	}

	/**
	 * Handler: render engine start event.
	 * Triggered when the component rendering using the rendering engine starts.
	 */
	protected onRenderEngineStart(this: bVirtualScroll): void {
		this.componentEmitter.emit(componentEvents.renderEngineStart);
	}

	/**
	 * Handler: render engine done event.
	 * Triggered when the component rendering using the rendering engine is completed.
	 */
	protected onRenderEngineDone(this: bVirtualScroll): void {
		this.componentEmitter.emit(componentEvents.renderEngineDone);
	}

	/**
	 * Handler: DOM insert start event.
	 * Triggered when the insertion of rendered components into the DOM tree starts.
	 *
	 * @param childList
	 */
	protected onDomInsertStart(this: bVirtualScroll, childList: MountedChild[]): void {
		this.componentInternalState.updateDataOffset();
		this.componentInternalState.updateMounted(childList);
		this.componentInternalState.setIsInitialRender(false);
		this.componentInternalState.incrementRenderPage();

		this.componentEmitter.emit(componentEvents.domInsertStart);
	}

	/**
	 * Handler: DOM insert done event.
	 * Triggered when the insertion of rendered components into the DOM tree is completed.
	 */
	protected onDomInsertDone(this: bVirtualScroll): void {
		this.componentEmitter.emit(componentEvents.domInsertDone);
	}

	/**
	 * Handler: render done event.
	 * Triggered when rendering is completed.
	 */
	protected onRenderDone(this: bVirtualScroll): void {
		this.componentEmitter.emit(componentEvents.renderDone);
	}

	/**
	 * Handler: lifecycle done event.
	 * Triggered when the internal lifecycle of the component is completed.
	 */
	protected onLifecycleDone(this: bVirtualScroll): void {
		const
			state = this.getVirtualScrollState();

		if (state.isLifecycleDone) {
			return;
		}

		this.slotsStateController.doneState();
		this.componentInternalState.setIsLifecycleDone(true);
		this.componentEmitter.emit(componentEvents.lifecycleDone);
	}

	/**
	 * Handler: convert data to database event.
	 * Triggered when the loaded data is converted.
	 *
	 * @param data - The converted data.
	 */
	protected onConvertDataToDB(this: bVirtualScroll, data: unknown): void {
		this.componentInternalState.setRawLastLoaded(data);
		this.componentEmitter.emit(componentEvents.convertDataToDB, data);
	}

	/**
	 * Handler: data load start event.
	 * Triggered when data loading starts.
	 *
	 * @param isInitialLoading - Indicates whether it is an initial component loading.
	 */
	protected onDataLoadStart(this: bVirtualScroll, isInitialLoading: boolean): void {
		this.componentInternalState.setIsLoadingInProgress(true);
		this.componentInternalState.setIsLastErrored(false);
		this.slotsStateController.loadingProgressState(isInitialLoading);

		this.componentEmitter.emit(componentEvents.dataLoadStart, isInitialLoading);
	}

	/**
	 * Handler: data load success event.
	 * Triggered when data loading is successfully completed.
	 *
	 * @param isInitialLoading - Indicates whether it is an initial component loading.
	 * @param data - The loaded data.
	 * @throws {@link ReferenceError} if the loaded data does not have a "data" field.
	 */
	protected onDataLoadSuccess(this: bVirtualScroll, isInitialLoading: boolean, data: unknown): void {
		this.componentInternalState.setIsLoadingInProgress(false);

		if (!Object.isPlainObject(data) || !Array.isArray(data.data)) {
			throw new ReferenceError('Missing "data" field in the loaded data');
		}

		this.componentInternalState.updateData(data.data, isInitialLoading);
		this.componentInternalState.incrementLoadPage();

		const
			isRequestsStopped = this.shouldStopRequestingDataWrapper();

		this.componentEmitter.emit(componentEvents.dataLoadSuccess, data.data, isInitialLoading);

		this.slotsStateController.loadingSuccessState();

		if (
			isInitialLoading &&
			isRequestsStopped &&
			Object.size(data.data) === 0
		) {
			this.onDataEmpty();
			this.onLifecycleDone();

		} else {
			this.loadDataOrPerformRender();
		}
	}

	/**
	 * Handler: data load error event.
	 * Triggered when data loading fails.
	 *
	 * @param isInitialLoading - Indicates whether it is an initial component loading.
	 */
	protected onDataLoadError(this: bVirtualScroll, isInitialLoading: boolean): void {
		this.componentInternalState.setIsLoadingInProgress(false);
		this.componentInternalState.setIsLastErrored(true);
		this.slotsStateController.loadingFailedState();

		this.componentEmitter.emit(componentEvents.dataLoadError, isInitialLoading);
	}

	protected override onRequestError(this: bVirtualScroll, ...args: Parameters<iData['onRequestError']>): ReturnType<iData['onRequestError']> {
		const
			err = args[0];

		if (isAsyncReplaceError(err)) {
			return;
		}

		const
			state = this.getVirtualScrollState();

		this.onDataLoadError(state.isInitialLoading);
		return super.onRequestError(err, this.initLoad.bind(this));
	}

	/**
	 * Handler: data empty event.
	 * Triggered when the loaded data is empty.
	 */
	protected onDataEmpty(this: bVirtualScroll): void {
		this.slotsStateController.emptyState();

		this.componentEmitter.emit(componentEvents.dataLoadEmpty);
	}

	/**
	 * Handler: component enters the viewport.
	 * @param component - The component that enters the viewport.
	 */
	protected onElementEnters(this: bVirtualScroll, component: MountedChild): void {
		this.componentInternalState.setMaxViewedIndex(component);
		this.loadDataOrPerformRender();

		this.componentEmitter.emit(componentEvents.elementEnter, component);
	}
}
