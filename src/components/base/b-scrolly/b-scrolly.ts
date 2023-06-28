/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-scrolly/README.md]]
 * @packageDocumentation
 */

import VDOM, { create, render } from 'components/friends/vdom';

import { bScrollyDomInsertAsyncGroup, renderGuardRejectionReason } from 'components/base/b-scrolly/const';

import iData, { $$, component, RequestParams } from 'components/super/i-data/i-data';
import { bScrollyHandlers } from 'components/base/b-scrolly/handlers';
import type { AsyncOptions } from 'core/async';
import type { ComponentState, RenderGuardResult } from 'components/base/b-scrolly/interface';

export * from 'components/base/b-scrolly/interface';
export * from 'components/base/b-scrolly/const';

VDOM.addToPrototype(create);
VDOM.addToPrototype(render);

/**
 * Component that implements loading and rendering of large data arrays in chunks.
 * The `bScrolly` component extends the `iData` class and implements the `iItems` interface.
 *
 * It provides functionality for efficiently loading and displaying large amounts of data
 * by dynamically rendering chunks of data as the user scrolls.
 */
@component()
export default class bScrolly extends bScrollyHandlers {
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
		const
			state = this.getComponentState();

		this.componentInternalState.setIsLastErrored(false);

		if (!this.isReady && this.isReadyOnce) {
			this.reset();
		}

		if (state.isLoadingInProgress) {
			return;
		}

		this.componentInternalState.setIsLoadingInProgress(true);

		const
			isInitialLoading = !this.isReady;

		const initLoadResult = isInitialLoading ?
			super.initLoad(...args) :
			this.initLoadNext();

		this.onDataLoadStart(isInitialLoading);

		if (Object.isPromise(initLoadResult)) {
			initLoadResult
				.then((res) => {
					if (
						(isInitialLoading && this.db == null) ||
						(!isInitialLoading && res == null)
					) {
						return;
					}

					this.onDataLoadSuccess(isInitialLoading, isInitialLoading ? this.db : this.convertDataToDB(res));
				})
				.catch(stderr);
		}

		return <Promise<void>>initLoadResult;
	}

	/**
	 * Resets the component state to its initial state.
	 */
	reset(): void {
		this.onReset();
	}

	/**
	 * Returns the component state.
	 * {@link ComponentState}
	 */
	getComponentState(): Readonly<ComponentState> {
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
	 * Wrapper for {@link bScrolly.shouldStopRequestingData}.
	 */
	shouldStopRequestingDataWrapper(this: bScrolly): boolean {
		const state = this.getComponentState();

		if (state.isRequestsStopped) {
			return state.isRequestsStopped;
		}

		const newVal = this.shouldStopRequestingData(state, this);

		this.componentInternalState.setIsRequestsStopped(newVal);
		return newVal;
	}

	/**
	 * Wrapper for {@link bScrolly.shouldPerformDataRequest}.
	 */
	shouldPerformDataRequestWrapper(this: bScrolly): boolean {
		return this.shouldPerformDataRequest(this.getComponentState(), this);
	}

	/**
	 * Returns the chunk size that should be rendered.
	 *
	 * @param state
	 * @returns The chunk size.
	 * @throws Error if the `chunkSize` size is not defined.
	 */
	getChunkSize(state: ComponentState): number {
		if (this.chunkSize == null) {
			throw new Error('`chunkSize` prop is not defined');
		}

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
	getNextDataSlice(state: ComponentState, chunkSize: number): object[] {
		const
			{data} = state,
			nextDataSliceStartIndex = this.componentInternalState.getRenderCursor(),
			nextDataSliceEndIndex = nextDataSliceStartIndex + chunkSize;

		return data.slice(nextDataSliceStartIndex, nextDataSliceEndIndex);
	}

	/**
	 * Initializes the loading of the next data chunk.
	 * @throws {@link ReferenceError} if there is no `dataProvider` set.
	 */
	protected initLoadNext(): Promise<unknown> {
		if (!this.dataProvider) {
			throw ReferenceError('Missing dataProvider');
		}

		const params = this.getRequestParams();
		return this.dataProvider.get(params[0], params[1]);
	}

	protected override convertDataToDB<O>(data: unknown): O | this['DB'] {
		const result = super.convertDataToDB(data);
		this.onConvertDataToDB(data);

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
	protected renderGuard(state: ComponentState): RenderGuardResult {
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
	 * on the result of the {@link bScrolly.renderGuard} method.
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
				void this.initLoad();
			}
		}

		if (reason === renderGuardRejectionReason.notEnoughData) {
			if (state.isRequestsStopped) {
				this.performRender();

			} else if (this.shouldPerformDataRequestWrapper()) {
				void this.initLoad();

			} else if (state.isInitialRender) {
				this.performRender();
			}
		}
	}

	/**
	 * Renders components using {@link bScrolly.componentFactory} and inserts them into the DOM tree.
	 * {@link bScrolly.componentFactory}, in turn, calls {@link bScrolly.itemsFactory} to obtain
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
				group: bScrollyDomInsertAsyncGroup,
				destroyIfComponent: true
			});
		}

		this.async.requestAnimationFrame(() => {
			this.$refs.container.appendChild(fragment);

			this.onDomInsertDone();
			this.onRenderDone();

		}, {label: $$.insertDomRaf, group: bScrollyDomInsertAsyncGroup});
	}
}
