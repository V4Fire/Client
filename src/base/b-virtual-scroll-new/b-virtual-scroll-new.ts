/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-virtual-scroll-new/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';
import type { AsyncOptions } from 'core/async';

import type iItems from 'traits/i-items/i-items';
import { iVirtualScrollHandlers } from 'base/b-virtual-scroll-new/handlers';
import { bVirtualScrollAsyncGroup, bVirtualScrollDomInsertAsyncGroup, componentModes, renderGuardRejectionReason } from 'base/b-virtual-scroll-new/const';
import type { VirtualScrollState, RenderGuardResult, $ComponentRefs, UnsafeBVirtualScroll, ItemsProcessors, ComponentMode } from 'base/b-virtual-scroll-new/interface';

import { ComponentTypedEmitter, componentTypedEmitter } from 'base/b-virtual-scroll-new/modules/emitter';
import { ComponentInternalState } from 'base/b-virtual-scroll-new/modules/state';
import { SlotsStateController } from 'base/b-virtual-scroll-new/modules/slots';
import { ComponentFactory } from 'base/b-virtual-scroll-new/modules/factory';
import { Observer } from 'base/b-virtual-scroll-new/modules/observer';

import iData, { component, system, watch, wait, RequestParams, UnsafeGetter } from 'super/i-data/i-data';

export * from 'base/b-virtual-scroll-new/interface';
export * from 'base/b-virtual-scroll-new/const';
export * from 'super/i-data/i-data';

const $$ = symbolGenerator();

@component()
export default class bVirtualScrollNew extends iVirtualScrollHandlers implements iItems {

	/** {@link componentTypedEmitter} */
	@system<bVirtualScrollNew>((ctx) => componentTypedEmitter(ctx))
	protected readonly componentEmitter!: ComponentTypedEmitter;

	/** {@link SlotsStateController} */
	@system<bVirtualScrollNew>((ctx) => new SlotsStateController(ctx))
	protected readonly slotsStateController!: SlotsStateController;

	/** {@link ComponentInternalState} */
	@system<bVirtualScrollNew>((ctx) => new ComponentInternalState(ctx))
	protected readonly componentInternalState!: ComponentInternalState;

	/** {@link ComponentFactory} */
	@system<bVirtualScrollNew>((ctx) => new ComponentFactory(ctx))
	protected readonly componentFactory!: ComponentFactory;

	/** {@link Observer} */
	@system<bVirtualScrollNew>((ctx) => new Observer(ctx))
	protected readonly observer!: Observer;

	/**
	 * `itemsProcessors` involved in the current rendering lifecycle
	 */
	@system()
	protected currentItemsProcessors?: ItemsProcessors;

	protected override readonly $refs!: iData['$refs'] & $ComponentRefs;

	// @ts-ignore (getter instead readonly)
	override get requestParams(): iData['requestParams'] {
		return {
			get: {
				...this.requestQuery?.(this.getVirtualScrollState())?.get,
				...Object.isDictionary(this.request?.get) ? this.request?.get : undefined
			}
		};
	}

	override set requestParams(_value: RequestParams) {
		// ...
	}

	override get unsafe(): UnsafeGetter<UnsafeBVirtualScroll<this>> {
		return Object.cast(this);
	}

	/**
	 * {@link ComponentMode}
	 */
	get componentMode(): ComponentMode {
		return this.items ? componentModes.items : componentModes.dataProvider;
	}

	/**
	 * Initializes the loading of the next data chunk
	 * @throws {@link ReferenceError} if there is no `dataProvider` set.
	 */
	initLoadNext(): CanUndef<CanPromise<void>> {
		if (!this.dp) {
			throw ReferenceError('Missing dataProvider');
		}

		const
			state = this.getVirtualScrollState();

		if (state.isLoadingInProgress) {
			return;
		}

		if (this.db == null) {
			return this.initLoad();
		}

		this.onDataLoadStart(false);

		const
			params = this.getRequestParams(),
			get = this.get(params[0], {...params[1], showProgress: false});

		return get
			.then((res) => {
				this.onDataLoadSuccess(false, this.convertDataToDB(res));
			})
			.catch(stderr);
	}

	/**
	 * Returns the internal component state
	 * {@link VirtualScrollState}
	 */
	getVirtualScrollState(): Readonly<VirtualScrollState> {
		return this.componentInternalState.compile();
	}

	/**
	 * Returns the next slice of data that should be rendered
	 *
	 * @param state
	 * @param chunkSize
	 */
	getNextDataSlice(state: VirtualScrollState, chunkSize: number): object[] {
		const
			nextDataSliceStartIndex = this.componentInternalState.getDataOffset(),
			nextDataSliceEndIndex = nextDataSliceStartIndex + chunkSize;

		return state.data.slice(nextDataSliceStartIndex, nextDataSliceEndIndex);
	}

	/**
	 * Returns the chunk size that should be rendered
	 * @param state - current lifecycle state.
	 */
	getChunkSize(state: VirtualScrollState): number {
		return Object.isFunction(this.chunkSize) ?
			this.chunkSize(state, this) :
			this.chunkSize;
	}

	/**
	 * Returns the amount of data that should be preloaded
	 * @param state - current lifecycle state
	 */
	getPreloadAmount(state: VirtualScrollState): number {
		return Object.isFunction(this.preloadAmount) ?
			this.preloadAmount(state, this) :
			this.preloadAmount;
	}

	/**
	 * Returns an items processors
	 * @returns
	 */
	getItemsProcessors(): CanUndef<ItemsProcessors> {
		return this.itemsProcessors;
	}

	override reload(...args: Parameters<iData['reload']>): ReturnType<iData['reload']> {
		this.componentStatus = 'loading';
		return super.reload(...args);
	}

	@watch({path: 'items', provideArgs: false})
	override initLoad(...args: Parameters<iData['initLoad']>): ReturnType<iData['initLoad']> {
		if (!this.lfc.isBeforeCreate()) {
			this.reset();
		}

		this.componentInternalState.setIsLoadingInProgress(true);

		const
			initLoadResult = super.initLoad(...args),
			initLoadPromise = Object.isPromise(initLoadResult) ? initLoadResult : SyncPromise.resolve(),
			wrappedInitLoadPromise = this.async.promise(initLoadPromise, {
				label: $$.initLoad,
				group: bVirtualScrollAsyncGroup,
				join: 'replace'
			});

		if (this.componentMode === componentModes.items) {
			return wrappedInitLoadPromise
				.then(() => this.initItems())
				.catch(stderr);
		}

		this.onDataLoadStart(true);

		wrappedInitLoadPromise
			.then(() => {
				if (this.db == null) {
					return;
				}

				this.onDataLoadSuccess(true, this.db);
			})
			.catch(stderr);
	}

	/**
	 * Initializes the data passed through the items prop
	 */
	@wait({defer: true})
	protected initItems(): CanPromise<void> {
		if (
			this.componentMode !== componentModes.items ||
			!this.items
		) {
			return;
		}

		this.onItemsInit(this.items);
	}

	protected override convertDataToDB<O>(data: unknown): O | this['DB'] {
		this.onConvertDataToDB(data);
		const result = super.convertDataToDB(data);

		return <O | this['DB']>result;
	}

	/**
	 * Merges all request parameters from the component fields `requestProp` and `requestQuery`
	 * {@link RequestParams}
	 */
	protected getRequestParams(): RequestParams {
		const label: AsyncOptions = {
			label: $$.initLoadNext,
			group: bVirtualScrollAsyncGroup,
			join: 'replace'
		};

		const defParams = this.getDefaultRequestParams('get');

		if (Array.isArray(defParams)) {
			Object.assign(defParams[1], label);
		}

		return <RequestParams>defParams;
	}

	/**
	 * Short-hand wrapper for calling {@link bVirtualScrollNew.shouldStopRequestingData}, which also caches the
	 * result of the call and, if {@link bVirtualScrollNew.shouldStopRequestingData} returns `true`, does not call
	 * this function again until the life cycle is updated and the state is reset.
	 */
	protected shouldStopRequestingDataWrapper(): boolean {
		if (this.componentMode === componentModes.items) {
			this.componentInternalState.setIsRequestsStopped(true);
			return true;
		}

		const state = this.getVirtualScrollState();

		if (state.areRequestsStopped) {
			return state.areRequestsStopped;
		}

		const newVal = this.shouldStopRequestingData(state, this);

		this.componentInternalState.setIsRequestsStopped(newVal);
		return newVal;
	}

	/**
	 * Resets the component state to its initial state
	 */
	protected reset(): void {
		this.currentItemsProcessors = undefined;
		this.onReset();
	}

	/**
	 * This function asks the client whether rendering can be performed.
	 * It is called after successful data load or when the child component enters the visible area.
	 * The client responds with an object indicating whether rendering is allowed or the reason for denial.
	 *
	 * Based on the result of this function, the component takes appropriate actions. For example,
	 * it may load data if it is not sufficient for rendering, or perform rendering if all conditions are met.
	 *
	 * @param state
	 */
	protected renderGuard(state: VirtualScrollState): RenderGuardResult {
		const
			chunkSize = this.getChunkSize(state),
			dataSlice = this.getNextDataSlice(state, chunkSize);

		if (dataSlice.length < chunkSize) {
			if (state.areRequestsStopped && state.isLastRender) {
				return {
					result: false,
					reason: renderGuardRejectionReason.done
				};
			}

			const
				clientResponse = this.shouldPerformDataRender?.(state, this) ?? true;

			if (clientResponse) {
				return {
					result: false,
					reason: renderGuardRejectionReason.notEnoughData
				};
			}

			return {
				result: clientResponse,
				reason: renderGuardRejectionReason.noPermission
			};
		}

		if (state.isInitialRender) {
			return {
				result: true
			};
		}

		const
			clientResponse = this.shouldPerformDataRender?.(state, this),
			result = clientResponse || state.isTombstonesInView;

		return {
			result,
			reason: !result ? renderGuardRejectionReason.noPermission : undefined
		};
	}

	/**
	 * A function that performs actions (data loading/rendering) depending
	 * on the result of the {@link bVirtualScrollNew.renderGuard} method.
	 *
	 * This function is the "starting point" for rendering components and is called after successful data loading
	 * or when rendered items enter the viewport.
	 */
	protected loadDataOrPerformRender(): void {
		const
			state = this.getVirtualScrollState();

		if (state.isLastErrored) {
			return;
		}

		const
			{result, reason} = this.renderGuard(state);

		if (result) {
			this.performRender();
		}

		switch (reason) {
			case renderGuardRejectionReason.done:
				this.onLifecycleDone();
				break;

			case renderGuardRejectionReason.notEnoughData:
				if (state.areRequestsStopped) {
					this.performRender();
					this.onLifecycleDone();

					return;
				}

				void this.initLoadNext();

				break;

			default: {
				const
					preloadAmount = this.getPreloadAmount(state),
					dataOffset = this.componentInternalState.getDataOffset();

				if (
					!state.areRequestsStopped &&
					state.data.length - dataOffset - preloadAmount < 0
				) {
					void this.initLoadNext();
				}
			}
		}
	}

	/**
	 * Renders components using {@link bVirtualScrollNew.componentFactory} and inserts them into the DOM tree
	 */
	protected performRender(): void {
		this.onRenderStart();

		const
			items = this.componentFactory.produceComponentItems(),
			nodes = this.componentFactory.produceNodes(items),
			mounted = this.componentFactory.produceMounted(items, nodes);

		if (mounted.length === 0) {
			return this.onRenderDone();
		}

		this.observer.observe(mounted);
		this.onDomInsertStart(mounted);

		const
			fragment = document.createDocumentFragment(),
			{renderPage} = this.getVirtualScrollState(),
			asyncGroup = `${bVirtualScrollDomInsertAsyncGroup}:${renderPage}`;

		nodes.forEach((node) => {
			this.dom.appendChild(fragment, node, {
				group: asyncGroup,
				destroyIfComponent: true
			});
		});

		this.componentInternalState.setIsDomInsertInProgress(true);

		this.async.requestAnimationFrame(() => {
			const
				state = this.getVirtualScrollState();

			this.slotsStateController.loadingSuccessState(true);

			if (state.isLoadingInProgress) {
				this.slotsStateController.loadingProgressState();
			}

			this.$refs.container.appendChild(fragment);
			this.componentInternalState.setIsDomInsertInProgress(false);

			this.onDomInsertDone();
			this.onRenderDone();

		}, {label: $$.insertDomRaf, group: asyncGroup});
	}
}
