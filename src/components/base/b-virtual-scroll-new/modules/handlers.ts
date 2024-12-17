/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';

import { bVirtualScrollNewAsyncGroup, componentEvents, componentLocalEvents } from 'components/base/b-virtual-scroll-new/const';
import type { MountedChild } from 'components/base/b-virtual-scroll-new/interface';

const $$ = symbolGenerator();

type TraitType = bVirtualScrollNew['unsafe'] & iVirtualScrollHandlers;

export default abstract class iVirtualScrollHandlers {
	/** {@link iVirtualScrollHandlers.prototype.onReset} */
	static onReset(ctx: TraitType): void {
		ctx.componentInternalState.reset();
		ctx.observer.reset();
		ctx.async.clearAll({group: new RegExp(bVirtualScrollNewAsyncGroup)});
		ctx.componentEmitter.emit(componentEvents.resetState);
	}

	/** {@link iVirtualScrollHandlers.prototype.onRenderStart} */
	static onRenderStart(ctx: TraitType): void {
		ctx.componentInternalState.updateIsLastRender();
		ctx.componentEmitter.emit(componentEvents.renderStart);
	}

	/** {@link iVirtualScrollHandlers.prototype.onRenderEngineStart} */
	static onRenderEngineStart(ctx: TraitType): void {
		ctx.componentEmitter.emit(componentEvents.renderEngineStart);
	}

	/** {@link iVirtualScrollHandlers.prototype.onRenderEngineDone} */
	static onRenderEngineDone(ctx: TraitType): void {
		ctx.componentEmitter.emit(componentEvents.renderEngineDone);
	}

	/** {@link iVirtualScrollHandlers.prototype.onDomInsertStart} */
	static onDomInsertStart(ctx: TraitType, childList: MountedChild[]): void {
		ctx.componentInternalState.updateDataOffset();
		ctx.componentInternalState.updateMounted(childList);
		ctx.componentInternalState.setIsInitialRender(false);
		ctx.componentInternalState.incrementRenderPage();

		ctx.componentEmitter.emit(componentEvents.domInsertStart);
	}

	/** {@link iVirtualScrollHandlers.prototype.onDomInsertDone} */
	static onDomInsertDone(ctx: TraitType): void {
		ctx.componentEmitter.emit(componentEvents.domInsertDone);
	}

	/** {@link iVirtualScrollHandlers.prototype.onRenderDone} */
	static onRenderDone(ctx: TraitType): void {
		ctx.componentEmitter.emit(componentEvents.renderDone);
		ctx.localEmitter.emit(componentLocalEvents.renderCycleDone);
	}

	/** {@link iVirtualScrollHandlers.prototype.onLifecycleDone} */
	static onLifecycleDone(ctx: TraitType): void {
		const
			state = ctx.getVirtualScrollState(),
			isDomInsertInProgress = ctx.componentInternalState.getIsDomInsertInProgress();

		if (state.isLifecycleDone) {
			return;
		}

		const handler = () => {
			ctx.slotsStateController.doneState();
			ctx.componentInternalState.setIsLifecycleDone(true);
			ctx.componentEmitter.emit(componentEvents.lifecycleDone);
		};

		if (isDomInsertInProgress) {
			ctx.localEmitter.once(componentLocalEvents.renderCycleDone, handler, {
				group: bVirtualScrollNewAsyncGroup,
				label: $$.waitUntilRenderDone
			});

			return;
		}

		return handler();
	}

	/** {@link iVirtualScrollHandlers.prototype.onConvertDataToDB} */
	static onConvertDataToDB(ctx: TraitType, data: unknown): void {
		ctx.componentInternalState.setRawLastLoaded(data);
		ctx.componentEmitter.emit(componentEvents.convertDataToDB, data);
	}

	/** {@link iVirtualScrollHandlers.prototype.onDataLoadStart} */
	static onDataLoadStart(ctx: TraitType, isInitialLoading: boolean): void {
		ctx.componentInternalState.setIsLoadingInProgress(true);
		ctx.componentInternalState.setIsLastErrored(false);
		ctx.slotsStateController.loadingProgressState(isInitialLoading);
		ctx.componentEmitter.emit(componentEvents.dataLoadStart, isInitialLoading);
	}

	// eslint-disable-next-line jsdoc/require-throws
	/** {@link iVirtualScrollHandlers.prototype.onDataLoadSuccess} */
	static onDataLoadSuccess(ctx: TraitType, isInitialLoading: boolean, data: unknown): void {
		ctx.componentInternalState.setIsLoadingInProgress(false);

		const
			dataToProvide = Object.isPlainObject(data) ? data.data : data;

		if (!Array.isArray(dataToProvide)) {
			throw new ReferenceError('Missing data to perform render');
		}

		ctx.componentInternalState.updateData(dataToProvide, isInitialLoading);
		ctx.componentInternalState.incrementLoadPage();

		const
			isRequestsStopped = ctx.shouldStopRequestingDataWrapper();

		ctx.componentEmitter.emit(componentEvents.dataLoadSuccess, dataToProvide, isInitialLoading);
		ctx.slotsStateController.loadingSuccessState();

		if (
			isInitialLoading &&
			isRequestsStopped &&
			Object.size(dataToProvide) === 0
		) {
			ctx.onDataEmpty();
			ctx.onLifecycleDone();

		} else {
			ctx.loadDataOrPerformRender();
		}
	}

	/** {@link iVirtualScrollHandlers.prototype.onDataLoadError} */
	static onDataLoadError(ctx: TraitType, isInitialLoading: boolean): void {
		ctx.componentInternalState.setIsLoadingInProgress(false);
		ctx.componentInternalState.setIsLastErrored(true);
		ctx.slotsStateController.loadingFailedState();

		ctx.componentEmitter.emit(componentEvents.dataLoadError, isInitialLoading);
	}

	/** {@link iVirtualScrollHandlers.prototype.onDataEmpty} */
	static onDataEmpty(ctx: TraitType): void {
		ctx.slotsStateController.emptyState();

		ctx.componentEmitter.emit(componentEvents.dataLoadEmpty);
	}

	/** {@link iVirtualScrollHandlers.prototype.onElementEnters} */
	static onElementEnters(ctx: TraitType, component: MountedChild): void {
		ctx.componentInternalState.setMaxViewedIndex(component);
		ctx.loadDataOrPerformRender();

		ctx.componentEmitter.emit(componentEvents.elementEnter, component);
	}

	/** {@link iVirtualScrollHandlers.prototype.onTombstonesEnter} */
	static onTombstonesEnter(ctx: TraitType): void {
		ctx.componentInternalState.setIsTombstonesInView(true);
		ctx.loadDataOrPerformRender();
	}

	/** {@link iVirtualScrollHandlers.prototype.onTombstonesLeave} */
	static onTombstonesLeave(ctx: TraitType): void {
		ctx.componentInternalState.setIsTombstonesInView(false);
	}

	/** {@link iVirtualScrollHandlers.prototype.onItemsInit} */
	static onItemsInit(ctx: TraitType, items: Exclude<bVirtualScrollNew['items'], undefined>): void {
		ctx.onDataLoadSuccess(true, items);
	}

	/**
	 * Handler: component reset event.
	 * Resets the component state to its initial state.
	 */
	onReset(): void {
		return Object.throw();
	}

	/**
	 * Handler: render start event.
	 * Triggered when the component rendering starts.
	 */
	onRenderStart(): void {
		return Object.throw();
	}

	/**
	 * Handler: render engine start event.
	 * Triggered when the component rendering using the rendering engine starts.
	 */
	onRenderEngineStart(): void {
		return Object.throw();
	}

	/**
	 * Handler: render engine done event.
	 * Triggered when the component rendering using the rendering engine is completed.
	 */
	onRenderEngineDone(): void {
		return Object.throw();
	}

	/**
	 * Handler: DOM insert start event.
	 * Triggered when the insertion of rendered components into the DOM tree starts.
	 *
	 * @param _childList
	 */
	onDomInsertStart(_childList: MountedChild[]): void {
		return Object.throw();
	}

	/**
	 * Handler: DOM insert done event.
	 * Triggered when the insertion of rendered components into the DOM tree is completed.
	 */
	onDomInsertDone(): void {
		return Object.throw();
	}

	/**
	 * Handler: render done event.
	 * Triggered when rendering is completed.
	 */
	onRenderDone(): void {
		return Object.throw();
	}

	/**
	 * Handler: lifecycle done event.
	 * Triggered when the internal lifecycle of the component is completed.
	 */
	onLifecycleDone(): void {
		return Object.throw();
	}

	/**
	 * Handler: convert data to database event.
	 * Triggered when the loaded data is converted.
	 *
	 * @param _data - the converted data.
	 */
	onConvertDataToDB(_data: unknown): void {
		return Object.throw();
	}

	/**
	 * Handler: data load start event.
	 * Triggered when data loading starts.
	 *
	 * @param _isInitialLoading - indicates whether it is an initial component loading.
	 */
	onDataLoadStart(_isInitialLoading: boolean): void {
		return Object.throw();
	}

	/**
	 * Handler: data load success event.
	 * Triggered when data loading is successfully completed.
	 *
	 * @param _isInitialLoading - indicates whether it is an initial component loading.
	 * @param _data - the loaded data.
	 * @throws {@link ReferenceError} if the loaded data does not have a "data" field.
	 */
	onDataLoadSuccess(_isInitialLoading: boolean, _data: unknown): void {
		return Object.throw();
	}

	/**
	 * Handler: data load error event.
	 * Triggered when data loading fails.
	 *
	 * @param _isInitialLoading - indicates whether it is an initial component loading.
	 */
	onDataLoadError(_isInitialLoading: boolean): void {
		return Object.throw();
	}

	/**
	 * Handler: data empty event.
	 * Triggered when the loaded data is empty.
	 */
	onDataEmpty(): void {
		return Object.throw();
	}

	/**
	 * Handler: component enters the viewport
	 * @param _component - the component that enters the viewport.
	 */
	onElementEnters(_component: MountedChild): void {
		return Object.throw();
	}

	/**
	 * Handler: the tombstone's slot entered the viewport
	 */
	onTombstonesEnter(): void {
		return Object.throw();
	}

	/**
	 * Handler: the tombstone's slot leaves the viewport
	 */
	onTombstonesLeave(): void {
		return Object.throw();
	}

	/**
	 * Handler: items to render was updated
	 * @param _items
	 */
	onItemsInit(_items: Exclude<bVirtualScrollNew['items'], undefined>): void {
		return Object.throw();
	}
}
