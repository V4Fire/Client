/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { CreateElement, RenderContext, VNode } from 'vue';
import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component({functional: true, tiny: true})
export default class bIcon extends iBlock {
	/**
	 * Block value
	 */
	@prop({type: String, required: false})
	readonly value?: string;

	/**
	 * Icon prefix
	 */
	@prop(String)
	readonly prfx: string = '';

	/**
	 * Tooltip text
	 */
	@prop({type: String, required: false})
	readonly hint?: string;

	/**
	 * Tooltip position
	 */
	@prop(String)
	readonly hintPos: string = 'bottom';

	/** @override */
	protected readonly $slots!: {
		svgLink: VNode;
	};

	/** @override */
	protected render(el: CreateElement, ctx: RenderContext): VNode {
		const
			iconId = ctx.props.value;

		if (iconId) {
			this.$slots.svgLink = el('use', {
				attrs: {
					'xlink:href': this.getIconLink(iconId)
				}
			});
		}

		return this.execRenderObject(TPLS[this.componentName].index());
	}
}
