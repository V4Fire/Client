/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'components/traits/i-items/i-items';
import type iActiveItems from 'components/traits/i-active-items/i-active-items';

import iData, { prop, component } from 'components/super/i-data/i-data';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item, LazyRender, RenderFilter } from 'components/base/b-tree/interface';

import type AsyncRender from 'components/friends/async-render';
import type { TaskFilter } from 'components/friends/async-render';

@component({partial: 'bTree'})
export default abstract class iTreeProps extends iData {
	/** {@link iItems.Item} */
	readonly Item!: Item;

	/** {@link iItems.Items} */
	readonly Items!: Array<this['Item']>;

	/** {@link iActiveItems.ActiveProp} */
	readonly ActiveProp!: iActiveItems['ActiveProp'];

	/** {@link iActiveItems.Active} */
	readonly Active!: iActiveItems['Active'];

	/** {@link iItems.items} */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** {@link iItems.item} */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** {@link iActiveItems.activeProp} */
	@prop({required: false})
	readonly activeProp?: this['ActiveProp'];

	/** {@link iActiveItems.activeProp} */
	@prop({required: false})
	readonly modelValue?: this['ActiveProp'];

	/** {@link iActiveItems.multiple} */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** {@link iActiveItems.cancelable} */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/**
	 * If true, then all nested items are folded by default
	 */
	@prop(Boolean)
	readonly folded: boolean = true;

	/** {@link iItems.itemKey} */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** {@link iItems.itemProps} */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/**
	 * This option enables lazy rendering mode for the tree.
	 * Lazy rendering is extremely useful when displaying large trees
	 * and can have a dramatic effect on the rendering speed of the component.
	 *
	 * Lazy rendering has several operating strategies:
	 *
	 * 1. `'folded'` - In this mode, collapsed nodes will not be rendered.
	 *   This is the default strategy.
	 *
	 * 2. `'items'` - In this mode, all nodes of the tree are rendered asynchronously using asyncRender.
	 *   You can fine-tune the rendering strategy using the `renderFilter`, `nestedRenderFilter`,
	 *   and `renderChunks` props.
	 *   Please note that in this rendering mode, the tree may "flicker" during complete redrawing.
	 *
	 * 3. `'all'` - In this mode, the tree is rendered fully lazily, essentially combining the `folded` and `items` modes.
	 *
	 * Also, for backward compatibility, this prop can accept boolean values:
	 *
	 * 1. `false` - lazy rendering is disabled.
	 * 2. `true` - lazy rendering in the `'items'` mode.
	 */
	@prop([Boolean, String])
	readonly lazyRender: LazyRender = 'folded';

	/**
	 * A common filter to render items via `asyncRender`.
	 * It is used to optimize the rendering process for items.
	 * This option only works in `lazyRender` mode.
	 *
	 * {@link AsyncRender.iterate}
	 * {@link TaskFilter}
	 */
	@prop({
		type: Function,
		required: false,
		default(ctx: iTreeProps, item: unknown, i: number): CanPromise<boolean> {
			if (ctx.level === 0 && i < ctx.renderChunks) {
				return true;
			}

			return ctx.async.animationFrame().then(() => true);
		}
	})

	readonly renderFilter!: RenderFilter;

	/**
	 * A filter to render nested items via `asyncRender`.
	 * It is used to optimize the rendering process for child items.
	 * This option only works in `lazyRender` mode.
	 *
	 * {@link AsyncRender.iterate}
	 * {@link TaskFilter}
	 */
	@prop({type: Function, required: false})
	readonly nestedRenderFilter?: RenderFilter;

	/**
	 * How many sections of items will be rendered at a time using `asyncRender`.
	 * This option only works in `lazyRender` mode.
	 */
	@prop(Number)
	readonly renderChunks: number = 5;

	/**
	 * A link to the top-level component (internal parameter)
	 */
	@prop({type: Object, required: false})
	readonly topProp?: bTree;

	/**
	 * The component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;
}
