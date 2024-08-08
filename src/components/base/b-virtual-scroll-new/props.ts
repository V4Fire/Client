/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'components/traits/i-items/i-items';
import type { CreateFromItemFn } from 'components/traits/i-items/i-items';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';

import type {

	VirtualScrollState,
	ComponentDb,
	RequestQueryFn,
	ShouldPerform,
	ItemsProcessors,

	ComponentItemFactory,
	ComponentItemType,
	ComponentItem,
	ComponentItemMeta

} from 'components/base/b-virtual-scroll-new/interface';

import { defaultShouldProps, componentItemType, itemsProcessors } from 'components/base/b-virtual-scroll-new/const';

import type { Observer } from 'components/base/b-virtual-scroll-new/modules/observer';

import iData, { component, prop } from 'components/super/i-data/i-data';

@component({partial: 'b-virtual-scroll-new'})
export default abstract class iVirtualScrollProps extends iData {
	/** {@link iItems.item} */
	readonly Item!: object;

	/** {@link iItems.Items} */
	readonly Items!: Array<this['Item']>;

	/** {@link iItems.item} */
	@prop({type: [String, Function]})
	readonly item?: iItems['item'];

	/** {@link iItems.items} */
	@prop({type: Array, required: false})
	readonly items: iItems['items'];

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
	 * Meta information for a component that will not be used during rendering,
	 * but will be available for reading/changing in `itemsProcessors`.
	 *
	 * If a function is provided, it will be called; otherwise, the value will be preserved "as is".
	 *
	 * @example
	 * ```typescript
	 * const itemMeta = (data) => ({
	 *   componentData: data
	 * })
	 * ```
	 */
	@prop({required: false})
	readonly itemMeta?: CreateFromItemFn<object, ComponentItemMeta>;

	/**
	 * Specifies the number of times the `tombstone` component will be rendered.
	 *
	 * This prop can be useful if you want to render multiple `tombstone` components
	 * using a single specified element. For example, if you set `tombstoneCount` to 3,
	 * then three `tombstone` components will be rendered on your page.
	 *
	 * @example
	 * ```
	 * < b-virtual-scroll-new :tombstoneCount = 3
	 *   < template #tombstone
	 *     < .&__skeleton
	 *       Skeleton
	 * ```
	 *
	 * ```html
	 * <div class="..__skeleton">Skeleton</div>
	 * <div class="..__skeleton">Skeleton</div>
	 * <div class="..__skeleton">Skeleton</div>
	 * ```
	 */
	@prop({type: Number, required: false})
	readonly tombstoneCount?: number;

	/**
	 * This factory function is used to pass information about the components that need to be rendered.
	 * The function should return an array of arbitrary length consisting of objects that satisfy the
	 * {@link ComponentItem} interface.
	 *
	 * By default, the rendering strategy is based on the `chunkSize` and `iItems` trait.
	 * In other words, the default implementation takes a data slice of length `chunkSize`
	 * and calls the `iItems` functions to generate a `ComponentItem` object.
	 *
	 * However, the client can implement any required strategy by overriding this function.
	 *
	 * For example, it is possible to define a function
	 * that takes the last loaded data and renders twice as many components:
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
		default: (state: VirtualScrollState, ctx: bVirtualScrollNew) => {
			const descriptors = ctx.getNextDataSlice(state, ctx.getChunkSize(state)).map((data, i) => ({
				key: ctx.itemKey?.(data, i),

				item: Object.isFunction(ctx.item) ? ctx.item(data, i) : ctx.item,
				type: Object.isFunction(ctx.itemType) ? ctx.itemType(data, i) : ctx.itemType,

				meta: {
					data,
					...Object.isFunction(ctx.itemMeta) ? ctx.itemMeta(data, i) : ctx.itemMeta
				},

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

	/**
	 * This processor function enables you to manipulate previously compiled
	 * {@link ComponentItem}s via {@link bVirtualScrollNew.itemsFactory}. It allows you to add components to render,
	 * mutate props, and add children. It acts as middleware for rendering components.
	 *
	 * Scenarios where you might use this functionality:
	 *
	 * **Scenario**: Add an advertisement component after each rendered component
	 * in `b-virtual-scroll-new` throughout the app.
	 *
	 * **Solution**: Instead of overriding {@link bVirtualScrollNew.itemsFactory} inline,
	 * use {@link bVirtualScrollNew.itemsProcessors} for a centralized solution.
	 *
	 * @example
	 * ```typescript
	 * const addAds = (items: ComponentItem[]) => {
	 *   const newItems = [];
	 *
	 *   items.forEach((item) => {
	 *     newItems.push(item);
	 *
	 *     if (item.type === 'item') {
	 *       newItems.push({
	 *         type: 'separator',
	 *         item: 'b-ads-component',
	 *         props: { prop: 'val' },
	 *         key: 'uniqueKey'
	 *       });
	 *     }
	 *   });
	 *
	 *   return newItems;
	 * }
	 * ```
	 *
	 * To set this function as the global component processor in `b-virtual-scroll-new`,
	 * override the `itemsProcessors` constant (in `base/b-virtual-scroll-new/const.ts`) of your layer and export it.
	 *
	 * @example
	 * ```typescript
	 * export const itemsProcessors = {
	 *   addAds
	 * }
	 * ```
	 *
	 * After redefining this, `b-virtual-scroll-new` renders `b-ads-component` after
	 * each `item` component.
	 *
	 * **Scenario**: Replace `b-card` components with `b-mega-card` throughout the app
	 * and modify props.
	 *
	 * **Solution**: Add a processor function that changes the component name and mutates props.
	 *
	 * @example
	 * ```typescript
	 * const itemsProcessors = {
	 *   addAds,
	 *   migrateCardComponent: (items: ComponentItem[]) => {
	 *     return items.map((item) => {
	 *       if (item.item === 'b-card') {
	 *         console.warn('Deprecation: b-card is deprecated.');
	 *
	 *         return {
	 *           ...item,
	 *           props: convertProps(item.props),
	 *           item: 'b-mega-card'
	 *         };
	 *       }
	 *
	 *       return item;
	 *     });
	 *   }
	 * }
	 * ```
	 */
	@prop({
		type: [Function, Object, Array],
		default: itemsProcessors
	})

	readonly itemsProcessors?: ItemsProcessors;

	override readonly DB!: ComponentDb;

	/**
	 * A function that returns the GET parameters for a request. This function is called for each request. It receives the
	 * current component state and should return the request parameters. These parameters are merged with the parameters
	 * from the `request` prop in favor of the second one.
	 *
	 * This function is useful when you need to pass pagination parameters or any other parameters that should not trigger
	 * a component's state reload, unlike changing the `request` prop.
	 *
	 * {@link RequestQueryFn}
	 */
	@prop({type: Function, required: false})
	readonly requestQuery?: RequestQueryFn;

	/**
	 * The amount of data required to perform one cycle of item rendering.
	 *
	 * This prop is primarily used to determine whether a specific action with the data needs to be performed
	 * ({@link bVirtualScrollNew.renderGuard}), and only secondarily for component rendering.
	 *
	 * By default, this prop is used in {@link bVirtualScrollNew.itemsFactory} to slice the data
	 * according to the {@link bVirtualScrollNew.chunkSize} and render components based on it.
	 * However, it is possible to define a custom {@link bVirtualScrollNew.itemsFactory} and render as many components
	 * as desired in one cycle of rendering. In this case, the `chunkSize` will only have significance for the data.
	 *
	 * This prop can also be a function that should return the amount of data required to perform one cycle of rendering.
	 * For example, different values can be specified depending on the rendering page:
	 *
	 * @example
	 * ```typescript
	 * const chunkSize = (state: VirtualScrollState) => {
	 *   return [6, 12, 18][state.renderPage] ?? 18;
	 * }
	 * ```
	 */
	@prop({type: [Number, Function]})
	readonly chunkSize: number | ShouldPerform<number> = 10;

	/**
	 * The amount of data that the component can preload and use afterwards.
	 * By default, `b-virtual-scroll-new` requests data only when it is not enough to render a chunk,
	 * but often it is necessary to have a behavior where data is preloaded in advance.
	 *
	 * This prop allows you to configure data preloading and allows `b-virtual-scroll-new`
	 * to preload as much data as you specify.
	 *
	 * The prop can also be a function, for example, you can configure data preloading depending on loadPage:
	 *
	 * ```typescript
	 * preloadAmount(state: VirtualScrollState, _ctx: bVirtualScrollNew): number {
	 *   const
	 *     chunkSize = this.getRequestChunkSize(feed),
	 *    {loadPage} = v;
	 *
	 *   return loadPage < 4 ? chunkSize : chunkSize * 4;
	 * }
	 * ```
	 */
	@prop({type: [Number, Function]})
	readonly preloadAmount: number | ShouldPerform<number> = 0;

	/**
	 * When this function returns true the component will stop to request new data.
	 * This function will be called on each data loading cycle.
	 */
	@prop({
		type: Function,
		default: defaultShouldProps.shouldStopRequestingData
	})

	readonly shouldStopRequestingData!: ShouldPerform;

	/**
	 * This function is called in the {@link bVirtualScrollNew.renderGuard} after other checks are completed.
	 *
	 * This function receives the component state as input, based on which the client
	 * should determine whether the component should render the next chunk of components.
	 *
	 * For example, if we want to render the next data chunk only when the client
	 * has seen all the main (`type=item`) components, we can implement the following function:
	 *
	 * @example
	 * ```typescript
	 * const shouldPerformDataRender = (state) => {
	 *   return state.isInitialRender || state.remainingItems === 0;
	 * }
	 * ```
	 */
	@prop({type: Function, default: defaultShouldProps.shouldPerformDataRender})
	readonly shouldPerformDataRender?: ShouldPerform<boolean>;

	/**
	 * Setting this property to false will disable the {@link Observer observation module}. This is useful when you
	 * want to implement lazy rendering not based on scrolling but on some other event, such as a click. In this case,
	 * you should use manual invocation of the `initLoadNext` method to render chunks.
	 */
	@prop(Boolean)
	readonly disableObserver: boolean = false;
}
