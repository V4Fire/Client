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
	ComponentRenderStrategyKeys as ComponentRenderStrategyKeys,
	RequestParams,
	RequestQueryFn,
	ShouldRequestFn,
	ComponentRefs,
	ComponentItemFactory,
	ComponentItemType,
	ComponentStrategyKeys

} from 'components/base/b-scrolly/interface';

import {

	componentRenderStrategy,
	componentDataLocalEvents,
	defaultProps,
	componentLocalEvents,
	componentItemType,
	componentStrategy

} from 'components/base/b-scrolly/const';

import { Juggler } from 'components/base/b-scrolly/modules/juggler';
import { Observer } from 'components/base/b-scrolly/modules/observer';
import { ComponentFactory } from 'components/base/b-scrolly/modules/factory';
import { SlotsStateController } from 'components/base/b-scrolly/modules/slots';
import { ComponentInternalState } from 'components/base/b-scrolly/modules/state';
import { typedLocalEmitterFactory } from 'components/base/b-scrolly/modules/local-events';

import iData, { component, prop, system, $$ } from 'components/super/i-data/i-data';

export * from 'components/base/b-scrolly/interface';
export * from 'components/base/b-scrolly/const';

VDOM.addToPrototype(create);
VDOM.addToPrototype(render);

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
	readonly itemType: ComponentItemType | CreateFromItemFn<object, ComponentItemType> = componentItemType.item;

	/** {@link iItems.itemProps} */
	@prop({type: [Function, Object], default: () => ({})})
	readonly itemProps!: iItems['itemProps'];

	/** {@link ComponentItemFactory} */
	@prop({
		type: Function,
		default: (ctx: bScrolly, items: object[]) => {
			const descriptors = items.map((data, i) => ({
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
	 * {@link RenderStrategy}
	 */
	@prop({type: String, validator: (v) => Object.isString(v) && componentRenderStrategy.hasOwnProperty(v)})
	readonly componentRenderStrategy: ComponentRenderStrategyKeys = componentRenderStrategy.default;

	/**
	 * {@link ComponentStrategyKeys}
	 */
	@prop({type: String, validator: (v) => Object.isString(v) && componentStrategy.hasOwnProperty(v)})
	readonly componentStrategy: ComponentStrategyKeys = componentStrategy.intersectionObserver;

	/**
	 * {@link bScrollyRequestQueryFn}
	 */
	@prop({type: Function})
	readonly requestQuery?: RequestQueryFn;

	/**
	 * Number of elements per one render chunk
	 */
	// eslint-disable-next-line @typescript-eslint/unbound-method
	@prop({type: Number, validator: Number.isNatural})
	readonly chunkSize: number = 10;

	/**
	 * When this function returns `true` the component will stop to request new data.
	 * This function will be called on each data loading cycle.
	 */
	@prop({
		type: Function,
		default: defaultProps.shouldStopRequestingData
	})

	readonly shouldStopRequestingData!: ShouldRequestFn;

	/**
	 * When this function returns `true` the component will be able to request additional data.
	 * This function will be called on each new element enters the viewport.
	 */
	@prop({
		type: Function,
		default: defaultProps.shouldPerformDataRequest
	})

	readonly shouldPerformDataRequest!: ShouldRequestFn;

	/**
	 * When this function returns `true` the component will be able to render additional data.
	 * This function will be called on each new element enters the viewport.
	 */
	@prop({
		type: Function,
		default: defaultProps.shouldPerformDataRender
	})

	readonly shouldPerformDataRender!: ShouldRequestFn;

	/**
	 * If true then the elements observer will not be initialized.
	 * That may be useful if you wanna implement a lazy loading via client interaction
	 */
	@prop({
		type: Boolean
	})

	readonly disableObserver: boolean = false;

	/** {@link typedLocalEmitterFactory} */
	@system<bScrolly>((ctx) => typedLocalEmitterFactory(ctx))
	readonly typedLocalEmitter!: ReturnType<typeof typedLocalEmitterFactory>;

	/** {@link slotsStateController} */
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
		const callSuperAndStateReset = () => {
			this.reset();
			return super.initLoad(...args);
		};

		const
			isInitialLoading = !this.isReady;

		this.typedLocalEmitter.emit(componentDataLocalEvents.dataLoadStart, isInitialLoading);

		const initLoadResult = isInitialLoading ?
			callSuperAndStateReset() :
			this.initLoadNext();

		if (Object.isPromise(initLoadResult)) {
			initLoadResult
				.then((res) => {
					this.onInitLoadSuccess(isInitialLoading, isInitialLoading ? this.db : this.convertDataToDB(res));
				})
				.catch((err) => {
					this.onInitLoadError(isInitialLoading);
					throw err;
				})
				.finally(() => {
					this.onInitLoadFinish(isInitialLoading);
				});
		}

		return <Promise<void>>initLoadResult;
	}

	/**
	 * Initializes the load of the next data chunk
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
	 * Renders the next data chunk to the page (ignores `client` check for render posibility)
	 */
	renderNext(): void {
		// ...
	}

	/**
	 * Returns an internal component state
	 */
	getComponentState(): Readonly<ComponentState> {
		return this.componentInternalState.compile();
	}

	/**
	 * Collets all of the request params all over the component (ig `requestProp`, `requestQuery`)
	 * {@link bScrollyRequestParams}
	 */
	getRequestParams(): RequestParams {
		const label: AsyncOptions = {
			label: $$.initLoad,
			join: 'replace'
		};

		const
			defParams = this.dataProvider?.getDefaultRequestParams('get');

		if (Object.isArray(defParams)) {
			Object.assign(defParams[1], label);
		}

		return <RequestParams>defParams;
	}

	/**
	 * Wrapper for `shouldStopRequestingData`
	 */
	shouldStopRequestingDataWrapper(): boolean {
		const
			state = this.getComponentState();

		return state.isDone || this.shouldStopRequestingData(this.getComponentState(), this);
	}

	/**
	 * Wrapper for `shouldPerformDataRender`
	 */
	shouldPerformDataRenderWrapper(): boolean {
		return this.shouldPerformDataRender(this.getComponentState(), this);
	}

	/**
	 * Wrapper from `shouldPerformDataRequest`
	 */
	shouldPerformDataRequestWrapper(): boolean {
		return this.shouldPerformDataRequest(this.getComponentState(), this);
	}

	/**
	 * Resets a component state and the state of the component modules
	 */
	protected reset(): void {
		this.typedLocalEmitter.emit(componentLocalEvents.resetState);
	}

	protected override convertDataToDB<O>(data: unknown): O | this['DB'] {
		this.typedLocalEmitter.emit(componentLocalEvents.convertDataToDB, data);
		return super.convertDataToDB(data);
	}

	/**
	 * Handler: data load successfully finished
	 *
	 * @param isInitialLoading - `true` if this load was an initial component loading
	 * @param data
	 */
	protected onInitLoadSuccess(isInitialLoading: boolean, data: unknown): void {
		if (!Object.isPlainObject(data) || !Object.isArray(data.data)) {
			throw new ReferenceError('Missing data field in the loaded data');
		}

		this.typedLocalEmitter.emit(componentDataLocalEvents.dataLoadSuccess, <object[]>data.data, isInitialLoading);

		if (
			isInitialLoading &&
			Object.size(data.data) === 0
		) {
			if (this.shouldStopRequestingDataWrapper()) {
				this.typedLocalEmitter.emit(componentDataLocalEvents.dataEmpty, isInitialLoading);
			}
		}
	}

	/**
	 * Handler: failed to load data
	 *
	 * @param isInitialLoading - `true` if this load was an initial component loading
	 */
	protected onInitLoadError(isInitialLoading: boolean): void {
		this.typedLocalEmitter.emit(componentDataLocalEvents.dataLoadError, isInitialLoading);
	}

	/**
	 * Handler: data loading is finished
	 * @param isInitialLoading - `true` if this load was an initial component loading
	 */
	protected onInitLoadFinish(isInitialLoading: boolean): void {
		this.typedLocalEmitter.emit(componentDataLocalEvents.dataLoadFinish, isInitialLoading);
	}
}
