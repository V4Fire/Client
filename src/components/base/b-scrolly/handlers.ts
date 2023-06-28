/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bScrollyProps from 'components/base/b-scrolly/props';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { bScrollyAsyncGroup, componentEvents } from 'components/base/b-scrolly/const';
import iData, { component } from 'super/i-data/i-data';
import type { MountedChild } from 'components/base/b-scrolly/interface';
import { isAsyncReplaceError } from 'components/base/b-scrolly/modules/helpers';

/**
 * A class that provides an API to handle events emitted by the {@link bScrolly} component.
 * This class is designed to work in conjunction with {@link bScrolly}.
 */
@component()
export abstract class bScrollyHandlers extends bScrollyProps {

	/**
	 * Handler: component reset event.
	 * Resets the component state to its initial state.
	 */
	onReset(): void {
		this.componentInternalState.reset();
		this.observer.reset();

		this.async.clearAll({group: new RegExp(bScrollyAsyncGroup)});

		this.componentEmitter.emit(componentEvents.resetState);
	}

	/**
	 * Handler: render start event.
	 * Triggered when the component rendering starts.
	 */
	onRenderStart(): void {
		this.componentEmitter.emit(componentEvents.renderStart);
	}

	/**
	 * Handler: render engine start event.
	 * Triggered when the component rendering using the rendering engine starts.
	 */
	onRenderEngineStart(): void {
		this.componentEmitter.emit(componentEvents.renderEngineStart);
	}

	/**
	 * Handler: render engine done event.
	 * Triggered when the component rendering using the rendering engine is completed.
	 */
	onRenderEngineDone(): void {
		this.componentEmitter.emit(componentEvents.renderEngineDone);
	}

	/**
	 * Handler: DOM insert start event.
	 * Triggered when the insertion of rendered components into the DOM tree starts.
	 *
	 * @param childList
	 */
	onDomInsertStart(this: bScrolly, childList: MountedChild[]): void {
		this.componentInternalState.updateRenderCursor();
		this.componentInternalState.updateMounted(childList);
		this.componentInternalState.setIsInitialRender(false);
		this.componentInternalState.incrementRenderPage();

		this.componentEmitter.emit(componentEvents.domInsertStart);
	}

	/**
	 * Handler: DOM insert done event.
	 * Triggered when the insertion of rendered components into the DOM tree is completed.
	 */
	onDomInsertDone(): void {
		this.componentEmitter.emit(componentEvents.domInsertDone);
	}

	/**
	 * Handler: render done event.
	 * Triggered when rendering is completed.
	 */
	onRenderDone(): void {
		this.componentEmitter.emit(componentEvents.renderDone);
	}

	/**
	 * Handler: lifecycle done event.
	 * Triggered when the internal lifecycle of the component is completed.
	 */
	onLifecycleDone(this: bScrolly): void {
		const
			state = this.getComponentState();

		if (state.isLifecycleDone === true) {
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
	onConvertDataToDB(data: unknown): void {
		this.componentInternalState.setRawLastLoaded(data);
		this.componentEmitter.emit(componentEvents.convertDataToDB, data);
	}

	/**
	 * Handler: data load start event.
	 * Triggered when data loading starts.
	 *
	 * @param isInitialLoading - Indicates whether it is an initial component loading.
	 */
	onDataLoadStart(isInitialLoading: boolean): void {
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
	onDataLoadSuccess(this: bScrolly, isInitialLoading: boolean, data: unknown): void {
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
	onDataLoadError(isInitialLoading: boolean): void {
		this.componentInternalState.setIsLoadingInProgress(false);
		this.componentInternalState.setIsLastErrored(true);
		this.slotsStateController.loadingFailedState();

		this.componentEmitter.emit(componentEvents.dataLoadError, isInitialLoading);
	}

	override onRequestError(this: bScrolly, ...args: Parameters<iData['onRequestError']>): ReturnType<iData['onRequestError']> {
		const
			err = args[0];

		if (isAsyncReplaceError(err)) {
			return;
		}

		const
			state = this.getComponentState();

		this.onDataLoadError(state.isInitialLoading);
		return super.onRequestError(err, this.initLoad.bind(this));
	}

	/**
	 * Handler: data empty event.
	 * Triggered when the loaded data is empty.
	 */
	onDataEmpty(): void {
		this.slotsStateController.emptyState();

		this.componentEmitter.emit(componentEvents.dataEmpty);
	}

	/**
	 * Handler: component enters the viewport.
	 * @param component - The component that enters the viewport.
	 */
	onElementEnters(this: bScrolly, component: MountedChild): void {
		this.componentInternalState.setMaxViewedIndex(component);
		this.loadDataOrPerformRender();

		this.componentEmitter.emit(componentEvents.elementEnter, component);
	}

	/**
	 * Handler: component leaves the viewport.
	 * @param _component - The component that leaves the viewport.
	 */
	onElementOut(_component: MountedChild): void {
		// ...
	}
}
