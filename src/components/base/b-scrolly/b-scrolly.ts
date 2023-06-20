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

import type { AsyncOptions } from 'core/async';

import VDOM, { create, render } from 'components/friends/vdom';
import type iItems from 'components/traits/i-items/i-items';
import type { CreateFromItemFn } from 'components/traits/i-items/i-items';

import type {

	ComponentState,
	ComponentDb,
	ComponentRenderStrategy,
	RequestParams,
	RequestQueryFn,
	ShouldPerform,
	ComponentRefs,
	ComponentItemFactory,
	ComponentItemType,
	ComponentStrategy,
	RenderGuardResult

} from 'components/base/b-scrolly/interface';

import {

	componentRenderStrategy,
	componentDataLocalEvents,
	defaultShouldProps,
	componentLocalEvents,
	componentItemType,
	componentStrategy

} from 'components/base/b-scrolly/const';

import { Juggler } from 'components/base/b-scrolly/modules/juggler';
import { Observer } from 'components/base/b-scrolly/modules/observer';
import { ComponentFactory } from 'components/base/b-scrolly/modules/factory';
import { SlotsStateController } from 'components/base/b-scrolly/modules/slots';
import { ComponentInternalState } from 'components/base/b-scrolly/modules/state';
import { componentTypedEmitter } from 'components/base/b-scrolly/modules/emitter';

import iData, { component, prop, system, $$ } from 'components/super/i-data/i-data';
import { chunkSizePreset } from 'components/base/b-scrolly/modules/presets/chunk-size';

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
export default class bScrolly extends iData implements iItems {
	/** {@link iItems.item} */
	readonly Item!: object;

	/** {@link iItems.Items} */
	readonly Items!: Array<this['Item']>;

	/** {@link iItems.item} */
	@prop({type: [String, Function]})
	readonly item?: iItems['item'];

	/** {@link iItems.itemKey} */
	@prop({type: [String, Function]})
	readonly itemKey?: CreateFromItemFn<object, string>;

	/** {@link ComponentItemType} */
	@prop({type: [String, Function]})
	readonly itemType: keyof ComponentItemType | CreateFromItemFn<object, ComponentItemType> = componentItemType.item;

	/** {@link iItems.itemProps} */
	@prop({type: [Function, Object], default: () => ({})})
	readonly itemProps!: iItems['itemProps'];

	/**
	 * Specifies the number of times the `tombstone` component will be rendered.
	 *
	 * This prop can be useful if you want to render multiple `tombstone` components
	 * using a single specified element. For example, if you set `tombstonesSize` to 3,
	 * then three `tombstone` components will be rendered on your page.
	 */
	@prop(Number)
	readonly tombstonesSize?: number;

	/**
	 * This factory function is used to pass information about the components that need to be rendered.
	 * The function should return an array of arbitrary length consisting of objects that satisfy the
	 * `ComponentItem` interface.
	 *
	 * By default, the rendering strategy is based on the `chunkSize` and `iItems` trait.
	 * In other words, the default implementation takes a data slice of length `chunkSize`
	 * and calls the `iItems` functions to generate a `ComponentItem` object.
	 *
	 * However, nothing prevents the client from implementing any strategy by overriding this function.
	 *
	 * For example, it is possible to define a function
	 * that takes the last loaded data and draws twice as many components:
	 *
	 * @example
	 * ```typescript
	 * const itemsFactory = (state) => {
	 *   const data = state.lastLoadedData;
	 *
	 *   const items = data.map<ComponentItem>((item) => ({
	 *     item: 'section',
	 *     key: Object.cast(undefined),
	 *     type: 'item',
	 *     children: [],
	 *     props: {
	 *       'data-index': item.i
	 *     }
	 *   }));
	 *
	 *   return [...items, ...items];
	 * }
	 * ```
	 */
	@prop({
		type: Function,
		default: (state: ComponentState, ctx: bScrolly) => {
			if (ctx.chunkSize == null) {
				throw new Error('chunkSize.getNextDataSlice is used but chunkSize prop is not settled');
			}

			const descriptors = chunkSizePreset.getNextDataSlice(state, ctx.chunkSize).map((data, i) => ({
				key: ctx.itemKey?.(data, i),

				item: Object.isFunction(ctx.item) ? ctx.item(data, i) : ctx.item,
				type: Object.isFunction(ctx.itemType) ? ctx.itemType(data, i) : ctx.itemType,

				props: Object.isFunction(ctx.itemProps) ?
					ctx.itemProps(data, i, {
						key: ctx.itemKey?.(data, i),
						ctx
					}) :
					ctx.itemProps
			}));

			return descriptors;
		}
	})

	readonly itemsFactory!: ComponentItemFactory;

	override readonly DB!: ComponentDb;

	/**
	 * The rendering strategy of components.
	 * Determines which approach will be taken for rendering components within the rendering engine.
	 *
	 * * `default` - The default approach,
	 * which creates a new instance of the rendering engine each time a new rendering is performed.
	 *
	 * * `reuse` - An approach
	 * that reuses the current instance of the rendering engine whenever a new rendering is performed.
	 *
	 * {@link ComponentRenderStrategy}
	 */
	@prop({type: String, validator: (v) => Object.isString(v) && componentRenderStrategy.hasOwnProperty(v)})
	readonly componentRenderStrategy: keyof ComponentRenderStrategy = componentRenderStrategy.default;

	/**
	 * Strategies for component operation modes.
	 * {@link ComponentStrategy}
	 */
	@prop({type: String, validator: (v) => Object.isString(v) && componentStrategy.hasOwnProperty(v)})
	readonly componentStrategy: keyof ComponentStrategy = componentStrategy.intersectionObserver;

	/**
	 * Function that returns the GET parameters for a request.
	 * {@link RequestQueryFn}
	 */
	@prop({type: Function})
	readonly requestQuery?: RequestQueryFn;

	/**
	 * The number of elements to render at once.
	 * This prop is used in conjunction with `renderGuard` and `chunkSize` preset.
	 */
	@prop({type: Number, validator: Number.isNatural})
	readonly chunkSize?: number = 10;

	/**
	 * When this function returns `true` the component will stop to request new data.
	 * This function will be called on each data loading cycle.
	 */
	@prop({
		type: Function,
		default: defaultShouldProps.shouldStopRequestingData
	})

	readonly shouldStopRequestingData!: ShouldPerform;

	/**
	 * When this function returns `true` the component will be able to request additional data.
	 * This function will be called on each new element enters the viewport.
	 */
	@prop({
		type: Function,
		default: defaultShouldProps.shouldPerformDataRequest
	})

	readonly shouldPerformDataRequest!: ShouldPerform;

	/**
	 * This function is called after successful data loading or when the component enters the visible area.
	 *
	 * This function asks the client whether rendering can be performed. The client responds with an object
	 * indicating whether rendering is allowed or the reason for denial. The client's response should be an object
	 * of type {@link RenderGuardResult}.
	 *
	 * Based on the result of this function, the component takes appropriate actions. For example,
	 * it may load data if it is not sufficient for rendering, or perform rendering if all conditions are met.
	 *
	 * By default, the {@link chunkSizePreset.renderGuard} strategy is used,
	 * which already implements the mechanism for communication with the component.
	 */
	@prop({
		type: Function,
		default: (state: ComponentState, ctx: bScrolly) => {
			if (ctx.chunkSize == null) {
				throw new Error('The "ChunkSize.renderGuard" preset is active, but the "chunkSize" prop is not set.');
			}

			return chunkSizePreset.renderGuard(state, ctx, ctx.chunkSize);
		}
	})
	readonly renderGuard!: ShouldPerform<RenderGuardResult>;

	/**
	 * This function is called in the `renderGuard` after other checks are completed.
	 *
	 * This function receives the component state as input, based on which the client
	 * should determine whether the component should render the next chunk of components.
	 *
	 * For example, if we want to render the next data chunk only when the client
	 * has seen all the main components, we can implement the following function:
	 *
	 * @example
	 * ```typescript
	 * const shouldPerformDataRender = (state) => {
	 *   return state.isInitialRender || state.itemsTillEnd === 0;
	 * }
	 * ```
	 */
	@prop(Function)
	readonly shouldPerformDataRender?: ShouldPerform<boolean>;

	/**
	 * If `true`, the element observation module will not be initialized.
	 *
	 * Setting this prop to `true` can be useful if you want to implement lazy rendering
	 * and control it using the `renderNext` method.
	 */
	@prop({
		type: Boolean
	})
	readonly disableObserver: boolean = false;

	/** {@link componentTypedEmitter} */
	@system<bScrolly>((ctx) => componentTypedEmitter(ctx))
	readonly componentEmitter!: ReturnType<typeof componentTypedEmitter>;

	/** {@link SlotsStateController} */
	@system<bScrolly>((ctx) => new SlotsStateController(ctx))
	readonly slotsStateController!: SlotsStateController;

	/** {@link ComponentInternalState} */
	@system<bScrolly>((ctx) => new ComponentInternalState(ctx))
	readonly componentInternalState!: ComponentInternalState;

	/** {@link ComponentFactory} */
	@system<bScrolly>((ctx) => new ComponentFactory(ctx))
	readonly componentFactory!: ComponentFactory;

	/** {@link Juggler} */
	@system<bScrolly>((ctx) => new Juggler(ctx))
	readonly juggler!: Juggler;

	/** {@link Observer} */
	@system<bScrolly>((ctx) => new Observer(ctx))
	readonly observer!: Observer;

	// @ts-ignore (getter instead readonly)
	override get requestParams(): iData['requestParams'] {
		return {
			get: {
				...this.requestQuery?.(this.getComponentState())?.get,
				...Object.isDictionary(this.request?.get) ? this.request?.get : undefined
			}
		};
	}

	protected override readonly $refs!: iData['$refs'] & ComponentRefs;

	override reload(...args: Parameters<iData['reload']>): ReturnType<iData['reload']> {
		this.componentStatus = 'loading';
		return super.reload(...args);
	}

	override initLoad(...args: Parameters<iData['initLoad']>): ReturnType<iData['initLoad']> {
		const
			state = this.getComponentState();

		if (state.isLoadingInProgress) {
			return;
		}

		this.componentInternalState.setIsLoadingInProgress(true);

		const callSuperAndStateReset = () => {
			if (this.isReadyOnce) {
				this.reset();
			}

			return super.initLoad(...args);
		};

		const
			isInitialLoading = !this.isReady;

		const initLoadResult = isInitialLoading ?
			callSuperAndStateReset() :
			this.initLoadNext();

		this.componentEmitter.emit(componentDataLocalEvents.dataLoadStart, isInitialLoading);

		if (Object.isPromise(initLoadResult)) {
			initLoadResult
				.then((res) => {
					this.componentInternalState.setIsLoadingInProgress(false);
					this.onInitLoadSuccess(isInitialLoading, isInitialLoading ? this.db : this.convertDataToDB(res));
				})
				.catch((err) => {
					this.componentInternalState.setIsLoadingInProgress(false);
					this.onInitLoadError(isInitialLoading);

					throw err;
				});
		}

		return <Promise<void>>initLoadResult;
	}
	/**
	 * Initializes the loading of the next data chunk.
	 * @param args
	 */
	initLoadNext(): Promise<unknown> {
		if (!this.dataProvider) {
			throw ReferenceError('Missing dataProvider');
		}

		const params = this.getRequestParams();
		return this.dataProvider.get(params[0], params[1]);
	}

	/**
	 * Renders the next data chunk to the page (ignores the `client` check for render possibility).
	 */
	renderNext(): void {
		// ...
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
	shouldStopRequestingDataWrapper(): boolean {
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
	shouldPerformDataRequestWrapper(): boolean {
		return this.shouldPerformDataRequest(this.getComponentState(), this);
	}

	/**
	 * Resets the component state and the state of the component modules.
	 */
	protected reset(): void {
		this.componentEmitter.emit(componentLocalEvents.resetState);
	}

	protected override convertDataToDB<O>(data: unknown): O | this['DB'] {
		this.componentEmitter.emit(componentLocalEvents.convertDataToDB, data);
		return super.convertDataToDB(data);
	}

	/**
	 * Handler: data load successfully finished.
	 *
	 * @param isInitialLoading - `true` if this load was an initial component loading.
	 * @param data
	 *
	 * @throws {@link ReferenceError} if there is not `data` field in the loaded data.
	 */
	protected onInitLoadSuccess(isInitialLoading: boolean, data: unknown): void {
		if (!Object.isPlainObject(data) || !Array.isArray(data.data)) {
			throw new ReferenceError('Missing "data" field in the loaded data');
		}

		this.componentInternalState.updateData(data.data, isInitialLoading);
		this.shouldStopRequestingDataWrapper();

		this.componentEmitter.emit(componentDataLocalEvents.dataLoadSuccess, data.data, isInitialLoading);

		if (isInitialLoading && Object.size(data.data) === 0) {
			if (this.shouldStopRequestingDataWrapper()) {
				this.componentEmitter.emit(componentDataLocalEvents.dataEmpty, isInitialLoading);
			}
		}
	}

	/**
	 * Handler: failed to load data.
	 *
	 * @param isInitialLoading - `true` if this load was an initial component loading.
	 */
	protected onInitLoadError(isInitialLoading: boolean): void {
		this.componentEmitter.emit(componentDataLocalEvents.dataLoadError, isInitialLoading);
	}

}
