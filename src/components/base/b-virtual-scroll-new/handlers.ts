/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iVirtualScrollProps from 'components/base/b-virtual-scroll-new/props';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { MountedChild } from 'components/base/b-virtual-scroll-new/interface';

import { bVirtualScrollNewAsyncGroup, componentEvents, componentLocalEvents } from 'components/base/b-virtual-scroll-new/const';
import { isAsyncReplaceError } from 'components/base/b-virtual-scroll-new/modules/helpers';

import iData, { component } from 'components/super/i-data/i-data';

const $$ = symbolGenerator();

/**
 * A class that provides an API to handle events emitted by the {@link bVirtualScrollNew} component.
 * This class is designed to work in conjunction with {@link bVirtualScrollNew}.
 */
@component()
export abstract class iVirtualScrollHandlers extends iVirtualScrollProps {
	/**
	 * Handler: component reset event.
	 * Resets the component state to its initial state.
	 */
	protected onReset(this: bVirtualScrollNew): void {
		this.componentInternalState.reset();
		this.observer.reset();

		this.async.clearAll({group: new RegExp(bVirtualScrollNewAsyncGroup)});

		this.componentEmitter.emit(componentEvents.resetState);
	}

	/**
	 * Handler: render start event.
	 * Triggered when the component rendering starts.
	 */
	protected onRenderStart(this: bVirtualScrollNew): void {
		this.componentInternalState.updateIsLastRender();
		this.componentEmitter.emit(componentEvents.renderStart);
	}

	/**
	 * Handler: render engine start event.
	 * Triggered when the component rendering using the rendering engine starts.
	 */
	protected onRenderEngineStart(this: bVirtualScrollNew): void {
		this.componentEmitter.emit(componentEvents.renderEngineStart);
	}

	/**
	 * Handler: render engine done event.
	 * Triggered when the component rendering using the rendering engine is completed.
	 */
	protected onRenderEngineDone(this: bVirtualScrollNew): void {
		this.componentEmitter.emit(componentEvents.renderEngineDone);
	}

	/**
	 * Handler: DOM insert start event.
	 * Triggered when the insertion of rendered components into the DOM tree starts.
	 *
	 * @param childList
	 */
	protected onDomInsertStart(this: bVirtualScrollNew, childList: MountedChild[]): void {
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
	protected onDomInsertDone(this: bVirtualScrollNew): void {
		this.componentEmitter.emit(componentEvents.domInsertDone);
	}

	/**
	 * Handler: render done event.
	 * Triggered when rendering is completed.
	 */
	protected onRenderDone(this: bVirtualScrollNew): void {
		this.componentEmitter.emit(componentEvents.renderDone);
		this.localEmitter.emit(componentLocalEvents.renderCycleDone);
	}

	/**
	 * Handler: lifecycle done event.
	 * Triggered when the internal lifecycle of the component is completed.
	 */
	protected onLifecycleDone(this: bVirtualScrollNew): void {
		const
			state = this.getVirtualScrollState(),
			isDomInsertInProgress = this.componentInternalState.getIsDomInsertInProgress();

		if (state.isLifecycleDone) {
			return;
		}

		const handler = () => {
			this.slotsStateController.doneState();
			this.componentInternalState.setIsLifecycleDone(true);
			this.componentEmitter.emit(componentEvents.lifecycleDone);
		};

		if (isDomInsertInProgress) {
			this.localEmitter.once(componentLocalEvents.renderCycleDone, handler, {
				group: bVirtualScrollNewAsyncGroup,
				label: $$.waitUntilRenderDone
			});

			return;
		}

		return handler();
	}

	/**
	 * Handler: convert data to database event.
	 * Triggered when the loaded data is converted.
	 *
	 * @param data - the converted data.
	 */
	protected onConvertDataToDB(this: bVirtualScrollNew, data: unknown): void {
		this.componentInternalState.setRawLastLoaded(data);
		this.componentEmitter.emit(componentEvents.convertDataToDB, data);
	}

	/**
	 * Handler: data load start event.
	 * Triggered when data loading starts.
	 *
	 * @param isInitialLoading - indicates whether it is an initial component loading.
	 */
	protected onDataLoadStart(this: bVirtualScrollNew, isInitialLoading: boolean): void {
		this.componentInternalState.setIsLoadingInProgress(true);
		this.componentInternalState.setIsLastErrored(false);
		this.slotsStateController.loadingProgressState(isInitialLoading);

		this.componentEmitter.emit(componentEvents.dataLoadStart, isInitialLoading);
	}

	/**
	 * Handler: data load success event.
	 * Triggered when data loading is successfully completed.
	 *
	 * @param isInitialLoading - indicates whether it is an initial component loading.
	 * @param data - the loaded data.
	 * @throws {@link ReferenceError} if the loaded data does not have a "data" field.
	 */
	protected onDataLoadSuccess(this: bVirtualScrollNew, isInitialLoading: boolean, data: unknown): void {
		this.componentInternalState.setIsLoadingInProgress(false);

		const
			dataToProvide = Object.isPlainObject(data) ? data.data : data;

		if (!Array.isArray(dataToProvide)) {
			throw new ReferenceError('Missing data to perform render');
		}

		this.componentInternalState.updateData(dataToProvide, isInitialLoading);
		this.componentInternalState.incrementLoadPage();

		const
			isRequestsStopped = this.shouldStopRequestingDataWrapper();

		this.componentEmitter.emit(componentEvents.dataLoadSuccess, dataToProvide, isInitialLoading);
		this.slotsStateController.loadingSuccessState();

		if (
			isInitialLoading &&
			isRequestsStopped &&
			Object.size(dataToProvide) === 0
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
	 * @param isInitialLoading - indicates whether it is an initial component loading.
	 */
	protected onDataLoadError(this: bVirtualScrollNew, isInitialLoading: boolean): void {
		this.componentInternalState.setIsLoadingInProgress(false);
		this.componentInternalState.setIsLastErrored(true);
		this.slotsStateController.loadingFailedState();

		this.componentEmitter.emit(componentEvents.dataLoadError, isInitialLoading);
	}

	protected override onRequestError(this: bVirtualScrollNew, ...args: Parameters<iData['onRequestError']>): ReturnType<iData['onRequestError']> {
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
	protected onDataEmpty(this: bVirtualScrollNew): void {
		this.slotsStateController.emptyState();

		this.componentEmitter.emit(componentEvents.dataLoadEmpty);
	}

	/**
	 * Handler: component enters the viewport
	 * @param component - the component that enters the viewport.
	 */
	protected onElementEnters(this: bVirtualScrollNew, component: MountedChild): void {
		this.componentInternalState.setMaxViewedIndex(component);
		this.loadDataOrPerformRender();

		this.componentEmitter.emit(componentEvents.elementEnter, component);
	}

	/**
	 * Handler: The tombstones slot entered the viewport
	 */
	protected onTombstonesEnter(this: bVirtualScrollNew): void {
		this.componentInternalState.setIsTombstonesInView(true);
		this.loadDataOrPerformRender();
	}

	/**
	 * Handler: The tombstones slot leaves the viewport
	 */
	protected onTombstonesLeave(this: bVirtualScrollNew): void {
		this.componentInternalState.setIsTombstonesInView(false);
	}

	/**
	 * Handler: items to render was updated
	 * @param items
	 */
	protected onItemsInit(this: bVirtualScrollNew, items: Exclude<bVirtualScrollNew['items'], undefined>): void {
		this.onDataLoadSuccess(true, items);
	}
}
