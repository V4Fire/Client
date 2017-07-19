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

@component({functional: true})
export default class bFlagIcon extends iFunctional {
	/** @override */
	rootTag: string = 'span';

	/**
	 * Block value
	 */
	value: string;

	/** @override */
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {
		const
			p = ctx.props;

		const value = {
			en: 'gb',
			zh: 'cn',
			sp: 'es'
		}[p.value] || p.value;

		return super.render(el, ctx, attrs, [].concat(children || [], [
			el('span', {
				class: [
					'flag-icon',
					`flag-icon-${value}`
				]
			})
		]));
	}
}
