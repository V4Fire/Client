/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import { CreateElement, RenderContext, VNode } from 'vue';
import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

const icons = (<any>require).context(
	'!!svg-sprite-loader?esModule=false!svg-fill-loader?fill=currentColor!sprite',
	true,
	/\.svg/
);

const iconsMap = $C(icons.keys()).reduce((map, el) => {
	map[normalize(el)] = el;
	return map;

}, {});

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}

@component({functional: true})
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

		if (!(iconId in iconsMap)) {
			throw new ReferenceError(`The specified icon "${iconId}" is not defined`);
		}

		const
			icon = icons(iconsMap[iconId]);

		this.$slots.svgLink = el('use', {
			attrs: {
				'xlink:href': `${location.pathname + location.search}#${icon.id}`
			}
		});

		return this.execRenderObject(TPLS[this.componentName].index());
	}
}
