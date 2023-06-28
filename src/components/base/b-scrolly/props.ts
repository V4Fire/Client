/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'traits/i-items/i-items';
import type { CreateFromItemFn } from 'traits/i-items/i-items';

import iData, { component, prop, system } from 'super/i-data/i-data';
import type {

	ComponentState,
	ComponentDb,
	ComponentRenderStrategy,
	RequestQueryFn,
	ShouldPerform,
	ComponentItemFactory,
	ComponentItemType,
	ComponentStrategy,
	ComponentRefs

} from 'components/base/b-scrolly/interface';

import {

	componentRenderStrategy,
	defaultShouldProps,
	componentItemType,
	componentStrategy

} from 'components/base/b-scrolly/const';

import { ComponentTypedEmitter, componentTypedEmitter } from 'components/base/b-scrolly/modules/emitter';
import { SlotsStateController } from 'components/base/b-scrolly/modules/slots';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { ComponentFactory } from 'components/base/b-scrolly/modules/factory';
import { Observer } from 'components/base/b-scrolly/modules/observer';
import { ComponentInternalState } from 'components/base/b-scrolly/modules/state';

/**
 * A class that is friendly to {@link bScrolly}. It contains the properties of the {@link bScrolly} component.
 */
@component()
export default abstract class bScrollyProps extends iData implements iItems {
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
				throw new Error('"chunkSize.getNextDataSlice" is used but "chunkSize" prop is not set.');
			}

			const descriptors = ctx.getNextDataSlice(state, ctx.getChunkSize(state)).map((data, i) => ({
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
	 *
	 * This prop can also be a function that returns the chunk size to render based on certain criteria
	 * (e.g., rendering page).
	 *
	 * For example, you can render 6 elements initially, then 12, and then 18 elements based on the
	 * rendering page.
	 *
	 * @example
	 * ```typescript
	 * const chunkSize = (state: ComponentState) => {
	 *   return [6, 12, 18][state.renderPage] ?? 18;
	 * }
	 * ```
	 *
	 * It's important to note that this prop is used by default, but it can be ignored and you can return
	 * any amount of data to render by setting a custom {@link bScrolly.itemsFactory} for the component.
	 */
	@prop({type: [Number, Function]})
	readonly chunkSize?: number | ShouldPerform<number> = 10;

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
	 * This function is called in the {@link bScrolly.renderGuard} after other checks are completed.
	 *
	 * This function receives the component state as input, based on which the client
	 * should determine whether the component should render the next chunk of components.
	 *
	 * For example, if we want to render the next data chunk only when the client
	 * has seen all the main (type=item) components, we can implement the following function:
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
	@prop(Boolean)
	readonly disableObserver: boolean = false;

	/** {@link componentTypedEmitter} */
	@system<bScrolly>((ctx) => componentTypedEmitter(ctx))
	readonly componentEmitter!: ComponentTypedEmitter;

	/** {@link SlotsStateController} */
	@system<bScrolly>((ctx) => new SlotsStateController(ctx))
	readonly slotsStateController!: SlotsStateController;

	/** {@link ComponentInternalState} */
	@system<bScrolly>((ctx) => new ComponentInternalState(ctx))
	readonly componentInternalState!: ComponentInternalState;

	/** {@link ComponentFactory} */
	@system<bScrolly>((ctx) => new ComponentFactory(ctx))
	readonly componentFactory!: ComponentFactory;

	/** {@link Observer} */
	@system<bScrolly>((ctx) => new Observer(ctx))
	readonly observer!: Observer;

	protected override readonly $refs!: iData['$refs'] & ComponentRefs;
}

