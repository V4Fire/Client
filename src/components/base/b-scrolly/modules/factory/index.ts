/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'components/friends/friend';
import type { VNodeDescriptor } from 'components/friends/vdom';

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';
import { componentRenderLocalEvents, componentRenderStrategy } from 'components/base/b-scrolly/const';

import * as forceUpdate from 'components/base/b-scrolly/modules/factory/engines/force-update';
import * as vdomRender from 'components/base/b-scrolly/modules/factory/engines/vdom';

/**
 * A friendly class that provides an API for component production, specifically tailored for the `bScrolly` class.
 */
export class ComponentFactory extends Friend {
	override readonly C!: bScrolly;

	/**
	 * Produces component items based on the current state and context.
	 * Returns an array of component items.
	 */
	produceComponentItems(): ComponentItem[] {
		const
			{ctx} = this;

		return ctx.itemsFactory(ctx.getComponentState(), ctx);
	}

	/**
	 * Produces DOM nodes from an array of component items.
	 * Returns an array of DOM nodes representing the component items.
	 *
	 * @param componentItems - An array of component items.
	 */
	produceNodes(componentItems: ComponentItem[]): HTMLElement[] {
		const createDescriptor = (item: ComponentItem): VNodeDescriptor => ({
			type: item.item,
			attrs: item.props,
			children: item.children
		});

		const descriptors = componentItems.map(createDescriptor);
		return this.callRenderEngine(descriptors);
	}

	/**
	 * Calls the render engine to render the components based on the provided descriptors.
	 * Returns an array of rendered DOM nodes.
	 *
	 * @param descriptors - An array of VNode descriptors.
	 */
	protected callRenderEngine(descriptors: VNodeDescriptor[]): HTMLElement[] {
		const
			{ctx} = this;

		let res;
		ctx.componentEmitter.emit(componentRenderLocalEvents.renderEngineStart);

		if (ctx.componentRenderStrategy === componentRenderStrategy.reuse) {
			res = forceUpdate.render(ctx, descriptors);
		} else {
			res = vdomRender.render(ctx, descriptors);
		}

		ctx.componentEmitter.emit(componentRenderLocalEvents.renderEngineDone);
		return res;
	}
}
