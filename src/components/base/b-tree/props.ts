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
import type { Item, RenderFilter } from 'components/base/b-tree/interface';

import type AsyncRender from 'components/friends/async-render';
import type { TaskFilter } from 'components/friends/async-render';

@component()
export default abstract class bTreeProps extends iData {
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
	 * If true, then all nested elements are folded by default
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
	 * If true, then the component will be lazily rendered using `asyncRender`.
	 * This mode allows you to optimize the rendering of large trees,
	 * but there may be "flickering" when the component is completely re-rendered.
	 */
	@prop(Boolean)
	readonly lazyRender: boolean = false;

	/**
	 * A common filter to render items via `asyncRender`.
	 * It is used to optimize the process of rendering items.
	 * This option only works in `lazyRender` mode.
	 *
	 * {@link AsyncRender.iterate}
	 * {@link TaskFilter}
	 */
	@prop({
		type: Function,
		required: false,
		default(ctx: bTreeProps, item: unknown, i: number): CanPromise<boolean> {
			if (ctx.level === 0 && i < ctx.renderChunks) {
				return true;
			}

			return ctx.async.animationFrame().then(() => true);
		}
	})

	readonly renderFilter!: RenderFilter;

	/**
	 * A filter to render nested items via `asyncRender`.
	 * It is used to optimize the process of rendering child items.
	 * This option only works in `lazyRender` mode.
	 *
	 * {@link AsyncRender.iterate}
	 * {@link TaskFilter}
	 */
	@prop({type: Function, required: false})
	readonly nestedRenderFilter?: RenderFilter;

	/**
	 * Number of chunks to render via `asyncRender`.
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
	 * Component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;
}
