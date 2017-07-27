'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iFunctional from 'super/i-functional/i-functional';
import { component } from 'core/component';

const icons = require.context(
	'!!svg-sprite?esModule=false!replace?flags=g&regex=#\\w{6}&sub=currentColor!assets/svg',
	false,
	/\.svg$/
);

const
	iconsMap = Object.createMap(icons.keys());

@component({functional: true})
export default class bIcon extends iFunctional {
	/** @override */
	rootTag: string = 'span';

	/**
	 * Block value
	 */
	value: ?string;

	/**
	 * Icon prefix
	 */
	prfx: string = '';

	/**
	 * Tooltip text
	 */
	hint: ?string;

	/**
	 * Tooltip position
	 */
	hintPos: string = 'bottom';

	/** @override */
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {
		attrs = attrs || {};

		const
			p = ctx.props,
			b = p.componentName,
			icon = `./${(p.prfx + p.value).replace(/&/g, '_and_').underscore()}.svg`;

		if (!p.value || icon in iconsMap === false) {
			return;
		}

		attrs.class = (attrs.class || []).concat('g-hint', `g-hint_pos_${p.hintPos}`);
		attrs.attrs = Object.assign({}, attrs.attrs, {'data-hint': t(p.hint)});

		return super.render(el, ctx, attrs, [].concat(children || [], [
			el('svg', {class: `${b}__svg`}, [
				el('use', {
					class: [`${b}__link`],
					attrs: {
						'xlink:href': `${location.pathname + location.search}#${icons(icon).id}`
					}
				})
			])
		]));
	}
}
