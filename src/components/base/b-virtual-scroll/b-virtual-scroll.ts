/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-virtual-scroll/README.md]]
 * @packageDocumentation
 */

import VDOM, { create, render } from 'components/friends/vdom';

import { bVirtualScrollDomInsertAsyncGroup, renderGuardRejectionReason } from 'components/base/b-virtual-scroll/const';

import iData, { $$, component, RequestParams } from 'components/super/i-data/i-data';
import { iVirtualScrollHandlers } from 'components/base/b-virtual-scroll/handlers';
import type { AsyncOptions } from 'core/async';
import type { VirtualScrollState, RenderGuardResult } from 'components/base/b-virtual-scroll/interface';

export * from 'components/base/b-virtual-scroll/interface';
export * from 'components/base/b-virtual-scroll/const';
export * from 'components/super/i-data/i-data';

VDOM.addToPrototype(create);
VDOM.addToPrototype(render);

/**
 * Component that implements loading and rendering of large data arrays in chunks.
 * The `bVirtualScroll` component extends the `iData` class and implements the `iItems` interface.
 *
 * It provides functionality for efficiently loading and displaying large amounts of data
 * by dynamically rendering chunks of data as the user scrolls.
 */
@component()
export default class bVirtualScroll extends iVirtualScrollHandlers {
	// @ts-ignore (getter instead readonly)
	override get requestParams(): iData['requestParams'] {
		return {
			get: {
				...this.requestQuery?.(this.getComponentState())?.get,
				...Object.isDictionary(this.request?.get) ? this.request?.get : undefined
			}
		};
	}

	override reload(...args: Parameters<iData['reload']>): ReturnType<iData['reload']> {
		this.componentStatus = 'loading';
		return super.reload(...args);
	}

	override initLoad(...args: Parameters<iData['initLoad']>): ReturnType<iData['initLoad']> {
		if (!this.lfc.isBeforeCreate()) {
			this.reset();
		}

		this.componentInternalState.setIsLoadingInProgress(true);

		const
			initLoadResult = super.initLoad(...args);

		this.onDataLoadStart(true);

		if (Object.isPromise(initLoadResult)) {
			initLoadResult
				.then(() => {
					if (this.db == null) {
						return;
					}

					this.onDataLoadSuccess(true, this.db);
				})
				.catch(stderr);

		} else {
			this.onDataLoadSuccess(true, this.db);
		}

		return initLoadResult;
	}

	/**
	 * Initializes the loading of the next data chunk.
	 * @throws {@link ReferenceError} if there is no `dataProvider` set.
	 */
	initLoadNext(): CanUndef<CanPromise<void>> {
		if (!this.dataProvider) {
			throw ReferenceError('Missing dataProvider');
		}

		const
			state = this.getComponentState();

		if (state.isLoadingInProgress) {
			return;
		}

		if (this.db == null) {
			return this.initLoad();
		}

		this.onDataLoadStart(false);

		const
			params = this.getRequestParams(),
			get = this.dataProvider.get(params[0], params[1]);

		return get
			.then((res) => {
				if (res == null) {
					return;
				}

				this.onDataLoadSuccess(false, this.convertDataToDB(res));
			})
			.catch(stderr);
	}

	/**
	 * Resets the component state to its initial state.
	 */
	reset(): void {
		this.onReset();
	}

	/**
	 * Returns the component state.
	 * {@link VirtualScrollState}
	 */
	getComponentState(): Readonly<VirtualScrollState> {
		return this.componentInternalState.compile();
	}

	/**
	 * Gathers all request parameters from the component fields `requestProp` and `requestQuery`.
	 * {@link RequestParams}
	 */
	getRequestParams(): RequestParams {
		const label: AsyncOptions = {
			label: $$.initLoad,
			join: 'replace'
		};

		const defParams = this.dataProvider?.getDefaultRequestParams('get');

		if (Array.isArray(defParams)) {
			Object.assign(defParams[1], label);
		}

		return <RequestParams>defParams;
	}

	/**
	 * Wrapper for {@link bVirtualScroll.shouldStopRequestingData}.
	 */
	shouldStopRequestingDataWrapper(this: bVirtualScroll): boolean {
		const state = this.getComponentState();

		if (state.isRequestsStopped) {
			return state.isRequestsStopped;
		}

		const newVal = this.shouldStopRequestingData(state, this);

		this.componentInternalState.setIsRequestsStopped(newVal);
		return newVal;
	}

	/**
	 * Wrapper for {@link bVirtualScroll.shouldPerformDataRequest}.
	 */
	shouldPerformDataRequestWrapper(this: bVirtualScroll): boolean {
		return this.shouldPerformDataRequest(this.getComponentState(), this);
	}

	/**
	 * Returns the chunk size that should be rendered.
	 *
	 * @param state
	 * @returns The chunk size.
	 */
	getChunkSize(state: VirtualScrollState): number {
		return Object.isFunction(this.chunkSize) ?
			this.chunkSize(state, this) :
			this.chunkSize;
	}

	/**
	 * Returns the next slice of data that should be rendered.
	 *
	 * @param state
	 * @param chunkSize
	 */
	getNextDataSlice(state: VirtualScrollState, chunkSize: number): object[] {
		const
			{data} = state,
			nextDataSliceStartIndex = this.componentInternalState.getDataCursor(),
			nextDataSliceEndIndex = nextDataSliceStartIndex + chunkSize;

		return data.slice(nextDataSliceStartIndex, nextDataSliceEndIndex);
	}

	protected override convertDataToDB<O>(data: unknown): O | this['DB'] {
		this.onConvertDataToDB(data);
		const result = super.convertDataToDB(data);

		return <O | this['DB']>result;
	}

	/**
	 * This function is called after successful data loading or when the child components enters the visible area.
	 *
	 * This function asks the client whether rendering can be performed. The client responds with an object
	 * indicating whether rendering is allowed or the reason for denial. The client's response should be an object
	 * of type {@link RenderGuardResult}.
	 *
	 * Based on the result of this function, the component takes appropriate actions. For example,
	 * it may load data if it is not sufficient for rendering, or perform rendering if all conditions are met.
	 */
	protected renderGuard(state: VirtualScrollState): RenderGuardResult {
		const
			chunkSize = this.getChunkSize(state),
			dataSlice = this.getNextDataSlice(state, chunkSize);

		if (dataSlice.length === 0) {
			if (state.isRequestsStopped) {
				return {
					result: false,
					reason: renderGuardRejectionReason.done
				};
			}

			return {
				result: false,
				reason: renderGuardRejectionReason.noData
			};
		}

		if (dataSlice.length < chunkSize) {
			return {
				result: false,
				reason: renderGuardRejectionReason.notEnoughData
			};
		}

		if (state.isInitialRender) {
			return {
				result: true
			};
		}

		const
			clientResponse = this.shouldPerformDataRender?.(state, this) ?? true;

		return {
			result: clientResponse,
			reason: clientResponse === false ? renderGuardRejectionReason.noPermission : undefined
		};
	}

	/**
	 * A function that performs actions (data loading/rendering) depending
	 * on the result of the {@link bVirtualScroll.renderGuard} method.
	 *
	 * This function is the "starting point" for rendering components and is called after successful data loading
	 * or when rendered items enter the viewport.
	 */
	protected loadDataOrPerformRender(): void {
		const
			state = this.getComponentState();

		if (state.isLastErrored) {
			return;
		}

		const
			{result, reason} = this.renderGuard(state);

		if (result) {
			return this.performRender();
		}

		if (reason === renderGuardRejectionReason.done) {
			this.onLifecycleDone();
			return;
		}

		if (reason === renderGuardRejectionReason.noData) {
			if (state.isRequestsStopped) {
				return;
			}

			if (this.shouldPerformDataRequestWrapper()) {
				void this.initLoadNext();
			}
		}

		if (reason === renderGuardRejectionReason.notEnoughData) {
			if (state.isRequestsStopped) {
				this.performRender();
				this.onLifecycleDone();

			} else if (this.shouldPerformDataRequestWrapper()) {
				void this.initLoadNext();

			} else if (state.isInitialRender) {
				this.performRender();
			}
		}
	}

	/**
	 * Renders components using {@link bVirtualScroll.componentFactory} and inserts them into the DOM tree.
	 * {@link bVirtualScroll.componentFactory}, in turn, calls {@link bVirtualScroll.itemsFactory} to obtain
	 * the set of components to render.
	 */
	protected performRender(): void {
		this.onRenderStart();

		const
			items = this.componentFactory.produceComponentItems(),
			nodes = this.componentFactory.produceNodes(items),
			mounted = this.componentFactory.produceMounted(items, nodes);

		this.observer.observe(mounted);
		this.onDomInsertStart(mounted);

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], {
				group: bVirtualScrollDomInsertAsyncGroup,
				destroyIfComponent: true
			});
		}

		this.async.requestAnimationFrame(() => {
			this.$refs.container.appendChild(fragment);

			this.onDomInsertDone();
			this.onRenderDone();

		}, {label: $$.insertDomRaf, group: bVirtualScrollDomInsertAsyncGroup});
	}
}
