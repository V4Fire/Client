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
 * Friendly to the `bScrolly` class.
 * Provides an API for component producing
 */
export class ComponentFactory extends Friend {
	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * @param data
	 */
	produceComponentItems(data: object[]): ComponentItem[] {
		const
			{ctx} = this;

		return ctx.itemsFactory(ctx, data);
	}

	/**
	 * @param data
	 */
	produceNodes(componentItems: ComponentItem[]): HTMLElement[] {
		const createDescriptor = (item: ComponentItem): VNodeDescriptor => ({
			type: item.item,
			attrs: item.props,
			children: item.children
		});

		const
			descriptors = componentItems.map(createDescriptor);

		return this.callRenderEngine(descriptors);
	}

	/**
	 * @param descriptors
	 */
	protected callRenderEngine(descriptors: VNodeDescriptor[]): HTMLElement[] {
		const
			{ctx} = this;

		let res;
		ctx.componentEmitter.emit(componentRenderLocalEvents.renderEngineStart);

		if (ctx.componentRenderStrategy === componentRenderStrategy.forceRenderChunk) {
			res = forceUpdate.render(ctx, descriptors);

		} else {
			res = vdomRender.render(ctx, descriptors);
		}

		ctx.componentEmitter.emit(componentRenderLocalEvents.renderEngineDone);
		return res;
	}
}
